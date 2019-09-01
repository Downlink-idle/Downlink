const DIFFICULTY_EXPONENT = 0.4;

function getRandomIntBetween(min, max)
{
    return  Math.floor(Math.random() * (max - min + 1)) + min;
}
const Challenge = require('./Challenge');
class Encryption extends Challenge
{
    /**
     *
     * @param {number} difficulty
     */
    constructor(difficulty)
    {
        let rows = Encryption.getDimensionForDifficulty(difficulty),
            cols = Encryption.getDimensionForDifficulty(difficulty),
            size = rows * cols,
            difficultyRatio = Math.floor(Math.pow(size, DIFFICULTY_EXPONENT));
        let name = "Linear";
        if(difficulty > 10)
        {
            name = 'Cubic';
        }
        else if(difficulty > 5)
        {
            name = 'Quadratic';
        }
        super(name + ' Encryption', difficultyRatio);
        this.rows = rows;
        this.cols = cols;
        this.size = size;
    }

    static getDimensionForDifficulty(difficulty)
    {
        const min = 5 + difficulty,
              max = 8 + difficulty * 2;
        return getRandomIntBetween(5+difficulty, 9+difficulty);
    }
}

module.exports = Encryption;
