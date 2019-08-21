var Downlink = Downlink?Downlink:{};

(($)=>{
    let companyNames = [
        "Mike Rowe soft",
        "Pear",
        "Outel",
        "Ice",
        "Tomsung",
        "Popsy",
        "Ohm Djezis"
    ];
    let Computer = Downlink.Computer;

    let companies = [];

    class Company
    {
        constructor(name)
        {
            this.name = name;
            this.publicServer = new Computer(`${this.name} Public Server`)
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

    Downlink.Company = Company;
})(window.jQuery);
