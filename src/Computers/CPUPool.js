const   CPU = require('./CPU'),
        Task = require('../Tasks/Task'),
        helpers = require('../Helpers'),
        EventListener = require('../EventListener');

/*
 * Custom exceptions
 */
class NoFreeCPUCyclesError extends Error{};
class CPUDuplicateTaskError extends Error{};
class InvalidTaskError extends Error{};

class CPUPool extends EventListener
{
    constructor(cpus)
    {
        super();
        /**
         * @type {Array.<CPU>}
         */
        this.cpus = [];
        /**
         * @type {number} The average speed of all cpus in the pool
         */
        this.averageSpeed = 0;
        /**
         * @type {number} The average speed of all cpus in the pool
         */
        this.totalSpeed = 0;
        /**
         * @type {number} The total cycles used by all tasks
         */
        this.load = 0;
        /**
         * * @type {Array.<Task>}
         */
        this.tasks = [];
        /**
         * @type {number} The number of CPUs. Because entries can be null, this needs to be counted
         */
        this.cpuCount = 0;

        for(let cpu of cpus)
        {
            this.addCPU(cpu);
        }
    }

    /**
     * @param {CPU} cpu
     */
    addCPU(cpu)
    {
        this.setCPUSlot(this.cpus.length, cpu);
    }

    setCPUSlot(slot, cpu)
    {
        if(cpu)
        {
            cpu.once('burnOut', () => {
                this.flagCPUDead(slot, cpu);
            });
            this.cpus[slot] = cpu;
            this.update();
        }
        else
        {
            this.cpus[slot] = null;
        }
    }

    flagCPUDead(slot, cpu)
    {
        this.trigger('cpuBurnedOut');
        this.update();
        if(this.cpuCount === 0)
        {
            this.trigger('cpuPoolEmpty');
        }
    }

    update()
    {
        this.averageSpeed = 0;
        this.totalSpeed = 0;
        this.cpuCount = 0;
        for(let cpu of this.cpus)
        {
            if(cpu && cpu.living)
            {
                this.totalSpeed += cpu.speed;
                this.cpuCount ++;
            }
        }
        this.averageSpeed = this.totalSpeed / this.cpuCount;
    }

    /**
     * figure out how many cycles to assign the task. This number will be the larger of the minimum required cycles
     * and 1/nth of the total cycles available to the pool (where n is the number of total tasks being run, including
     * this task).
     * @param {Task} task   The task to figure out the cycles for
     * @returns {number}   The number of cycles to assign the task
     */
    getCyclesForTask(task)
    {
        return Math.max(task.minimumRequiredCycles, Math.floor(this.totalSpeed / (this.tasks.length + 1)));
    }

    /**
     * Figure out how many cycles to remove from all of the current tasks in the pool and do so.
     * This method will keep a tally of the freed cycles, as no task will lower its assigned cycles below the minimum
     * required amount.
     * @param task
     * @returns {number}
     */
    balanceTaskLoadForNewTask(task)
    {
        // get the number of cycles to assign
        let cyclesToAssign = this.getCyclesForTask(task);
        if(this.tasks.length === 0)
        {
            return cyclesToAssign;
        }

        let idealCyclesToAssign = cyclesToAssign;
        if(this.tasks.length > 0)
        {
            // average that out
            let cyclesToTryToTakeAwayFromEachProcess = Math.ceil(idealCyclesToAssign /this.tasks.length),
                cyclesFreedUp = 0;

            for(let task of this.tasks)
            {
                // add the actual amount freed up to the total freed
                cyclesFreedUp += task.freeCycles(cyclesToTryToTakeAwayFromEachProcess);
            }
            cyclesToAssign = cyclesFreedUp;
        }
        return cyclesToAssign;
    }

    /**
     * Add a task to the cpu pool
     * @param {Task} task   The task to be added
     */
    addTask(task)
    {
        // if it's not a task, complain
        if (!(task instanceof Task))
        {
            throw new InvalidTaskError('Tried to add a non task object to a processor');
        }
        // if it's already in the pool, complain
        if(this.tasks.indexOf(task)>=0)
        {
            throw new CPUDuplicateTaskError('This task is already on the CPU');
        }
        let freeCycles = this.availableCycles;
        // if you don't have the free oomph, complain
        if(task.minimumRequiredCycles > freeCycles)
        {
            throw new NoFreeCPUCyclesError(`CPU pool does not have the required cycles for ${task.name}. Need ${task.minimumRequiredCycles.toString()} but only have ${freeCycles}.`);
        }

        // figure out how many cycles to assign
        let cyclesToAssign = this.balanceTaskLoadForNewTask(task);

        task.setCyclesPerTick(cyclesToAssign);
        task.on('complete', ()=>{ this.completeTask(task); });

        this.load += task.minimumRequiredCycles;
        this.tasks.push(task);
    }

    /**
     * Finish a task and remove it from the cpu pool
     * @param {Task} task
     */
    completeTask(task)
    {
        let freedCycles = task.cyclesPerTick;
        helpers.removeArrayElement(this.tasks, task);
        this.load -= task.minimumRequiredCycles;

        if(this.tasks.length >= 1)
        {
            let freedCyclesPerTick = Math.floor(freedCycles / this.tasks.length);
            let i = 0;
            while(i < this.tasks.length && freedCycles > (0))
            {
                let task = this.tasks[i];
                freedCycles -= freedCyclesPerTick;
                task.addCycles(freedCyclesPerTick);
                i++;
            }
        }
        this.trigger('taskComplete');
    }

    get availableCycles()
    {
        return this.totalSpeed - this.load;
    }

    get averageLoad()
    {
        return this.load / this.cpuCount;
    }

    tick()
    {
        for(let task of this.tasks)
        {
            task.tick();
        }
        for(let cpu of this.cpus)
        {
            if(cpu && cpu.remainingLifeCycle > 0)
            {
                cpu.tick(this.averageLoad);
            }
        }
    }
}

module.exports = CPUPool;
