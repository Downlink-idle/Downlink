const   Company = require('../Company'),
    MissionComputer = require('./MissionComputer'),
    Password = require('../Challenges/Password'),
    Encryption = require('../Challenges/Encryption'),
    EventListener = require('../EventListener'),
    MissionDifficulty = require('./MissionDifficulty');


/**
 * @type {{EASY: MissionDifficulty, MEDIUM: MissionDifficulty, HARD: MissionDifficulty}}
 */
const DIFFICULTIES = {
    EASY:new MissionDifficulty(1, "Server"),
    MEDIUM:new MissionDifficulty(5, "Cluster"),
    HARD:new MissionDifficulty(10, "Farm"),
};

class Mission extends EventListener
{
    /**
     * Any mission is going to involve connecting to another computer belonging to a company and doing something to it
     * @param {Company}    target      The object representing the company you are, in some way, attacking
     * @param {Company}    sponsor     The company sponsoring this hack
     */
    constructor(target, sponsor)
    {
        super();
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

        this.status = "Available";
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
        this.computer.on('accessed', ()=>{
            this.signalComplete();
        });

        let password = null, encryption = null;

        if(this.difficulty === DIFFICULTIES.EASY)
        {
            password = Password.randomDictionaryPassword(Password.PASSWORD_DICTIONARY_DIFFICULTIES.EASIEST);
            encryption = Encryption.getNewLinearEncryption();
        }

        this.computer.setPassword(password).setEncryption(encryption);


        this.target.addComputer(this.computer);
        this.status = "Underway";
        return this;
    }

    signalComplete()
    {
        this.status="Complete";
        this.trigger('complete');
    }

    tick()
    {
        this.build();
        this.computer.tick();
    }

    static getNewSimpleMission()
    {
        let companies = [...Company.allCompanies].shuffle();
        return new Mission(
            companies.shift(),
            companies.shift()
        ).setDifficulty(
            DIFFICULTIES.EASY
        );
    }
}
module.exports = Mission;
