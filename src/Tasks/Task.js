const   EventListener = require('../EventListener'),
        Decimal = require('break_infinity.js');

class CPUOverloadError extends Error
{
    constructor(task, cycles)
    {
        super(`Trying to run a task (${task.name}) with fewer cycles ${cycles} than it requires ${task.minimumRequiredCycles}`);
        this.task = task;
        this.cycles = cycles;
    }
}

class Task extends EventListener
{
    constructor(name, challenge, minimumRequiredCycles)
    {
        super();
        this.name= name;
        this.minimumRequiredCycles = minimumRequiredCycles?minimumRequiredCycles:10;
        this.cyclesPerTick = 0;
        this.weight = 1;
        this.difficultyRatio = 0;
        this.ticksTaken = 0;
        this.working = false;
        this.completed = false;
        this.challenge = challenge.setTask(this);
    }

    setCyclesPerTick(cyclesPerTick)
    {
        if(cyclesPerTick < this.minimumRequiredCycles)
        {
            throw new CPUOverloadError(this, cyclesPerTick);
        }
        this.cyclesPerTick = cyclesPerTick;
        return this;
    }

    addCycles(tickIncrease)
    {
        this.cyclesPerTick += tickIncrease;
    }

    /**
     * Try to release a number of ticks from the task and return the number actually released
     * @param {number} tickReduction
     * @returns {number|*}
     */
    freeCycles(tickReduction)
    {
        // figure out how many freeable ticks we have
        const freeableTicks = this.cyclesPerTick-this.minimumRequiredCycles;
        // if it's one or less, free none and return 0
        let ticksToFree = 0;
        if(freeableTicks > 1)
        {
            if(freeableTicks > tickReduction)
            {
                ticksToFree = tickReduction;
            }
            else
            {
                ticksToFree = Math.floor(freeableTicks / 2);
            }
        }
        this.cyclesPerTick -= ticksToFree;
        return ticksToFree;
    }

    signalComplete()
    {
        this.working = false;
        this.completed = true;
        this.trigger('complete');
        this.challenge.solve();
    }

    getRewardRatio()
    {
        return 0;
        //return this.difficultyRatio / Math.pow(this.ticksTaken, 2.5);
    }

    tick()
    {
        this.ticksTaken++;
    }
}

module.exports = Task;
