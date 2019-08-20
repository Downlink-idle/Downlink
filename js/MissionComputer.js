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
            this.alerted = false;
        }

        /**
         * @param {Downlink.Connection} connection
         */
        connect(connection)
        {
            connection.open();
            super.connect();
            this.currentPlayerConnection = connection;

            if(this.currentPlayerConnection.equals(this.previousPlayerConnection) && this.alerted === true)
            {
                this.resumeTraceBack();
            }

            return this;
        }

        disconnect()
        {
            super.disconnect();
            this.currentPlayerConnection.close();
            this.stopTraceBack();
            return this;
        }

        setEncryption(encryption)
        {
            this.encryption = encryption;

            $(encryption)
                .on('complete', ()=>{
                    this.updateAccessStatus();
                    $(encryption).off();
                })
                .on('start', ()=>{this.startTraceBack();});
            return this;
        }

        setPassword(password)
        {
            this.password = password;
            // password is not handled the same as encryption
            // because password is not a Task
            // the PasswordCracker Task isn't
            $(password).on('solved', ()=>{
                $(password).off();
                this.updateAccessStatus();
            }).on('start', ()=>{this.startTraceBack();});
            return this;
        }

        updateAccessStatus()
        {
            this.accessible = this.accessible || (this.encryption && this.encryption.solved && this.password && this.password.solved);
            return this.accessible;
        }

        startTraceBack()
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
            return new MissionComputer('Test Computer')
                .setPassword(
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
