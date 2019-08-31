const   MissionGenerator = require('./Missions/MissionGenerator'),
        EventListener = require('./EventListener'),
        Connection = require('./Connection'),
        Company = require('./Companies/Company'),
        ComputerGenerator = require('./Computers/ComputerGenerator'),
        CPU = require('./Computers/CPU'),
        Decimal = require('break_infinity.js');

/**
 * This class serves to expose, to the front end, any of the game classes functionality that the UI needs access to
 * It exists only as a means of hard encapsulation
 * This exists as an instantiable class only because it's really difficult to get static classes to have events
 */
class Downlink extends EventListener
{
    constructor()
    {
        super();
        /**
         * @type {PlayerComputer}
         */
        this.playerComputer = null;
        /**
         *
         * @type {Connection}
         */
        this.playerConnection = null;
        this.getNewConnection();
        this.runTime = 0;
        this.lastTickTime = Date.now();

        this.currency = new Decimal(0);
    }

    getNewConnection()
    {
        this.playerConnection = new Connection("Player Connection");
        return this.playerConnection;
    }

    setPlayerComputer()
    {
        this.playerComputer = ComputerGenerator.newPlayerComputer();
        this.playerConnection.setStartingPoint(this.playerComputer);
        return this.playerComputer;
    }

    getPlayerComputer()
    {
        if(!this.playerComputer)
        {
            this.setPlayerComputer();
        }
        return this.playerComputer;
    }

    tick()
    {
        let now = Date.now();
        this.runTime += now - this.lastTickTime;

        this.playerComputer.tick();
        if(this.activeMission)
        {
            this.activeMission.tick();
        }
        this.lastTickTime = Date.now();
    }

    getNextMission()
    {
        this.activeMission = MissionGenerator.getFirstAvailableMission().on("complete", ()=>{
            this.finishCurrentMission(this.activeMission);
            this.trigger('missionComplete');
        });
        this.activeMission.computer.connect(this.playerConnection);
        for(let challenge of this.activeMission.challenges)
        {
            challenge.on("solved", ()=>{this.challengeSolved(challenge)});
            this.playerComputer.addTaskForChallenge(challenge);
        }
        return this.activeMission;
    }

    finishCurrentMission(mission)
    {
        this.currency = this.currency.add(mission.reward);
    }

    challengeSolved(challenge)
    {
        this.trigger("challengeSolved", challenge);
    }

    /**
     * Just exposing the currently available missions
     */
    get availableMissions()
    {
        return MissionGenerator.availableMissions;
    }

    get currentMissionTasks()
    {
        return this.playerComputer.missionTasks;
    }

    get allPublicServers()
    {
        let servers = [];
        for(let company of Company.allCompanies)
        {
            servers.push(company.publicServer);
        }
        return servers;
    }

    /**
     *
     * @returns {[<Company>]}
     */
    get companies()
    {
        return Company.allCompanies;
    }

    performPostLoad(canvas)
    {
        this.buildComputerGenerator(canvas);
        Company.setAllPublicServerLocations();
    }

    buildComputerGenerator(imageReference)
    {
        ComputerGenerator.defineMapImage(imageReference);
    }

    /**
     * @param {<Computer>} computer
     * @returns {<Connection>}
     */
    addComputerToConnection(computer)
    {
        let result = this.playerConnection.addComputer(computer);
        return result;
    }

    toJSON()
    {
        let json = {
            playerComputer:this.playerComputer.toJSON(),
            playerConnection:this.playerConnection.toJSON(),
            companies:[],
            currency:this.currency.toString(),
            runTime:this.runTime
        };
        for(let company of this.companies)
        {
            json.companies.push(company.toJSON());
        }
        return json;
    }

    static fromJSON(json)
    {
        Company.loadCompaniesFromJSON(json.companies);

        let downlink = new Downlink();

        downlink.currency = Decimal.fromString(json.currency);
        downlink.playerComputer = ComputerGenerator.fromJSON(json.playerComputer);
        downlink.runTime = parseInt(json.runTime);
        downlink.lastTickTime = Date.now();

        downlink.playerConnection = Connection.fromJSON(json.playerConnection);
        downlink.playerConnection.setStartingPoint(downlink.playerComputer);

        return downlink;
    }

    static getNew()
    {
        Company.buildCompanyList();

        let dl = new Downlink();
        return dl;
    }

    static stop()
    {

    }

    get secondsRunning()
    {
        return Math.floor(this.runTime / 1000);
    }

    canAfford(cost)
    {
        return this.currency.greaterThan(cost);
    }

    buyCPU(cpuData, slot)
    {
        let cpu = CPU.fromJSON(cpuData);
        this.currency = this.currency.minus(CPU.getPriceFor(cpuData));
        this.playerComputer.setCPUSlot(slot, cpu);

    }
}

module.exports = Downlink;
