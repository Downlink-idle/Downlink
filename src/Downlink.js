const   MissionGenerator = require('./Missions/MissionGenerator'),
        PlayerComputer = require('./PlayerComputer'),
        EventListener = require('./EventListener'),
        Company = require('./Company'),
        Decimal = require('decimal.js');

/**
 * This exists as an instantiable class only because it's really difficult to get static classes to have events
 */
class Downlink extends EventListener
{
    constructor()
    {
        super();
        this.playerComputer = PlayerComputer.getMyFirstComputer();
        this.currency = new Decimal(0);
    }

    tick()
    {
        this.playerComputer.tick();
        this.activeMission.tick();
    }

    getNextMission()
    {
        this.activeMission = MissionGenerator.getFirstAvailableMission().on("complete", ()=>{
            this.finishCurrentMission(this.activeMission);
        });
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

    /**
     *
     * @returns {[<Company>]}
     */
    get companies()
    {
        return Company.allCompanies;
    }
}

module.exports = new Downlink();
