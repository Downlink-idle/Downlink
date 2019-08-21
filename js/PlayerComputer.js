const   Password = require('./Challenges/Password'),
        {PasswordCracker, DictionaryCracker, SequentialAttacker} = require('./Tasks/PasswordCracker'),
        Encryption = require('./Challenges/Encryption'),
        EncryptionCracker = require('./Tasks/EncryptionCracker'),
        Computer = require('./Computer'),
        CPU = require('./CPU.js');

class PlayerComputer extends Computer
{
    constructor(cpus)
    {
        super('Home', null, '127.0.0.1');
        this.cpus = cpus;
    }

    addTaskForChallenge(challenge)
    {
        let task = null;

        if(challenge.constructor ==  Password)
        {

            task = new DictionaryCracker(challenge);
        }
        if(challenge.constructor ==  Encryption)
        {
            task = new EncryptionCracker(challenge);
        }
        console.log(task);
    }

    static getMyFirstComputer()
    {
        let potato = new PlayerComputer([
            new CPU()
        ]);
        return potato;
    }
}

module.exports = PlayerComputer;
