const EventListener = require('../EventListener');

class Task extends EventListener
{
    constructor(name, minimumRequiredCycles)
    {
        super();
        this.name= name;
        this.minimumRequiredCycles = minimumRequiredCycles?minimumRequiredCycles:10;
        this.cyclesPerTick = 0;
        this.weight = 1;
        this.difficultyRatio = 0;
        this.ticksTaken = 0;
        this.working = false;
        this.taskCompleted = false;
    }

    setCyclesPerTick(cyclesPerTick)
    {
        if(cyclesPerTick < this.minimumRequiredCycles)
        {
            throw new Error("Trying to run a task with fewer cycles than it requires");
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
     * @param tickReduction
     * @returns {number|*}
     */
    freeCycles(tickReduction)
    {
        if(this.cyclesPerTick <= (tickReduction + this.minimumRequiredCycles))
        {

            if(this.cyclesPerTick > 1)
            {
                let halfMyCyclesRoundedDown = Math.floor(this.cyclesPerTick / 2);
                this.cyclesPerTick -= halfMyCyclesRoundedDown;
                return halfMyCyclesRoundedDown;
            }
            return 0;
        }
        this.cyclesPerTick -= tickReduction;
        return tickReduction;
    }

    signalComplete()
    {
        this.working = false;
        this.taskCompleted = true;
        this.trigger('complete');
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
