let Computer = require('./Computer');

class PublicComputer extends Computer
{
    constructor(name, company)
    {
        super(name, company, null);
    }

}

module.exports = PublicComputer;
