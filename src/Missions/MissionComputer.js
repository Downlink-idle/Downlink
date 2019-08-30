const   Computer = require('../Computers/Computer');
class MissionComputer extends Computer
{
    constructor(company, serverType)
    {
        let name = company.name+' '+serverType;
        super(name, null);
        /**
         * @type {string}
         */
        this.serverType = serverType;
        /**
         * @type {Encryption}   The Encryption this computer has on it
         */
        this.encryption = null;
        /**
         * @type {Password}     The Password this computer has on it
         */
        this.password = null;
        /**
         * Whether or not this computer has been successfully hacked
         * @type {boolean}
         */
        this.accessible = false;
        /**
         * The current connection by which the player accesses this computer
         * @type {Connection}
         */
        this.currentPlayerConnection = null;
        /**
         * The  connection by which the player last accessed this computer
         * @type {Connection}
         */
        this.previousPlayerConnection = null;
        /**
         * Whether or not the administrator of this computer should have been alerted as to the breach
         * @type {boolean}
         */
        this.alerted = false;
        /**
         * The set of all challenges that need to be overcome in order to access this computer
         * @type {Array.<Challenge>}
         */
        this.challenges = [];

    }

    toJSON()
    {
        let json = super.toJSON();
        json.serverType = this.serverType;
    }

    fromJSON(companyJSON, company)
    {
        let computer = new MissionComputer(company, companyJSON.serverType);
        computer.setLocation(companyJSON.location);
    }

    /**
     * @param {Connection} connection
     */
    connect(connection)
    {
        super.connect();
        let clone = connection.clone();
        clone
            .once("connectionTraced", ()=>{
                this.trigger('hackTracked');
            }).on('stepTraced',(step)=>{
                this.trigger('connectionStepTraced', step);
            });
        this.currentPlayerConnection = clone;


        if(this.alerted)
        {
            if (this.currentPlayerConnection.equals(this.previousPlayerConnection))
            {
                this.resumeTraceBack();
            }
            else
            {
                this.startTraceBack();
            }
        }


        return this;
    }

    disconnect()
    {
        super.disconnect();
        this.currentPlayerConnection.close();
        this.previousPlayerConnection = this.currentPlayerConnection;
        this.stopTraceBack();
        return this;
    }

    setEncryption(encryption)
    {
        this.encryption = encryption;
        this.challenges.push(encryption);

        encryption
            .on('solved', ()=>{
                this.updateAccessStatus();
                encryption.off();
            })
            .on('start', ()=>{this.startTraceBack();});
        return this;
    }

    setPassword(password)
    {
        this.password = password;
        this.challenges.push(password);

        // password is not handled the same as encryption
        // because password is not a Tasks
        // the PasswordCracker Tasks isn't
        password.on('solved', ()=>{
            this.updateAccessStatus();
            password.off();
        }).on('start', ()=>{this.startTraceBack();});
        return this;
    }

    get difficultyModifier()
    {
        let mod = 0;
        for(let challenge of this.challenges)
        {
            mod += challenge.difficulty;
        }
        return mod;
    }

    updateAccessStatus()
    {
        if(!this.accessible)
        {
            let accessible = true;
            for(let challenge of this.challenges)
            {
                accessible = accessible && challenge.solved;
            }
            this.accessible = accessible;
        }

        if(this.accessible)
        {
            this.trigger('accessed');
        }
        return this.accessible;
    }

    tick()
    {
        if(this.tracingConnection)
        {
            this.currentPlayerConnection.traceStep(this.difficultyModifier);
        }
    }

    startTraceBack()
    {
        this.currentPlayerConnection.connect();
        this.tracingConnection = true;
    }

    resumeTraceBack()
    {
        this.currentPlayerConnection.reconnect();
        this.tracingConnection = true;
    }

    stopTraceBack()
    {
        this.tracingConnection = false;
    }
}

module.exports = MissionComputer;
