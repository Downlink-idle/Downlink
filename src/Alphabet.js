const helpers = require('./Helpers');
let alphabetGrid = [];

class Alphabet
{
    static build()
    {
        let searchSpace = '';
        for(let i = 0; i < 10; i++)
        {
            searchSpace += ''+i;
        }

        for(let i = 0; i < 26; i++)
        {
            // add the letters a through z in upper and lower case by their character code
            searchSpace += String.fromCharCode(i + 65);
            searchSpace += String.fromCharCode(i + 97);
        }
        alphabetGrid = searchSpace.split('');
        this.shuffle();
    }

    static shuffle()
    {
        this.randomizedAlphabet = helpers.shuffleArray([...alphabetGrid]);

    }

    static getRandomLetter()
    {
        if(!(this.randomizedAlphabet && this.randomizedAlphabet.length))
        {
            this.shuffle();
        }

        return this.randomizedAlphabet.pop();
    }
};

Alphabet.build();

module.exports = Alphabet;
