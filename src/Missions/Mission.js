const   Company = require('../Companies/Company'),
        MissionComputer = require('./MissionComputer'),
        Password = require('../Challenges/Password'),
        Encryption = require('../Challenges/Encryption'),
        EventListener = require('../EventListener'),
        MissionDifficulty = require('./MissionDifficulty'),
        helpers = require('../Helpers');

const MISSION_STATUSES = {
    UNDERWAY:'underway',
    AVAILABLE:'available',
    COMPLETE:'complete'
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

        /**
         * @type {string} A constant enum value used for state checking
         */
        this.status = MISSION_STATUSES.AVAILABLE;

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

    get challenges()
    {
        return this.computer.challenges;
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
        }).on('connectionStepTraced', (step, percentage)=>{
            this.trigger("connectionStepTraced", step, percentage);
        }).on('hackTracked', ()=>{
            this.target.detectHacking();
        });

        let password = null, encryption = null;

        /**
         * This a hoist, not the end result
         */
        if(this.difficulty === MissionDifficulty.DIFFICULTIES.EASY)
        {
            password = Password.randomDictionaryPassword(Password.PASSWORD_DICTIONARY_DIFFICULTIES.EASIEST);
            encryption = Encryption.getNewLinearEncryption();
        }

        this.computer.setPassword(password).setEncryption(encryption);

        this.target.addComputer(this.computer);
        this.status = MISSION_STATUSES.UNDERWAY;
        return this;
    }

    /**
     * @returns {number}
     */
    get reward()
    {
        return this.difficulty.modifier * this.computer.difficultyModifier * this.sponsor.playerRespectModifier;
    }

    signalComplete()
    {
        this.status = MISSION_STATUSES.COMPLETE;
        this.sponsor.finishMission(this);
        this.trigger('complete');
    }

    set connection(connection)
    {
        this.computer.connect(connection);

    }

    tick()
    {
        if(this.status == MISSION_STATUSES.COMPLETE)
        {
            return;
        }
        this.build();
        this.computer.tick();
    }

    static getNewSimpleMission()
    {
        let companies = helpers.shuffleArray([...Company.allCompanies]);
        return new Mission(
            companies.shift(),
            companies.shift()
        ).setDifficulty(
            MissionDifficulty.DIFFICULTIES.EASY
        );
    }
}
module.exports = Mission;
