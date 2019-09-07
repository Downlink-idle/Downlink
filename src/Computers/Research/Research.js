const   helpers = require('../../Helpers'),
        researchData = require('./researchData'),
        upgradeables = {
            CPU:require('../CPU'),
            Connection:require('../../Connection'),
        },
        EventListener = require('../../EventListener');

class ResearchEffect
{
    constructor(property, amount)
    {
        this.property = property;
        this.amount = amount;
    }
}

class Research extends EventListener
{
    constructor(name, classEffected, propertiesEffected, researchTicks, researchComplete)
    {
        super();
        this.name = name;
        this.classEffected = classEffected;
        this.propertiesEffected = propertiesEffected;
        this.researchTicks = researchTicks;
        this.researchCompleted = researchComplete;
    }

    setTask(task)
    {
        this.task = task;
        return this;
    }

    solve()
    {
        this.completeResearch();
    }

    completeResearch()
    {
        this.researchCompleted = true;
        this.classEffected.applyResearchUpgrade(this.propertiesEffected);
        this.trigger('complete')
    }

    static get availableResearch()
    {
        let research = {};
        for(let researchType in researches)
        {
            research[researchType] = researches[researchType].filter(research => !research.researchCompleted);
        }
        return research;
    }

    static getItemByName(name)
    {
        return allResearches[name];
    }
}
const researchFactor = 6000;

let researches = {},
    allResearches = {};
for(let classEffected in researchData)
{
    let classResearchData = researchData[classEffected];
    researches[classEffected] = [];
    for(let researchDatum of classResearchData)
    {
        let researchEffects = [],
            researchAmount = researchFactor;
        for(let property in researchDatum.effects)
        {
            researchEffects.push(new ResearchEffect(property, researchDatum.effects[property]));
        }
        let research = new Research(researchDatum.name, upgradeables[classEffected], researchEffects, researchDatum.researchTicks, false);
        researches[classEffected].push(research);
        allResearches[researchDatum.name] = research;
    }
}

module.exports = Research;
