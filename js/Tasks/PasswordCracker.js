const   DICTIONARY_CRACKER_MINIMUM_CYCLES = 5,
        SEQUENTIAL_CRACKER_MINIMUM_CYCLES = 20,
        Task = require('./Task'),
        Password = require('../Challenges/Password');

class PasswordCracker extends Task
{
    constructor(password, name, minimumRequiredCycles)
    {
        super(name, minimumRequiredCycles);
        this.password = password;
        $(password).on('solved', ()=>{this.signalComplete()});
        this.isSolved = false;
    }

    signalComplete()
    {
        this.isSolved = true;
        super.signalComplete();
    }
}


class DictionaryCracker extends PasswordCracker
{
    constructor(password)
    {
        super(password, 'Dictionary Cracker', DICTIONARY_CRACKER_MINIMUM_CYCLES);
        this.dictionary = [Password.dictionary];
        this.currentGuess = null;
        this.totalGuesses = 0;
    }

    tick()
    {
        super.tick();

        let attacking = true,
            guessesThisTick = 0;

        while(attacking)
        {
            this.currentGuess = this.dictionary.shift();
            let guessSuccessful = this.password.attack(this.currentGuess);
            guessesThisTick ++;
            this.totalGuesses++;
            if(guessSuccessful || guessesThisTick < this.cyclesPerTick)
            {
                attacking = false;
            }
        }

        if(!this.dictionary.length)
        {
            throw new Error(`${password.text} not found in dictionary some how`);
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
