module.exports = ($)=>{
    const   Alphabet = require('../Alphabet'),
            Task = require('./Task')($);

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
        constructor(rows, cols, encryptionDifficulty, cyclesPerTick)
        {
            super('EncryptionCracker', encryptionDifficulty?encryptionDifficulty:50 / 2);
            this.rows = rows?rows:5;
            this.cols = cols?cols:5;
            /**
             * This is just an arbitrary number representing how many clock cycles per tick are needed to solve each cell
             */
            this.encryptionDifficulty = encryptionDifficulty?encryptionDifficulty:50;

            /**
             *
             * @type {number}
             */
            this.cyclesPerTick = cyclesPerTick?cyclesPerTick:0;
            /**
             * The amount of progress you have made on the current tick
             */
            this.currentTickPercentage = 0;

            this.grid = [];
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

            this.difficultyRatio = this.rows * this.cols * this.encryptionDifficulty;
        }


        solveNCells(cellsToSolve)
        {
            $(this).trigger('start');
            for(let i = 0; i < cellsToSolve; i++)
            {
                let cell = this.unsolvedCells.randomElement();
                if(cell)
                {
                    cell.solve();
                    this.unsolvedCells.removeElement(cell);
                }
            }
            if(!this.unsolvedCells.length)
            {
                this.signalComplete();
            }
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
            // by determining how many cycles per tick we have divided by the difficulty of this task
            // this may lead to a number less than zero and so, this tick, nothing will happen
            this.currentTickPercentage += this.cyclesPerTick / this.encryptionDifficulty;

            // if the currentTickPercentage is bigger than one, we solve that many cells
            if(this.currentTickPercentage >= 1)
            {
                let fullCells = parseInt(this.currentTickPercentage);
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


};
