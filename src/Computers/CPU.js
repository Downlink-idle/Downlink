const   Task = require('../Tasks/Task'),
        EventListener = require('../EventListener'),
        cpus = require('./cpus');

class CPUFullError extends Error{};
class CPUDuplicateTaskError extends Error{};
class InvalidTaskError extends Error{};

class CPU extends EventListener
{
    constructor(name, speed, color, lifeCycle, lifeCycleUsed, living)
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
        this.lifeCycle = lifeCycle?lifeCycle:defaultCPU.lifeCycle;
        this.lifeCycleUsed = lifeCycleUsed?lifeCycleUsed:0;
        this.living = living !== null?living:true;
    }

    toJSON()
    {
        return {
            name:this.name,
            speed:this.speed.toString(),
            color:this.color,
            lifeCycle:this.lifeCycle.toString(),
            lifeCycleUsed:this.lifeCycleUsed.toString(),
            living:this.living
        }
    }

    static fromJSON(json)
    {
        return new CPU(json.name, json.speed, json.color, json.lifeCycle, json.lifeCycleUsed, json.living);
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
            this.trigger('CPUDied');
        }
    }

    /**
     * @param cpuData
     */
    static getPriceFor(cpuData)
    {
        return cpuData.lifeCycle * cpuData.speed / 20;
    }
}

module.exports = CPU;
