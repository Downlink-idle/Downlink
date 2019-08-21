class Task
{
    constructor(name, minimumRequiredCycles)
    {
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
        this.cyclesPerTick = cyclesPerTick;
        return this;
    }

    addCycles(tickIncrease)
    {
        this.cyclesPerTick += tickIncrease;
    }

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
        $(this).trigger('complete');
        this.working = false;
        this.taskCompleted = true;
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
