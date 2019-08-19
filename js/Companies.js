var Downlink = Downlink?Downlink:{};

(($)=>{
    let companyNames = [
        "Mike Rowe soft",
        "Pear",
        "Outel",
        "Ice",
        "Tomsung",
        "Popsy",
        ""
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
    }

    for(let companyName of companyNames)
    {
        companies.push(new Company(companyName));
    }

    Downlink.companies = companies;
})(window.jQuery);
