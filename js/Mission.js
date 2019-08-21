
var Downlink = Downlink?Downlink:{};

(($)=>{
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

    class Mission
    {
        /**
         * Any mission is going to involve connecting to another computer belonging to a company and doing something to it
         * @param {Downlink.Company}    target      The object representing the company you are, in some way, attacking
         * @param {Downlink.Company}    sponsor     The company sponsoring this hack
         */
        constructor(target, sponsor)
        {
            /**
             * @type {Downlink.Company} the target company being attacked
             */
            this.target = target;
            /**
             * @type {Downlink.Company} the company sponsoring this mission
             */
            this.sponsor = sponsor;

            // these values are all instantiated later.
            /**
             * @type {MissionDifficulty}
             */
            this.difficulty = null;
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

        /**
         * A method to set the computer for this mission.
         * This is kept as a separate method because we only really want the mission to be populated when we take it,
         * not when we're just listing it.
         *
         *
         */
        buildComputer()
        {
            /*
            return new MissionComputer('Test Computer', Downlink.Company.getRandomCompany())
                .setPassword(
                    Downlink.Challenges.Password.randomDictionaryPassword()
                ).setEncryption(

                );
             */
            this.computer = new Downlink.MissionComputer(this, this.difficulty.serverType);
            if(this.difficulty === DIFFICULTIES.EASY)
            {
                this.computer
                    .setPassword(Downlink.Challenges.Password.randomDictionaryPassword())
                    .setEncryption(Downlink.Challenges.Encryption.getNewLinearEncryption());
            }
            return this;
        }

        static getNewSimpleMission()
        {
            let companies = [...Downlink.Company.allCompanies];
            let mission = new Mission(
                companies.shift(),
                companies.shift()
            ).setDifficulty(
                DIFFICULTIES.EASY
            );

            return mission;
        }
    }



    Downlink.Mission = Mission;
})(window.jQuery);
