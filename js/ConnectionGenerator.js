var Downlink = Downlink?Downlink:{};

(($)=>{$(()=>{

    class ConnectionGenerator
    {
        static buildConnectionFromCompanyArray(companies)
        {
            let connection = new Downlink.Connection();

            for(let company of companies)
            {
                connection.push(company.publicServer);
            }

            return connection;
        }

        static buildConnectionFromComputerArray(computers)
        {
            let connection = new Downlink.Connection();
            for(let computer of computers)
            {
                connection.push(computer);
            }
            return connection;
        }
    }

    Downlink.ConnectionGenerator = ConnectionGenerator;
})})(window.jQuery);
