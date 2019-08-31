const   Password = require('../Challenges/Password'),
        {DictionaryCracker, PasswordCracker} = require('../Tasks/PasswordCracker'),
        Encryption = require('../Challenges/Encryption'),
        EncryptionCracker = require('../Tasks/EncryptionCracker'),
        Computer = require('./Computer'),
        CPUPool = require('./CPUPool'),
        CPU = require('./CPU.js');

class InvalidTaskError extends Error{};
const DEFAULT_MAX_CPUS = 4;

class PlayerComputer extends Computer
{
    constructor(cpus, maxCPUs)
    {
        super('Home', null, '127.0.0.1');
        this.cpuPool = new CPUPool(cpus);
        this.cpuPool.on('cpuBurnedOut', ()=>{
            this.trigger('cpuBurnedOut');
        });
        this.queuedTasks = [];
        this.maxCPUs = maxCPUs?maxCPUs:DEFAULT_MAX_CPUS;
    }

    get cpus()
    {
        return this.cpuPool.cpus;
    }

    addCPU(cpu)
    {
        this.cpuPool.addCPU(cpu);
    }

    setCPUSlot(slot, cpu)
    {
        this.cpuPool.setCPUSlot(slot, cpu);
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
        let task = this.getTaskForChallenge(challenge);
        this.cpuPool.addTask(task);
    }

    tick()
    {
        this.cpuPool.tick();
    }


    get tasks()
    {
        return this.cpuPool.tasks;
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

    toJSON()
    {
        let json = super.toJSON();
        json.cpus = [];
        for(let cpu of this.cpus)
        {
            if(cpu)
            {
                json.cpus.push(cpu.toJSON());
            }
            else
            {
                json.cpus.push(null);
            }
        }
        return json;
    }

    static fromJSON(json)
    {
        let cpus = [];
        for(let cpuJSON of json.cpus)
        {
            if(cpuJSON)
            {
                cpus.push(CPU.fromJSON(cpuJSON));
            }
            else
            {
                cpus.push(null);
            }
        }
        let pc = new PlayerComputer(cpus);
        pc.setLocation(json.location);
        return pc;
    }
}

module.exports = PlayerComputer;
