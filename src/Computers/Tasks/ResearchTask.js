const   Task = require ('./Task'),
        helpers = require('../../Helpers');

class ResearchTask extends Task
{
    /**
     * @param {Research} researchItem
     */
    constructor(researchItem)
    {
        super('Researching '+researchItem.name, researchItem, 0);
        this.researchDone = 0;
        this.researchItem = researchItem;
        this.minimumRequiredCycles = 10;
    }

    processTick()
    {
        this.researchDone += this.cyclesPerTick;
        if(this.researchDone >= this.researchItem.researchTicks)
        {
            this.signalComplete();
        }
    }

}

module.exports = ResearchTask;
