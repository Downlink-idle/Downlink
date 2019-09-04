const   Computer = require('./Computers/Computer'),
        PublicComputer = require('./Computers/PublicComputer'),
        EventListener = require('./EventListener'),
        helpers = require('./Helpers'),
        md5 = require('md5');

class InvalidTypeError extends Error{}
class InvalidComputerError extends Error{}
//class DuplicateComputerError extends Error{}

let connections = 0;

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
        /**
         * This is used for easy comparison between two connections
         * and will only be of import in later game because in early game the connections will be automated
         * @type {string}
         */
        this.hash = '';
        /**
         * * @type {Computer}
         */
        this.startingPoint = null;
        /**
         * @type {Computer}
         */
        this.endPoint = null;
        this.name = name?name:`Connection ${connections}`;
        this.computers=[];
        this.connectionLength = 0;
        this.computersTraced = 0;
        this.amountTraced = 0;
        this.traceTicks = 0;
        this.active = false;
    }

    static improveConnectionDistance(amount)
    {
        Connection.connectionDistance += amount;
    }

    get totalConnectionLength()
    {
        return this.connectionLength * Connection.connectionDistance;
    }

    setStartingPoint(startingComputer)
    {
        this.startingPoint = startingComputer;
        this.connectionLength ++;
        return this;
    }

    setEndPoint(endPointComputer)
    {
        this.endPoint = endPointComputer;
        this.connectionLength ++;
        return this;
    }

    connect()
    {
        this.computersTraced = 0;
        this.amountTraced = 0;
        this.active = true;
        return this.open();
    }

    reconnect()
    {
        this.active = true;
        return this.open();
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
        //console.log(stepTraceAmount);
        this.amountTraced += stepTraceAmount;
        this.traceTicks++;
        if(this.traceTicks % Connection.sensitivity === 0)
        {
            this.trigger('updateTracePercentage', this.tracePercent);
        }

        if(this.amountTraced >= Connection.connectionDistance)
        {
            this.computersTraced++;
            this.amountTraced = 0;
            if(this.computersTraced >= this.connectionLength)
            {
                this.trigger("connectionTraced");
            }
            this.trigger("stepTraced", this.computersTraced);
        }
    }

    get totalAmountTraced()
    {
        let traceAmount = (this.computersTraced * Connection.connectionDistance) + this.amountTraced;
        return traceAmount;
    }

    close()
    {
        let reverseComputers = this.computers.reverse();
        for(let computer of reverseComputers)
        {
            computer.disconnect();
        }
        this.active = false;
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
        this.computers.push(computer);
        this.connectionLength ++;
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
        helpers.removeArrayElement(this.computers, computer);
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

Connection.connectionDistance = 1300;
Connection.sensitivity = 10;

module.exports = Connection;
