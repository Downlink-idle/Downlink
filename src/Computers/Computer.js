const EventListener = require('../EventListener');

function randomIPAddress()
{
    let ipAddress = "";
    for(let i = 0; i < 4; i++)
    {
        if(i)
        {
            ipAddress += '.';
        }
        ipAddress += Math.floor(Math.random() * 256);
    }
    return ipAddress;
}

let allComputers = {};

class Computer extends EventListener
{
    /**
     *
     * @param {string}      name      The name of the computer
     * @param {string|null} ipAddress The ipAddress, if none provided a random ip address
     */
    constructor(name, ipAddress)
    {
        super();
        this.name= name;
        // stop two computers having the same ip address
        // while the statistic chances of this are **REALLY REALLY** small on any given instance, it will almost certainly
        // happen to some poor schmuck and fuck his save file up
        while(ipAddress == null)
        {
            let testIPAddress = randomIPAddress();
            if(Object.keys(allComputers).indexOf(testIPAddress) < 0)
            {
                ipAddress = testIPAddress;
            }
        }
        this.ipAddress = ipAddress;
        this.location = null;
        this.company = null;
        allComputers[this.simpleHash] = this;
    }

    setCompany(company)
    {
        this.company = company;
    }

    get simpleHash()
    {
        return this.name+'::'+this.ipAddress;
    }

    setLocation(location)
    {
        this.location = location;
        return this;
    }

    connect()
    {
        return this;
    }

    disconnect()
    {
        return this;
    }

    tick()
    {

    }

    static allComputers()
    {
        return allComputers;
    }

    static getComputerByHash(hash)
    {
        return allComputers[hash];
    }


    static fromJSON(json, company)
    {
        let computer = new this(json.name, json.ipAddress);

        computer.location = json.location;
        computer.company = company;
        return computer;
    }

    toJSON()
    {
        return {
            className:this.constructor.name,
            name:this.name,
            ipAddress:this.ipAddress,
            location:this.location
        };
    }


}

module.exports = Computer;
