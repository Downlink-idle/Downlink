const   Alphabet = require('../../Alphabet'),
        helpers = require('../../Helpers'),
        Task = require('./Task');


const GRID_SIZE_DIFFICULTY_EXPONENT = 0.8;

class EncryptionCell
{
    constructor()
    {
        this.solved = false;
        this.letter = Alphabet.getRandomLetter();
    }

    solve()
    {
        this.solved = true;
        this.letter = '0';
    }

    tick()
    {
        if(this.solved)
        {
            return;
        }
        this.letter = Alphabet.getRandomLetter();
    }
}

class EncryptionCracker extends Task
{
    constructor(encryption)
    {
        super('EncryptionCracker', encryption, encryption.difficulty);
        this.rows = encryption.rows;
        this.cols = encryption.cols;
        this.encryption = encryption;

        /**
         * This is just an arbitrary number representing how many clock cycles per tick are needed to solve each cell
         */
        this.encryptionDifficulty = encryption.difficulty;

        /**
         *
         * @type {number}
         */
        this.cyclesPerTick = 0;
        /**
         * The amount of progress you have made on the current tick
         */
        this.currentTickPercentage = 0;

        /**
         * @type {Array.<Array.<EncryptionCell>>}
         */
        this.grid = [];
        /**
         * @type {Array.<EncryptionCell>}
         */
        this.cells = [];
        this.unsolvedCells = [];
        for(let i = 0; i < this.rows; i++)
        {
            let row = [];
            this.grid.push(row);

            for(let j = 0; j < this.cols; j++)
            {
                let cell = new EncryptionCell();
                row[j] = cell;
                this.cells.push(cell);
                this.unsolvedCells.push(cell);
            }
        }
    }


    solveNCells(cellsToSolve)
    {
        this.trigger('start');
        for(let i = 0; i < cellsToSolve; i++)
        {
            let cell = helpers.getRandomArrayElement(this.unsolvedCells);
            if(cell)
            {
                cell.solve();
                helpers.removeArrayElement(this.unsolvedCells, cell);
            }
        }
        if(!this.unsolvedCells.length)
        {
            this.signalComplete();
        }

    }

    /**
     * This should hopefully update the graphic properly
     * @returns {Array<EncryptionCell>}
     */
    get cellsForAnimating()
    {
        return this.cells;
    }

    get percentage()
    {
        return (this.cells.length - this.unsolvedCells.length) / (this.cells.length);
    }

    get solved()
    {
        return this.unsolvedCells.length == 0;
    }

    tick()
    {
        super.tick();

        // Cycle through all of the cells and tick them.
        for (let cell of this.unsolvedCells)
        {
            cell.tick();
        }

        // figure out how many cells to solve
        // I'm trying to figure out how to make this longer
        // this may lead to a number less than zero and so, this tick, nothing will happen
        this.currentTickPercentage += (this.cyclesPerTick / this.encryptionDifficulty) / Math.pow(this.unsolvedCells.length, GRID_SIZE_DIFFICULTY_EXPONENT);

        // if the currentTickPercentage is bigger than one, we solve that many cells
        if(this.currentTickPercentage >= 1)
        {
            let fullCells = Math.floor(this.currentTickPercentage);
            this.currentTickPercentage -= fullCells;
            this.solveNCells(fullCells);
        }
    }

    static fromJSON(json)
    {
        json = json?json:{rows:10,cols:10,difficulty:50};
        return new EncryptionCracker(json.rows, json.cols, json.difficulty);
    }

    getRewardRatio()
    {
        return this.difficultyRatio / Math.pow(this.ticksTaken, 2);
    }
}

module.exports = EncryptionCracker;