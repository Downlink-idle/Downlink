module.exports = ($)=>
{
    class Challenge
    {
        /**
         * An abstract class to represent all challenges a MissionComputer might have
         * I could namescape this in Missions, and may do this later but currently exists in the namespace
         * Downlink.Challenges.Challenge
         *
         * @param {string} name         The name of the challenge, useful for UI purposes
         * @param {number} difficulty   An int to describe in some abstract manner what reward ratio this challenge should provide.
         *                              Provided in the form of an integer.
         */
        constructor(name, difficulty)
        {
            this.name = name;
            this.difficulty = difficulty;
            this.solved = false;
        }

        /**
         * A method to signal to the Mission Computer, or localhost that a Challenge has been complete.
         */
        signalComplete()
        {
            $(this).trigger('solved');
            this.solved = true;
        }
    }

    return Challenge;
};
