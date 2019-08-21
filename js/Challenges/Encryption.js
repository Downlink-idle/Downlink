/**
 * @type {{}}
 */
const DIFFICULTIES = {
    'EASY':{name:'Linear', size:{min:4, max:7}},
    'MEDIUM':{name:'Quadratic', size:{min:6,max:11}},
    'HARD':{name:'Cubic', size:{min:10,max:15}}
};

function getRandomIntBetween(min, max)
{
    return Math.floor(Math.random() * (+max - +min)) + +min
}

module.exports = ($)=> {
    const Challenge = require('./Challenge')($);

    class Encryption extends Challenge
    {
        constructor(difficulty)
        {
            let diff = DIFFICULTIES[difficulty], rows = getRandomIntBetween(diff.min, diff.max),
                cols = getRandomIntBetween(diff.min, diff.max), diffRatio = Math.floor(Math.sqrt(rows * cols));
            super(diff.name + ' Encryption', diffRatio);
        }

        static get DIFFICULTIES()
        {
            return DIFFICULTIES;
        }

        static getNewLinearEncryption()
        {
            return new Encryption('EASY');
        }

        static getNewQuadraticEncryption()
        {
            return new Encryption('MEDIUM');
        }

    }
    return Encryption;
};
