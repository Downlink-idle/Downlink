module.exports = ($)=>{
    const   PasswordCracker = require('./Tasks/PasswordCracker')($),
            EncryptionCracker = require('./Tasks/EncryptionCracker')($),
            Computer = require('./Computer')($),
            CPU = require('./CPU.js')($);

    class PlayerComputer extends Computer
    {
        constructor(cpus)
        {
            super('Home', null, '127.0.0.1');
            this.tasks = {};
            this.cpus = cpus;
        }

        static getMyFirstComputer()
        {
            let potato = new PlayerComputer([
                new CPU()
            ]);
            return potato;
        }
    }

    return PlayerComputer;

};
