let Downlink = Downlink?Downlink:{};

(($)=>{


    class PasswordCracker extends Downlink.Task
    {
        constructor(password)
        {
            super();
            this.password = password;
        }
    }


    class DictionaryCracker extends PasswordCracker
    {
        constructor(password)
        {
            super(password);
            this.dictionary = Downlink.Password.dictionary;
        }

        tick()
        {
            super.tick();
            let guessCount = 0;

            while(guessCount < this.cyclesPerTick)
            {
                this.currentGuess = this.dictionary.next();
                if (this.currentGuess === this.password.text)
                {
                    this.signalComplete();
                }
                guessCount ++;
            }
        }
    }

    class SequentialAttacker extends PasswordCracker
    {
        constructor(password)
        {
            super(password);
        }

        tick()
        {

        }
    }

    Downlink.PasswordCracker = PasswordCracker;
    Downlink.DictionaryCracker = DictionaryCracker;
    Downlink.SequentialAttacker = SequentialAttacker;
})(window.jQuery);
