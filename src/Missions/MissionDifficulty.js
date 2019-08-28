const Decimal = require('break_infinity.js');

/**
 * This class largely exists to make commenting cleaner
 */
class MissionDifficulty
{
    /**
     * @param {string} name         The name of the difficulty
     * @param {Decimal} modifier     The modifier of the difficulty
     * @param {string} serverType   The server type this difficulty faces
     */
    constructor(name, modifier, serverType)
    {
        this.nanme = name;
        /**
         * @type {Decimal}   A modifier to the reward given for the mission as a number
         */
        this.modifier = modifier;
        /**
         * @type {Decimal}   A name for the type of server you are attacking
         */
        this.serverType = serverType;
    }

}

MissionDifficulty.DIFFICULTIES = {
    EASY:new MissionDifficulty("Easy", new Decimal(1), "Server"),
    MEDIUM:new MissionDifficulty("Medium", new Decimal(5), "Cluster"),
    HARD:new MissionDifficulty("Hard", new Decimal(10), "Farm"),
};

module.exports = MissionDifficulty;
