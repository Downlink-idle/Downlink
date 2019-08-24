const   Computer = require('../Computer'),
        Decimal = require('decimal.js');
class MissionComputer extends Computer
{
    constructor(company, serverType)
    {
        let name = company.name+' '+serverType;
        super(name, company);
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

    /**
     * @param {Connection} connection
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
        let mod = new Decimal(1);
        for(let challenge of this.challenges)
        {
            mod = mod.plus(challenge.difficulty);
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

    startTraceBack()
    {

    }

    resumeTraceBack()
    {

    }

    stopTraceBack()
    {

    }
}

module.exports = MissionComputer;
