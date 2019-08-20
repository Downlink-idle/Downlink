var Downlink = Downlink?Downlink:{};

(($)=>{
    const DIFFICULTIES = {
        EASY:1,
        MEDIUM:5,
        HARD:10,
    };

    class Mission
    {
        constructor(computer, difficulty)
        {
            this.computer = computer;
            this.setDifficulty(difficulty);
        }

        setDifficulty(difficulty)
        {
            if(!DIFFICULTIES[difficulty])
            {
                throw new Error(`Invalid difficulty "${difficulty}" provided. Valid difficulties are "${Object.keys(DIFFICULTIES).join(', ')}"`);
            }
            this.difficulty = difficulty;
            this.difficultyModifier = DIFFICULTIES[difficulty];
        }


    }



    Downlink.Mission = Mission;
})(window.jQuery);
