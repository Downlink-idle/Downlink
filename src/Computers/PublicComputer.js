let Computer = require('./Computer');

class PublicComputer extends Computer
{
    constructor(name, ipAddress)
    {
        super(name, ipAddress);
    }
}

module.exports = PublicComputer;
