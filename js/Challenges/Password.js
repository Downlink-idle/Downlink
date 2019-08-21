const dictionary = require('/dictionary');
const PASSWORD_TYPES = {
    'DICTIONARY':'Dictionary',
    'ALPHANUMERIC':'Alphanumeric'
};

module.exports = ($)=> {
    const Challenge = require('./Challenge')($);

    class Password extends Challenge
    {
        constructor(text, type, solved, difficulty)
        {
            super(PASSWORD_TYPES[type] + ' Password', difficulty);
            this.text = text;
            this.type = type;
        }

        attack(testPassword)
        {
            $(this).trigger('start');
            if (this.text === testPassword)
            {
                this.signalComplete();
                return true;
            }
            return false;
        }

        static randomDictionaryPassword()
        {
            return new Password(dictionary.randomElement(), PASSWORD_TYPES.DICTIONARY, false, 1);
        }

        static randomAlphanumericPassword()
        {
            let stringLength = Math.floor(Math.random() * 5) + 5;
            let password = '';
            for (let i = 0; i < stringLength; i++)
            {
                password += Downlink.Alphabet.getRandomLetter();
            }
            return new Password(password, PASSWORD_TYPES.ALPHANUMERIC, false, stringLength);
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

    return Password;
};
