const EventListener = require('./EventListener');

class Upgradeable extends EventListener
{
    static get upgrades()
    {
        return this.hasOwnProperty('_upgrades')?this._upgrades:void 0;
    }

    static set upgrades(upgrades)
    {
        this._upgrades = upgrades;
    }

    /**
     *
     * @param {Array.<ResearchEffect>} upgradeEffects
     */
    static applyResearchUpgrade(upgradeEffects)
    {
        if(!this.upgrades)
        {
            this.upgrades = [];
        }
        for(let effect of upgradeEffects)
        {
            if(!this.upgrades[effect.property])
            {
                this.upgrades[effect.property] = [];
            }
            this.upgrades[effect.property].push(effect.amount);
        }
        this.trigger('upgrade');
    }
}

module.exports = Upgradeable;
