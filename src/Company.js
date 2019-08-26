const   ComputerGenerator = require('./Computers/ComputerGenerator'),
        Decimal = require('decimal.js');


let companyNames = [
    "Mike Rowe soft",
    "Pear",
    "Outel",
    "Ice",
    "Tomsung",
    "Popsy",
    "Ohm Djezis"
];
/**
 * @type {Array.<Company>}
 */
let companies = [];


class Company
{
    constructor(name)
    {
        this.name = name;
        this.publicServer = ComputerGenerator.newPublicServer(this);
        this.computers = [];
        this.addComputer(this.publicServer);
        /**
         * @type {Decimal} the reward modifier this company offers the player
         * this is based on the accrued successful missions and the number of times the company has detected you hacking
         * one of their servers
         */
        this.playerRespectModifier = new Decimal(1);
        /**
         * @type {Decimal} the reward modifier this company offers the player
         * this is the increase exponent for successfully achieved missions
         */
        this.missionSuccessIncreaseExponent = new Decimal(1.05);
    }

    addComputer(computer)
    {
        this.computers.push(computer);
    }

    finishMission(mission)
    {
        this.playerRespectModifier = this.playerRespectModifier.times(this.missionSuccessIncreaseExponent);
    }

    static getRandomCompany()
    {
        return companies.randomElement();
    }

    /**
     * @returns {[<Company>]}
     */
    static get allCompanies()
    {
        return companies;
    }

    static setAllPublicServerLocations()
    {
        for(let company of companies)
        {
            company.publicServer.setLocation(ComputerGenerator.getRandomLandboundPoint());
        }
    }
}

for(let companyName of companyNames)
{
    companies.push(new Company(companyName));
}

module.exports = Company;
