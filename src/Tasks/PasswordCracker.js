const   DICTIONARY_CRACKER_MINIMUM_CYCLES = 5,
        SEQUENTIAL_CRACKER_MINIMUM_CYCLES = 20,
        Task = require('./Task'),
        Password = require('../Challenges/Password');

class PasswordCracker extends Task
{
    constructor(password, name, minimumRequiredCycles)
    {
        super(name, password, minimumRequiredCycles);
        this.password = password.on('solved', ()=>{this.signalComplete()});
        this.currentGuess = null;
    }

    attackPassword()
    {
        let result = this.password.attack(this.currentGuess);
        if(result)
        {
            this.signalComplete();
        }
        return result;
    }

}


class DictionaryCracker extends PasswordCracker
{
    constructor(password)
    {
        super(password, 'Dictionary Cracker', DICTIONARY_CRACKER_MINIMUM_CYCLES);
        this.dictionary = [...Password.dictionary];
        this.totalGuesses = 0;
    }

    get dictionaryEntriesLeft()
    {
        return this.dictionary.length;
    }

    tick()
    {
        super.tick();

        if(!this.solved)
        {
            let attacking = true,
                found = false,
                guessesThisTick = 0;

            while(attacking)
            {
                this.currentGuess = this.dictionary[this.totalGuesses++];

                let guessSuccessful = this.attackPassword();
                found = found || guessSuccessful;
                if(guessSuccessful || guessesThisTick++ >= this.cyclesPerTick)
                {
                    attacking = false;
                }
            }
        }
    }
}

class SequentialAttacker extends PasswordCracker
{
    constructor(password)
    {
        super(password, 'Sequential Cracker', SEQUENTIAL_CRACKER_MINIMUM_CYCLES);
    }

    tick()
    {

    }
}

module.exports = {
    PasswordCracker:PasswordCracker,
    DictionaryCracker:DictionaryCracker,
    SequentialAttacker:SequentialAttacker
};
