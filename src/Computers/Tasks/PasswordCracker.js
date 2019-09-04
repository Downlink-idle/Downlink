const   DICTIONARY_CRACKER_MINIMUM_CYCLES = 5,
        SEQUENTIAL_CRACKER_MINIMUM_CYCLES = 20,
        Task = require('./Task')
        Alphabet = require('../../Alphabet');

class PasswordCracker extends Task
{
    constructor(password, name, minimumRequiredCycles)
    {
        super(name, password, minimumRequiredCycles);
        this.password = password;
        this.currentGuess = null;
    }

    attackPassword()
    {
        if(!this.password.solved)
        {
            let result = this.password.attack(this.currentGuess);
            if (result)
            {
                this.signalComplete();
            }
            return result;
        }
    }

}


class DictionaryCracker extends PasswordCracker
{
    constructor(password)
    {
        super(password, 'Dictionary Cracker', DICTIONARY_CRACKER_MINIMUM_CYCLES);
        this.dictionary = [...password.dictionary];
        this.totalGuesses = 0;
    }

    get dictionaryEntriesLeft()
    {
        return this.dictionary.length;
    }

    processTick()
    {
        if(!this.solved)
        {
            let attacking = true,
                guessesThisTick = 0;

            while(attacking)
            {
                this.currentGuess = this.dictionary[this.totalGuesses++];
                let guessSuccessful = this.attackPassword();
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
        this.currentGuess = '';
        this.lettersSolved = 0;
        console.log(password.length);
        for(let i = 0; i < password.length; i++)
        {
            this.currentGuess += '*';
        }
        this.alphabetGrid = Alphabet.getAlphabetGrid();
    }

    getNextLetter()
    {
        if(!this.alphabetGrid.length)
        {
            this.alphabetGrid = Alphabet.getAlphabetGrid();
        }
        return this.alphabetGrid.pop();
    }

    processTick()
    {
        let attacking = true,
            guessesThisTick = 0;
        while(attacking)
        {
            let letterGuess = this.getNextLetter();
            if(this.password.attackLetter(letterGuess))
            {
                this.currentGuess = this.currentGuess.substr(0, this.lettersSolved++) + letterGuess + this.currentGuess.substr(this.lettersSolved);
            }
            let guessSuccessful = this.attackPassword();
            if(guessSuccessful || guessesThisTick++ >= this.cyclesPerTick)
            {
                attacking = false;
            }
        }
    }
}

module.exports = {
    PasswordCracker:PasswordCracker,
    DictionaryCracker:DictionaryCracker,
    SequentialAttacker:SequentialAttacker
};
