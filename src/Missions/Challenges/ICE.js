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
         * @type {number}
         */
        this.height = helpers.getRandomIntegerBetween(3,5);
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
