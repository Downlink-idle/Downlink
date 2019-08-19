var Downlink = Downlink?Downlink:{};

(($)=>{


    function randomIPAddress()
    {
        let ipAddress = "";
        for(let i = 0; i < 3; i++)
        {
            if(i)
            {
                ipAddress += '.';
            }
            ipAddress += Math.floor(Math.random() * 256);
        }
        return ipAddress;
    }

    class Computer
    {
        constructor(name, ipAddress)
        {
            this.name= name;
            this.ipAddress = ipAddress?ipAddress:randomIPAddress();
            this.location = null;
        }

        setLocation(location)
        {
            this.location = location;
        }

        fromJSON(json)
        {
            let computer = new Computer(json.name, json.ipAddress);
            computer.setLocation(json.location);
        }

        toJSON()
        {
            let json = {
                name:this.name,
                ipAddress:this.ipAddress,
                location:this.location
            };
        }
    }

    Downlink.Computer = Computer;
})(window.jQuery);
