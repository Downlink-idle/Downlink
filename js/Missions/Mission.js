/**
 * This class exists only to make commenting cleaner
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

/**
 * @type {{EASY: MissionDifficulty, MEDIUM: MissionDifficulty, HARD: MissionDifficulty}}
 */
const DIFFICULTIES = {
    EASY:new MissionDifficulty(1, "Server"),
    MEDIUM:new MissionDifficulty(5, "Cluster"),
    HARD:new MissionDifficulty(10, "Farm"),
};

const   Company = require('../Company'),
        MissionComputer = require('./MissionComputer'),
        Password = require('../Challenges/Password'),
        Encryption = require('../Challenges/Encryption');

class Mission
{
    /**
     * Any mission is going to involve connecting to another computer belonging to a company and doing something to it
     * @param {Company}    target      The object representing the company you are, in some way, attacking
     * @param {Company}    sponsor     The company sponsoring this hack
     */
    constructor(target, sponsor)
    {
        this.name = `Hack ${target.name} for ${sponsor.name}`;
        /**
         * @type {Company} the target company being attacked
         */
        this.target = target;
        /**
         * @type {Company} the company sponsoring this mission
         */
        this.sponsor = sponsor;

        // these values are all instantiated later.
        /**
         * @type {MissionDifficulty}
         */
        this.difficulty = null;
        /**
         *
         * @type {MissionComputer}
         */
        this.computer = null;
    }

    setDifficulty(difficulty)
    {
        if(!difficulty instanceof MissionDifficulty)
        {
            throw new Error("Mission Difficulty unrecognised");
        }
        this.difficulty = difficulty;
        return this;
    }

    get hackTargets()
    {
        let targets = [];
        if(this.computer.password)
        {
            targets.push(this.computer.password);
        }
        if(this.computer.encryption)
        {
            targets.push(this.computer.encryption);
        }
        return targets;
    }

    /**
     * A method to set the computer for this mission.
     * This is kept as a separate method because we only really want the mission to be populated when we take it,
     * not when we're just listing it.
     *
     *
     */
    build()
    {
        if(this.computer)
        {
            return this;
        }

        this.computer = new MissionComputer(this.target, this.difficulty.serverType);
        $(this.computer).on('accessed', ()=>{
            this.signalComplete();
        });
        let password = null, encryption = null;

        if(this.difficulty === DIFFICULTIES.EASY)
        {
            password = Password.randomDictionaryPassword();
            encryption = Encryption.getNewLinearEncryption();
        }

        this.computer.setPassword(password).setEncryption(encryption);


        this.target.addComputer(this.computer);
        return this;
    }

    signalComplete()
    {
        $(this).trigger('complete');
    }

    tick()
    {
        this.build();
        this.computer.tick();
    }

    static getNewSimpleMission()
    {
        let companies = [...Company.allCompanies];
        return new Mission(
            companies.shift(),
            companies.shift()
        ).setDifficulty(
            DIFFICULTIES.EASY
        );
    }
}
module.exports = Mission;
