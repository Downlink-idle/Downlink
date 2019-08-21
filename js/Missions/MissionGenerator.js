module.exports = ($)=> {
    const   Mission = require('./Mission')($),
            MINIMUM_MISSIONS = 10;
    let availableMissions = [];

    class MissionGenerator
    {
        static updateAvailableMissions()
        {
            while(availableMissions.length < MINIMUM_MISSIONS)
            {
                availableMissions.push(
                    Mission.getNewSimpleMission()
                );
            }
        }

        static get availableMissions()
        {
            this.updateAvailableMissions();
            return availableMissions;
        }
    }

    return MissionGenerator;
};
