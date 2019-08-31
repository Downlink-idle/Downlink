let Computer = require('./Computer');

let allPublicComputers = {};

class PublicComputer extends Computer
{
    constructor(name, ipAddress)
    {
        super(name, ipAddress);
        let keys = Object.keys(allPublicComputers);
        while(keys.indexOf(this.ipAddress) >= 0)
        {
            this.ipAddress = Computer.randomIPAddress();
        }
        allPublicComputers[this.ipAddress] = this;
    }

    static getPublicComputerByIPAddress(hash)
    {
        console.log(hash);
        return allPublicComputers[hash];
    }

    static getAllKnownPublicServers()
    {
        return allPublicComputers;
    }
}

module.exports = PublicComputer;
