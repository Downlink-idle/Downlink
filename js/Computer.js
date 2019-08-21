function randomIPAddress()
{
    let ipAddress = "";
    for(let i = 0; i < 3; i++)
    {
        if(i)
        {
            ipAddress += '.';
        }
        ipAddress += Math.floor(Math.random() * 256);
    }
    return ipAddress;
}

class Computer
{
    constructor(name, company, ipAddress)
    {
        this.name= name;
        this.ipAddress = ipAddress?ipAddress:randomIPAddress();
        this.location = null;
        this.company = company;
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

    static fromJSON(json)
    {
        let computer = new Computer(json.name, json.ipAddress);
        computer.setLocation(json.location);
    }

    toJSON()
    {
        let json = {
            name:this.name,
            ipAddress:this.ipAddress,
            location:this.location
        };
    }
}

module.exports = Computer;
