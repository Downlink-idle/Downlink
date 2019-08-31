const EventListener = require('../EventListener');

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

        this.ipAddress = Computer.randomIPAddress();
        this.location = null;
        this.company = null;
    }

    static randomIPAddress()
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
