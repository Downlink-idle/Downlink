const Computer = require('./Computers/Computer');

    class InvalidTypeError extends Error{}
    class InvalidComputerError extends Error{}
    class DuplicateComputerError extends Error{}

    let connections = 0;

    /**
     * A class to encapsulate the points in between you and the target computer, excluding both
     */
    class Connection
    {
        constructor(name)
        {
            connections++;
            this.startingPoint = null;
            this.name = name?name:`Connection ${connections}`;
            this.computers=[];
            this.connectionLength = 0;
            this.computersTraced = 0;
        }

        setStartingPoint(playerComputer)
        {
            this.startingPoint = playerComputer;
            return this;
        }

        open()
        {
            for(let computer of this.computers)
            {
                computer.connect();
            }
            return this;
        }

        close()
        {
            let reverseComputers = this.computers.reverse();
            for(let computer of reverseComputers)
            {
                computer.disconnect();
            }
            return this;
        }

        addComputer(computer)
        {
            if(!(computer instanceof Computer))
            {
                throw new InvalidTypeError("Incorrect object type added");
            }
            if(this.computers.indexOf(computer) >= 0)
            {
                this.removeComputer(computer);
                return this;
            }
            computer.connect(this);
            this.computers.push(computer);
            this.connectionLength ++;
            return this;
        }

        removeComputer(computer)
        {
            if(this.computers.indexOf(computer) < 0)
            {
                throw new InvalidComputerError("Computers not found in connection");
            }
            computer.disconnect();
            this.computers.removeElement(computer);
            this.connectionLength --;
        }

        equals(otherConnection)
        {
            if(!otherConnection || !(otherConnection instanceof this))
            {
                return false;
            }

            return JSON.stringify(this.computers) === JSON.stringify(otherConnection.computers);
        }

        toJSON()
        {
            let json= {name:this.name, computers:[]};
            for(let computer of this.computers)
            {
                json.computers.push(computer.toJSON());
            }
            return json;
        }

        static fromJSON(json, playerComputer)
        {

        }
    }

module.exports = Connection;
