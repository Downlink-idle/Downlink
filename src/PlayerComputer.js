const   Password = require('./Challenges/Password'),
        {DictionaryCracker, PasswordCracker} = require('./Tasks/PasswordCracker'),
        Encryption = require('./Challenges/Encryption'),
        EncryptionCracker = require('./Tasks/EncryptionCracker'),
        Computer = require('./Computers/Computer'),
        CPU = require('./Computers/CPU.js');

class InvalidTaskError extends Error{};
class NoFreeCPUCyclesError extends Error{};

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
            try
            {
                let cpu = this.cpus[i];
                cpu.addTask(task);
                searching = false;
                found = true;
            }
            catch(e)
            {
                i++;
            }
        }
        if(!found)
        {
            throw new NoFreeCPUCyclesError(`Cannot find the cycles for ${challenge.name} on any of the CPUs`);
        }
    }

    tick()
    {
        for(let cpu of this.cpus)
        {
            cpu.tick();
        }
    }


    get tasks()
    {
        let tasks = {};
        for(let cpu of this.cpus)
        {
            for(let task of cpu.tasks)
            {
                tasks[task.name] = task;
            }
        }
        return tasks;
    }

    get missionTasks()
    {
        let allTasks = Object.values(this.tasks),
            missionTasks = {crackers:{}};
        for(let task of allTasks)
        {
            if(task instanceof PasswordCracker)
            {
                missionTasks.crackers.password = task;
            }
            if(task instanceof EncryptionCracker)
            {
                missionTasks.crackers.encryption = task;
            }
        }
        return missionTasks;

    }
}

module.exports = PlayerComputer;
