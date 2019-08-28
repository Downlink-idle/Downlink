    const   Task = require('../Tasks/Task'),
            EventListener = require('../EventListener'),
            Decimal = require('break_infinity.js');

    class CPUFullError extends Error{};
    class CPUDuplicateTaskError extends Error{};
    class InvalidTaskError extends Error{};

    const DEFAULT_PROCESSOR_SPEED = 20;

    class CPU extends EventListener
    {
        constructor(name, speed)
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
        }

        toJSON()
        {
            return {
                name:this.name,
                speed:this.speed.toJSON()
            }
        }

        /**
         *  @param task
         * @returns {Decimal}
         */
        getCyclesForTask(task)
        {
            // the amount of cycles the cpu is going to devote to each task is 1/nth of the total cycles
            // where n is the total of tasks that will be run including this task
            // I'm going to fudge with that a bit to make sure no rogue amounts start appearing and dissappearing
            return Decimal.max(task.minimumRequiredCycles, Decimal.floor(this.speed.div(this.tasks.length + 1)));
        }

        addTask(task)
        {
            if (!(task instanceof Task))
            {
                throw new InvalidTaskError('Tried to add a non task object to a processor');
            }
            if(this.tasks.indexOf(task)>=0)
            {
                throw new CPUDuplicateTaskError('This task is already on the CPU');
            }


            let cyclesToAssign = this.getCyclesForTask(task),
                idealCyclesToAssign = cyclesToAssign;
            //if(cyclesToAssign > (this.speed - this.load))
            if(cyclesToAssign.greaterThan(this.speed.sub(this.load)))
            {
                throw new CPUFullError('Tried to add more cycles to the CPU than there are free cycles for');
            }

            if(this.tasks.length > 0)
            {
                let cyclesToTryToTakeAwayFromEachProcess = Math.ceil(idealCyclesToAssign / this.tasks.length),
                    cyclesFreedUp = 0;

                for(let task of this.tasks)
                {
                    cyclesFreedUp += task.freeCycles(cyclesToTryToTakeAwayFromEachProcess);
                }
                cyclesToAssign = cyclesFreedUp;
            }
            task.setCyclesPerTick(cyclesToAssign);
            this.tasks.push(task);
            task.on('complete', ()=>{ this.completeTask(task); });
            return this;
        }

        completeTask(task)
        {
            let freedCycles = task.cyclesPerTick;
            this.tasks.removeElement(task);

            if(this.tasks.length >= 1)
            {
                let freedCyclesPerTick = Math.floor(freedCycles/this.tasks.length);
                let i = 0;
                while(i < this.tasks.length && freedCycles > 0)
                {
                    let task = this.tasks[i];
                    freedCycles -= freedCyclesPerTick;
                    task.addCycles(freedCyclesPerTick);
                    i++;
                }
            }
            this.trigger('taskComplete');
        }

        tick()
        {
            for(let task of this.tasks)
            {
                task.tick();
            }
        }

        get load()
        {
            let minimum = new Decimal(0);
            for(let task of this.tasks)
            {
                minimum = minimum.plus(task.minimumRequiredCycles);
            }
            return minimum;
        }
    }

module.exports = CPU;