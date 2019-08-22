let companyNames = [
    "Mike Rowe soft",
    "Pear",
    "Outel",
    "Ice",
    "Tomsung",
    "Popsy",
    "Ohm Djezis"
];
let companies = [];

let Computer = require('./Computer');

class Company
{
    constructor(name)
    {
        this.name = name;
        this.publicServer = new Computer(`${this.name} Public Server`);
        this.computers = [];
        this.addComputer(this.publicServer);
    }

    addComputer(computer)
    {
        this.computers.push(computer);
    }

    static getRandomCompany()
    {
        return companies.randomElement();
    }

    static get allCompanies()
    {
        return companies;
    }
}

for(let companyName of companyNames)
{
    companies.push(new Company(companyName));
}

module.exports = Company;
