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
            console.log('Getting new mission');
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



}

module.exports = Downlink;
