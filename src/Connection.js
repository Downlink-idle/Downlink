const   Computer = require('./Computers/Computer'),
        PublicComputer = require('./Computers/PublicComputer'),
        EventListener = require('./EventListener'),
        md5 = require('md5');

class InvalidTypeError extends Error{}
class InvalidComputerError extends Error{}
//class DuplicateComputerError extends Error{}

let connections = 0;
const DEFAULT_CONNECTION_DISTANCE = 10;


/**
 * A class to encapsulate the points in between you and the target computer, excluding both
 */
class Connection extends EventListener
{
    constructor(name)
    {
        super();
        if(!name)
        {
            connections++;
        }
        this.hash = '';
        this.startingPoint = null;
        this.name = name?name:`Connection ${connections}`;
        this.computers=[];
        this.connectionLength = 0;
        this.connectionDistance = DEFAULT_CONNECTION_DISTANCE;
        this.computersTraced = 0;
        this.amountTraced = 0;
        this.totalConnectionLength = 0;
    }

    improveConnectionDistance(amount)
    {
        this.connectionDistance += amount;
    }

    setStartingPoint(playerComputer)
    {
        this.startingPoint = playerComputer;
        return this;
    }

    connect()
    {
        this.computersTraced = 0;
        this.amountTraced = 0;
        return this.open();
    }

    reconnect()
    {
        this.open();
    }

    open()
    {
        for(let computer of this.computers)
        {
            computer.connect();
        }
        return this;
    }

    /**
     * this is needed so that mission computers retain the state of the connection's tracedness
     */
    clone()
    {
        let clone = new Connection(this.name);
        for(let computer of this.computers)
        {
            clone.addComputer(computer);
        }
        return clone;
    }

    /**
     * @param {Connection} otherConnection
     * @returns {boolean}
     */
    equals(otherConnection)
    {
        return (this.hash === otherConnection.hash);
    }

    /**
     * @param stepTraceAmount the amount of the current step in the connection to trace by
     */
    traceStep(stepTraceAmount)
    {
        this.amountTraced += stepTraceAmount;
        if(this.amountTraced >= this.connectionDistance)
        {
            this.computersTraced++;
            this.trigger("stepTraced", this.computersTraced, this.tracePercent);
            this.amountTraced = 0;
            if(this.computersTraced >= this.connectionLength)
            {
                this.trigger("connectionTraced");
            }
        }
    }

    get totalAmountTraced()
    {
        return this.computersTraced * this.connectionDistance + this.amountTraced;
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
        console.log(computer);
        if(!(computer instanceof Computer))
        {
            throw new InvalidTypeError("Incorrect object type added");
        }
        if(this.computers.indexOf(computer) >= 0)
        {
            this.removeComputer(computer);
            return this;
        }
        this.computers.push(computer);
        this.connectionLength ++;
        this.totalConnectionLength += this.connectionLength;
        this.buildHash();
        return this;
    }

    get tracePercent()
    {
        return (this.totalAmountTraced / this.totalConnectionLength * 100).toFixed(2);
    }

    removeComputer(computer)
    {
        if(this.computers.indexOf(computer) < 0)
        {
            throw new InvalidComputerError("Computers not found in connection");
        }
        this.buildHash();
        this.computers.removeElement(computer);
        this.connectionLength --;
    }

    buildHash()
    {
        let strToHash = '';
        for(let computer of this.computers)
        {
            strToHash += computer.simpleHash;
        }
        this.hash = md5(strToHash);
    }

    toJSON()
    {
        let json= {name:this.name, ipAddresses:[]};
        for(let computer of this.computers)
        {
            json.ipAddresses.push(computer.ipAddress);
        }
        return json;
    }

    static fromJSON(json, startingPoint)
    {
        let connection = new Connection(json.name);
        connection.startingPoint = startingPoint;
        for(let ipAddress of json.ipAddresses)
        {
            connection.addComputer(PublicComputer.getPublicComputerByIPAddress(ipAddress));
        }
        return connection;
    }

    static fromAllPublicServers()
    {
        return this.fromComputerArray(Object.values(PublicComputer.getAllKnownPublicServers()));
    }

    static fromComputerArray(computerArray)
    {
        let connection = new Connection();
        for(let computer of computerArray)
        {
            connection.addComputer(computer);
        }
        return connection;
    }
}

module.exports = Connection;
