const   EventListener = require('../../EventListener'),
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
        this.minimumRequiredCycles = minimumRequiredCycles?minimumRequiredCycles:challenge.difficulty;
        this.cyclesPerTick = 0;
        this.weight = 1;
        this.difficultyRatio = 0;
        this.ticksTaken = 0;
        this.working = true;
        this.completed = false;
        this.challenge = challenge.setTask(this);
        this.loadPercentage = 0;
    }

    get hash()
    {
        return this.challenge.hash;
    }

    alterWeight(direction)
    {
        if(direction > 0)
        {
            this.weight *= 2;
        }
        else
        {
            this.weight /= 2;
        }
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

    setLoadPercentage(loadPercentage)
    {
        this.loadPercentage = loadPercentage;
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

    tick()
    {
        if(this.working)
        {
            this.ticksTaken++;
            this.processTick();
            return this.minimumRequiredCycles;
        }
        return 0;
    }

    pause()
    {
        this.working = false;
        return this;
    }

    resume()
    {
        this.working = true;
        return this;
    }
}

module.exports = Task;
