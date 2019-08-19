var Downlink = Downlink?Downlink:{};

(($)=>{
    class MissionComputer extends Downlink.Computer
    {
        constructor(name)
        {
            super(name);
            this.encryption = null;
            this.password = null;
            this.accessible = false;
            this.files = [];
            this.currentPlayerConnection = null;
            this.previousPlayerConnection = null;
            this.securityFeatures = [];
        }

        connect(connection)
        {
            this.currentPlayerConnection = connection;
            if(this.currentPlayerConnection.equals(this.previousPlayerConnection))
            {
                this.resumeTraceBack();
            }
        }

        disconnect()
        {
            this.playerConnection = null;
            this.stopTraceBack();
        }

        setEncryption(encryption)
        {
            this.encryption = encryption;
            this.securityFeatures.push(encryption);
            $(encryption)
                .on('complete', ()=>{
                    this.updateAccessStatus();
                    $(encryption).off();
                })
                .on('start', ()=>{this.beginTraceBack();});
            return this;
        }

        setPassword(password)
        {
            this.password = password;
            $(password).on('solved', ()=>{
                $(password).off();
                this.updateAccessStatus();
            });
            return this;
        }

        updateAccessStatus()
        {
            this.accessible = this.accessible || (this.encryption && this.encryption.solved && this.password && this.password.solved);
            return this.accessible;
        }

        beginTraceBack()
        {

        }

        resumeTraceBack()
        {

        }

        stopTraceBack()
        {

        }

        static newForTesting()
        {
            let mc = new MissionComputer('Test Computer');

            mc.setPassword(
                Downlink.Password.randomDictionaryPassword()
            ).setEncryption(
                new Downlink.Encryption()
            );
        }

        static fromJSON(json)
        {
            let computer = new Computer();
            json = json?json:{};

            computer.setPassword(json.password, json.passwordType);
            if(json.encryption)
            {
                let encryption = Downlink.Encryption.fromJSON(json.encryption);
                computer.setEncryption(encryption);
            }
        }
    }

    Downlink.MissionComputer = MissionComputer;
})(window.jQuery);
