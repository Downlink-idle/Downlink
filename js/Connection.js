var Downlink = Downlink?Downlink:{};

(($)=>{
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
            this.name = name?name:`Connection ${connections}`;
            this.computers=[];
            this.connectionLength = 0;
            this.computersTraced = 0;
        }

        addComputer(computer)
        {
            if(!typeof computer === Downlink.Computer)
            {
                throw new InvalidTypeError("Incorrect object type added");
            }
            if(this.computers.indexOf(computer) >= 0)
            {
                throw new DuplicateComputerError("Already have this computer");
            }
            this.computers.push(computer);
            this.connectionLength ++;
        }

        removeComputer(computer)
        {
            if(this.computers.indexOf(computer) < 0)
            {
                throw new InvalidComputerError("Computer not found in connection");
            }
            this.computers.removeElement(computer);
            this.connectionLength --;
        }

        equals(otherConnection)
        {
            return JSON.stringify(this.computers) === JSON.stringify(otherConnection.computers);
        }
    }

    Downlink.Connection = Connection;
})(window.jQuery);
