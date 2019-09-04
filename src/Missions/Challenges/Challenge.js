const EventListener = require('../../EventListener');

class Challenge extends EventListener
{
    /**
     * An abstract class to represent all challenges a MissionComputer might have
     * I could namescape this in Missions, and may do this later but currently exists in the namespace
     * Downlink.Challenges.Challenge
     *
     * @param {string} name         The name of the challenge, useful for UI purposes
     * @param {number} difficulty   An int to describe in some abstract manner what reward ratio this challenge
     *     should provide. Provided in the form of an integer.
     */
    constructor(name, difficulty)
    {
        super();
        this.name = name;
        this.difficulty = difficulty;
        this.solved = false;
        this.task = null;
        /**
         * @type {MissionComputer}
         */
        this.computer = null;
    }

    get hash()
    {
        return `${this.computer.uniqueID}_${this.name}`;
    }

    /**
     * @param {MissionComputer} computer
     */
    setComputer(computer)
    {
        this.computer = computer;
        return this;
    }

    setTask(task)
    {
        this.task = task;
        return this;
    }

    solve()
    {
        this.signalSolved();
    }

    /**
     * A method to signal to the Mission Computers, or localhost that a Challenge has been complete.
     */
    signalSolved()
    {
        this.solved = true;
        this.trigger('solved');
        return this;
    }
}

module.exports = Challenge;
