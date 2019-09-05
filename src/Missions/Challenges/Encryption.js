const DIFFICULTY_EXPONENT = 0.3;

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
            size = rows * cols;
        let name = "Linear";
        if(difficulty > 10)
        {
            name = 'Cubic';
        }
        else if(difficulty > 5)
        {
            name = 'Quadratic';
        }
        super(name + ' Encryption', difficulty);
        this.rows = rows;
        this.cols = cols;
        this.size = size;
    }

    get calculatedDifficulty()
    {
        return Math.floor(Math.pow(this.size, DIFFICULTY_EXPONENT));
    }

    static getDimensionForDifficulty(difficulty)
    {
        const   flooredDifficulty = Math.floor(difficulty),
                min = 6 + flooredDifficulty,
                max = 8 + flooredDifficulty * 2;
        return getRandomIntBetween(min, max);
    }
}

module.exports = Encryption;
