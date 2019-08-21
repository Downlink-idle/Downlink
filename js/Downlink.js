module.exports= ($)=> {
    const   MissionGenerator = require('./Missions/MissionGenerator')($),
            PlayerComputer = require('./PlayerComputer')($);

    require('./plugins.js');


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
                Downlink.activeMission = MissionGenerator.availableMissions.shift().build();
            }
            Downlink.activeMission.tick();
        }

        static setActiveMission(activeMission)
        {
            Downlink.activeMission = activeMission;
        }



    }

    return Downlink;
};
