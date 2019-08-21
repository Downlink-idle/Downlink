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
        Downlink.initialised = true;
        return Downlink;
    }

    static tick()
    {
        Downlink.playerComputer.tick();
        if(!Downlink.activeMission)
        {
            Downlink.setCurrentMission(MissionGenerator.availableMissions.shift());
        }
        Downlink.activeMission.tick();
    }

    static setCurrentMission(mission)
    {
        Downlink.activeMission = mission.build();
        for(let target of Downlink.activeMission.hackTargets)
        {
            Downlink.playerComputer.addTaskForChallenge(target);
        }
    }

    static setActiveMission(activeMission)
    {
        Downlink.activeMission = activeMission;
    }



}

module.exports = Downlink;
