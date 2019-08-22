const   MissionGenerator = require('./Missions/MissionGenerator'),
        PlayerComputer = require('./PlayerComputer');

class Downlink
{
    static initialise()
    {
        if(Downlink.initialised)
        {
            return Downlink;
        }

        Downlink.playerComputer = PlayerComputer.getMyFirstComputer();
        Downlink.getNextMission();

        Downlink.initialised = true;

        return Downlink;
    }

    static tick()
    {
        Downlink.playerComputer.tick();
        Downlink.activeMission.tick();
    }

    static getNextMission()
    {
        let mission = MissionGenerator.availableMissions.shift();

        $(mission).on('complete', ()=>{
            this.getNextMission();
        });
        Downlink.activeMission = mission.build();
        for(let target of Downlink.activeMission.hackTargets)
        {
            Downlink.playerComputer.addTaskForChallenge(target);
        }

        return mission;
    }

    static setActiveMission(activeMission)
    {
        Downlink.activeMission = activeMission;
    }

    /**
     * Just exposing the currently available missions
     */
    static get availableMissions()
    {
        return MissionGenerator.availableMissions;
    }

}

module.exports = Downlink;
