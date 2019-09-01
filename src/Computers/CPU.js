const   Task = require('./Tasks/Task'),
        EventListener = require('../EventListener'),
        cpus = require('./cpus');

class CPUFullError extends Error{};
class CPUDuplicateTaskError extends Error{};
class InvalidTaskError extends Error{};

const CPU_COST_MODIFIER = 4000;

class CPU extends EventListener
{
    constructor(name, speed, color, lifeCycle, lifeCycleUsed)
    {
        super();
        let defaultCPU = cpus[0];
        /**
         * @type {string}
         */
        this.name = name?name:defaultCPU.name;
        /**
         * @type {number}
         */
        this.speed = parseInt(speed?speed:defaultCPU.speed);
        /**
         * @type {string} the rgb() color for the cpu
         */
        this.color = color?color:defaultCPU.color;
        /**
         * @type {Array.<Task>}
         */
        this.tasks = [];
        /**
         * @type {number}
         */
        this.lifeCycle = parseInt(lifeCycle?lifeCycle:defaultCPU.lifeCycle);
        this.lifeCycleUsed = parseInt(lifeCycleUsed?lifeCycleUsed:0);
        this.living = this.lifeCycleUsed < this.lifeCycle;
    }

    get remainingLifeCycle()
    {
        return Math.max(this.lifeCycle - this.lifeCycleUsed, 0);
    }

    get health()
    {
        let decimal = this.remainingLifeCycle / this.lifeCycle,
            percentage = decimal * 100,
            fixed = percentage.toFixed(2);
        if(this.lifeCycleUsed >= this.lifeCycle)
        {
            return 0;
        }

        return fixed;
    }

    toJSON()
    {
        let json = {
            name:this.name,
            speed:this.speed.toString(),
            color:this.color,
            lifeCycle:this.lifeCycle.toString(),
            lifeCycleUsed:this.lifeCycleUsed.toString()
        };
        return json;
    }

    static fromJSON(json)
    {
        return new CPU(json.name, json.speed, json.color, json.lifeCycle, json.lifeCycleUsed);
    }

    static getCPUs()
    {
        return cpus;
    }

    tick(load)
    {
        this.lifeCycleUsed += Math.round(load);
        if(this.lifeCycleUsed >= this.lifeCycle)
        {
            this.living = false;
            this.trigger('burnOut');
        }
        this.trigger('lifeCycleUpdated');
    }

    /**
     * @param cpuData
     */
    static getPriceFor(cpuData)
    {
        return cpuData.lifeCycle * cpuData.speed / CPU_COST_MODIFIER;
    }

    static get deadCPUColor()
    {
        return 'rgb(255, 0, 0)';
    }
}

module.exports = CPU;
