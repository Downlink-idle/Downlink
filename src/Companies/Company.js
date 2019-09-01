const   ComputerGenerator = require('../Computers/ComputerGenerator'),
        companyNames = require('./companies');

/**
 * @type {Array.<Company>}
 */
let companies = [],
    /** @type {boolean} */
    locationsSet = false;


class Company
{
    constructor(name)
    {
        this.name = name;

        this.computers = [];

        /**
         * @type {number} the reward modifier this company offers the player
         * this is based on the accrued successful missions and the number of times the company has detected you hacking
         * one of their servers
         */
        this.playerRespectModifier = 1;
        /**
         * @type {number} the reward modifier this company offers the player
         * this is the increase exponent for successfully achieved missions
         */
        this.missionSuccessIncreaseExponent = 1.001;

        this.hackDetectedExponent = 1.002;
    }

    setPublicServer(publicServer)
    {
        this.publicServer = publicServer;
        publicServer.setCompany(this);
    }

    addComputer(computer)
    {
        this.computers.push(computer);
    }

    finishMission(mission)
    {
        this.playerRespectModifier *= this.missionSuccessIncreaseExponent;
    }

    detectHacking()
    {
        this.playerRespectModifier /= this.hackDetectedExponent;
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
            publicServer:this.publicServer.toJSON(),
            playerRespectModifier:this.playerRespectModifier.toString(),
            missionSuccessIncreaseExponent:this.missionSuccessIncreaseExponent.toString()
        };

        return json;
    }

    static loadCompaniesFromJSON(companiesJSON)
    {
        companies = [];
        for(let companyJSON of companiesJSON)
        {
            companies.push(Company.fromJSON(companyJSON));
        }
    }

    static fromJSON(companyJSON)
    {
        let company = new Company(companyJSON.name);
        company.setPublicServer(ComputerGenerator.fromJSON(companyJSON.publicServer));
        company.playerRespectModifier = parseFloat(companyJSON.playerRespectModifier);
        company.missionSuccessIncreaseExponent = parseFloat(companyJSON.missionSuccessIncreaseExponent);

        locationsSet = true;
        return company;
    }

    static buildCompanyList()
    {
        companies = [];
        for(let companyName of companyNames)
        {
            let company = new Company(companyName);
            company.setPublicServer(ComputerGenerator.newPublicServer(company));
            companies.push(company);
        }
    }
}


module.exports = Company;
