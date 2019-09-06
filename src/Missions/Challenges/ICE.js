const   Challenge = require('./Challenge'),
        helpers = require('../../Helpers');

class ICE extends Challenge
{
    constructor(difficulty)
    {
        super('ICE', difficulty);
        /**
         * @type {number}
         */
        this.width = helpers.getRandomIntegerBetween(8,10);
        /**
         * @type {number} We always want this to be odd, because 0 is in the middle of its range
         */
        this.height = helpers.getRandomIntegerBetween(4, 6) * 2 + 1;


        /**
         * @type {number}
         */
        this.size = this.width * this.height;

    }

    get calculatedDifficulty()
    {
        return this.size;
    }
}

module.exports = ICE;
