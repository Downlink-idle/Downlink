/**
 * @type {{}}
 */
const   DIFFICULTIES = {
            'EASY':{name:'Linear', size:{min:7, max:10}},
            'MEDIUM':{name:'Quadratic', size:{min:10,max:15}},
            'HARD':{name:'Cubic', size:{min:15,max:20}}
        };

function getRandomIntBetween(min, max)
{
    return  Math.floor(Math.random() * (max - min + 1)) + min;
}
const Challenge = require('./Challenge');
class Encryption extends Challenge
{
    constructor(difficulty)
    {
        let rows = getRandomIntBetween(difficulty.size.min, difficulty.size.max),
            cols = getRandomIntBetween(difficulty.size.min, difficulty.size.max),
            difficultyRatio = Math.floor(Math.pow(rows * cols, 0.4));

        super(difficulty.name + ' Encryption', difficultyRatio);
        this.rows = rows;
        this.cols = cols;
        this.size = cols * rows;
    }

    static get DIFFICULTIES()
    {
        return DIFFICULTIES;
    }

    static getNewLinearEncryption()
    {
        return new Encryption(DIFFICULTIES.EASY);
    }

    static getNewQuadraticEncryption()
    {
        return new Encryption(DIFFICULTIES.MEDIUM);
    }

}

module.exports = Encryption;