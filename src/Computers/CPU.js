const   Task = require('../Tasks/Task'),
        EventListener = require('../EventListener'),
        Decimal = require('break_infinity.js'),
        cpus = require('./cpus');

class CPUFullError extends Error{};
class CPUDuplicateTaskError extends Error{};
class InvalidTaskError extends Error{};

const DEFAULT_PROCESSOR_SPEED = 20;

class CPU extends EventListener
{
    constructor(name, speed, lifeCycle, lifeCycleUsed, living)
    {
        super();
        /**
         * @type {string}
         */
        this.name = name?name:"Garbo Processor";
        /**
         * @type {Decimal}
         */
        this.speed = speed?new Decimal(speed):new Decimal(DEFAULT_PROCESSOR_SPEED);
        /**
         * @type {Array.<Task>}
         */
        this.tasks = [];
        /**
         * @type {Decimal}
         */
        this.lifeCycle = new Decimal(lifeCycle?lifeCycle:1000);
        this.lifeCycleUsed = new Decimal(lifeCycleUsed?lifeCycleUsed:0);
        this.living = living !== null?living:true;
    }

    toJSON()
    {
        return {
            name:this.name,
            speed:this.speed.toString(),
            lifeCycle:this.lifeCycle.toString(),
            lifeCycleUsed:this.lifeCycleUsed.toString(),
            living:this.living
        }
    }

    static fromJSON(json)
    {
        return new CPU(json.name, json.speed, json.lifeCycle, json.lifeCycleUsed, json.living);
    }

    static getCPUs()
    {
        return cpus;
    }

    tick()
    {

    }

    /**
     * @param cpuData
     */
    static getPriceFor(cpuData)
    {
        return new Decimal(cpuData.lifeCycle * cpuData.speed / 20);
    }
}

module.exports = CPU;
