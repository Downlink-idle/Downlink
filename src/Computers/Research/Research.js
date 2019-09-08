const   helpers = require('../../Helpers'),
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

    toJSON()
    {
        return {
            property:this.property,
            amount:this.amount
        }
    }
}

class Research extends EventListener
{
    constructor(name, classEffected, propertiesEffected, researchTicks, amountDone)
    {
        super();
        this.name = name;
        this.classEffected = classEffected;
        this.propertiesEffected = propertiesEffected;
        this.researchTicks = researchTicks;
        this.amountDone = amountDone;
        this.researchCompleted = amountDone >= researchTicks;
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

    setAmountDone(amountDone)
    {
        this.amountDone = Math.min(amountDone, this.researchTicks);
    }

    toJSON()
    {
        return {
            name:this.name,
            classEffected:this.classEffected.constructor.name,
            propertiesEffected:this.propertiesEffected,
            researchTicks:this.researchTicks,
            amountDone:this.amountDone
        };
    }

    static fromJSON(json)
    {
        let properties = [];
        for(let property of json.propertiesEffected)
        {
            properties.push(new ResearchEffect(property.property, property.amount));
        }
        return new Research(
            json.name,
            upgradeables[json.className],
            properties,
            json.researchTicks,
            json.amountDone?json.amountDone:0
        )
    }

    static loadJSON(researchData)
    {
        let researches = {}, allResearches = {};
        for (let className in researchData)
        {
            let classResearchData = researchData[className];
            researches[className] = [];
            for (let researchDatum of classResearchData)
            {
                researchDatum.className = className;
                let research = this.fromJSON(researchDatum);
                researches[className].push(research);
                allResearches[researchDatum.name] = research;
            }
        }
        this.categoryResearches = researches;
        this.allResearches = allResearches;
        this.applySavedResearch(Object.values(allResearches).filter(research=>research.researchCompleted))
    }

    static applySavedResearch(savedResearches)
    {
        savedResearches.forEach((research)=>{
            research.completeResearch();
        });
    }

    static loadDefaultJSON()
    {
        const researchData = require('./researchData');
        this.loadJSON(researchData);
    }

    static get availableResearch()
    {
        let research = {};
        for(let researchType in this.categoryResearches)
        {
            research[researchType] = this.categoryResearches[researchType].filter(research => !research.researchCompleted);
        }
        return research;
    }

    static getItemByName(name)
    {
        return Research.allResearches[name];
    }
}
const researchFactor = 6000;

module.exports = Research;
