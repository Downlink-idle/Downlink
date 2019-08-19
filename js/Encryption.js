var Downlink = Downlink?Downlink:{};

(($)=>{
    class EncryptionCell
    {
        constructor()
        {
            this.solved = false;
            this.letter = Downlink.Alphabet.getRandomLetter();
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
            this.letter = Downlink.Alphabet.getRandomLetter();
        }
    }

    class Encryption extends Downlink.Task
    {
        constructor(rows, cols, encryptionDifficulty, cyclesPerTick)
        {
            super('Encryption', encryptionDifficulty?encryptionDifficulty:50 / 2);
            this.rows = rows?rows:25;
            this.cols = cols?cols:17;
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

            for (let cell of this.unsolvedCells)
            {
                cell.tick();
            }

            this.currentTickPercentage += this.cyclesPerTick / this.encryptionDifficulty;

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
            return new Encryption(json.rows, json.cols, json.difficulty);
        }

        getRewardRatio()
        {
            return this.difficultyRatio / Math.pow(this.ticksTaken, 2);
        }
    }

    Downlink.Encryption = Encryption;
})(window.jQuery);
