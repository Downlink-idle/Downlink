const   Password = require('./Challenges/Password'),
        {PasswordCracker, DictionaryCracker, SequentialAttacker} = require('./Tasks/PasswordCracker'),
        Encryption = require('./Challenges/Encryption'),
        EncryptionCracker = require('./Tasks/EncryptionCracker'),
        Computer = require('./Computer'),
        CPU = require('./CPU.js');

class InvalidTaskError extends Error{};

class PlayerComputer extends Computer
{
    constructor(cpus)
    {
        super('Home', null, '127.0.0.1');
        /**
         * @type {Array.<CPU>}
         */
        this.cpus = cpus;
        this.queuedTasks = [];
    }

    getTaskForChallenge(challenge)
    {
        let task = null;
        if(challenge instanceof Password)
        {
            task = new DictionaryCracker(challenge);
        }
        if(challenge instanceof  Encryption)
        {
            task = new EncryptionCracker(challenge);
        }
        if(!task)
        {
            throw new InvalidTaskError(`No task found for challenge ${challenge.constructor.name}`);
        }
        return task;
    }

    addTaskForChallenge(challenge)
    {
        let task = this.getTaskForChallenge(challenge),
            i= 0, searching = true, found = false;
        while(searching)
        {
            let cpu = this.cpus[i];
            try
            {
                cpu.addTask(task);
                searching = false;
                found = true;
            }
            catch(e)
            {
                console.log(e);
                i++;
                if (i == this.cpus.length)
                {
                    searching = false;
                }
            }
        }
    }

    tick()
    {
        for(let cpu of this.cpus)
        {
            cpu.tick();
        }
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
