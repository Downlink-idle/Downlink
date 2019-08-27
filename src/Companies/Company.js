const   ComputerGenerator = require('../Computers/ComputerGenerator'),
        Decimal = require('break_infinity.js'),
        companyNames = require('./companies');

/**
 * @type {Array.<Company>}
 */
let companies = [],
    locationsSet = false;


class Company
{
    constructor(name)
    {
        this.name = name;
        this.publicServer = ComputerGenerator.newPublicServer(this);
        this.computers = [];

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
        if(locationsSet)
        {
            return;
        }
        for(let company of companies)
        {
            company.publicServer.setLocation(ComputerGenerator.getRandomLandboundPoint());
        }
        locationsSet = true;
    }

    toJSON()
    {
        let json = {
            name:this.name,
            publicServer:this.publicServer,
            computers:[],
            playerRespectModifier:this.playerRespectModifier.toString(),
            missionSuccessIncreaseExponent:this.missionSuccessIncreaseExponent.toString()
        };
        for(let computer of this.computers)
        {
            json.computers.push(computer);
        }
        return json;
    }

    static loadCompaniesFromJSON(companiesJSON)
    {
        companies = [];
        for(let companyJSON of companiesJSON)
        {
            companies.push(Company.fromJSON(companyJSON));
        }
        locationsSet = true;
    }

    static fromJSON(companyJSON)
    {
        let company = new Company(companyJSON.name);
        company.playerRespectModifier = Decimal.fromString(companyJSON.playerRespectModifier);
        company.missionSuccessIncreaseExponent = Decimal.fromString(companyJSON.missionSuccessIncreaseExponent);
        company.publicServer = ComputerGenerator.fromJSON(companyJSON.publicServer);
        for(let computerJSON of company.computers)
        {
            company.addComputer(ComputerGenerator.fromJSON(computerJSON, company));
        }
        return company;
    }
}

for(let companyName of companyNames)
{
    companies.push(new Company(companyName));
}

module.exports = Company;
