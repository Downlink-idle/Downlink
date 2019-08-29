const   dictionary = require('./dictionary'),
        Challenge = require('./Challenge'),
        Decimal = require('break_infinity.js');

const PASSWORD_TYPES = {
    'DICTIONARY':'Dictionary',
    'ALPHANUMERIC':'Alphanumeric'
};
const PASSWORD_DICTIONARY_DIFFICULTIES = {
    'EASIEST':1,
    'HARDEST':100
};


class Password extends Challenge
{
    constructor(text, type, difficulty)
    {
        super(type + ' Password', new Decimal(difficulty));
        this.text = text;
        this.type = type;
    }

    attack(testPassword)
    {
        this.trigger('start');
        return testPassword === this.text;
    }

    static get PASSWORD_DICTIONARY_DIFFICULTIES()
    {
        return PASSWORD_DICTIONARY_DIFFICULTIES;
    }


    /**
     *
     * @param {number} difficulty should be between one and 10
     * @returns {Password}
     */
    static randomDictionaryPassword(difficulty)
    {
        // limit the difficulty to be between the easiest and hardest allowed difficulties
        difficulty = Math.min(Math.max(difficulty, PASSWORD_DICTIONARY_DIFFICULTIES.EASIEST), PASSWORD_DICTIONARY_DIFFICULTIES.HARDEST);
        // reduce the dictionary by a percentage of that amount
        let reduction = PASSWORD_DICTIONARY_DIFFICULTIES.HARDEST - difficulty,
            usedDictionary = [];
        dictionary.forEach((entry, index)=>{if(index%PASSWORD_DICTIONARY_DIFFICULTIES.HARDEST >= reduction){usedDictionary.push(entry);}});
        let dictionaryPassword = new Password(usedDictionary.randomElement(), PASSWORD_TYPES.DICTIONARY, difficulty);
        return dictionaryPassword;
    }

    static randomAlphanumericPassword()
    {
        let stringLength = Math.floor(Math.random() * 5) + 5;
        let password = '';
        for (let i = 0; i < stringLength; i++)
        {
            password += Alphabet.getRandomLetter();
        }
        return new Password(password, PASSWORD_TYPES.ALPHANUMERIC,  stringLength);
    }


    static get dictionary()
    {
        return dictionary;
    }

    static get PASSWORD_TYPES()
    {
        return PASSWORD_TYPES;
    }
}

module.exports = Password;
