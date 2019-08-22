/**
 * @type {{}}
 */
const DIFFICULTIES = {
    'EASY':{name:'Linear', size:{min:7, max:11}},
    'MEDIUM':{name:'Quadratic', size:{min:10,max:15}},
    'HARD':{name:'Cubic', size:{min:15,max:20}}
};

function getRandomIntBetween(min, max)
{
    return Math.floor(Math.random() * (+max - +min)) + +min
}
const Challenge = require('./Challenge');
class Encryption extends Challenge
{
    constructor(difficulty)
    {
        let rows = getRandomIntBetween(difficulty.size.min, difficulty.size.max),
            cols = getRandomIntBetween(difficulty.size.min, difficulty.size.max),
            difficultyRatio = Math.floor(Math.sqrt(rows * cols));
        super(difficulty.name + ' Encryption', difficultyRatio);
        this.rows = rows;
        this.cols = cols;
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
