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
               return;
            }

            Downlink.playerComputer = PlayerComputer.getMyFirstComputer();
            Downlink.initialised = true;
        }

        static start()
        {

        }

        static get availableMissions()
        {
            return MissionGenerator.availableMissions;
        }

        static stop()
        {

        }


    }

    return Downlink;
};
