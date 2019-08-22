/**
 * This class largely exists to make commenting cleaner
 */
class MissionDifficulty
{
    /**
     * @param {number} modifier
     * @param {string} serverType
     */
    constructor(modifier, serverType)
    {
        /**
         * @type {number}   A modifier to the reward given for the mission as a number
         */
        this.modifier = modifier;
        /**
         * @type {string}   A name for the type of server you are attacking
         */
        this.serverType = serverType;
    }
}

module.exports = MissionDifficulty;
