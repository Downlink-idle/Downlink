// namespace for the entire game;

(($)=>{$(()=>{
    const   Downlink = require('./Downlink'),
            TICK_INTERVAL_LENGTH=100,
            MISSION_LIST_CLASS = 'mission-list-row';

    let game = {
        interval:null,
        ticking:true,
        initialised:false,
        $missionContainer:null,
        $activeMissionName:null,
        $activeMissionPassword:null,
        initialise:function()
        {
            if(this.initialised)
            {
                return;
            }
            this.$missionContainer = $('#mission-list');
            this.$activeMissionName = $('#active-mission');
            this.getNewMission();
            this.initialised = true;
        },
        start:function(){
            this.initialise();
            this.ticking = true;
            this.tick();
        },
        stop:function(){
            this.ticking = false;
            window.clearTimeout(this.interval);
        },
        tick:function(){
            if(this.ticking)
            {
                Downlink.tick();
                this.interval = window.setTimeout(() => {this.tick()}, TICK_INTERVAL_LENGTH);
            }
        },
        getNewMission:function(){
            let mission = Downlink.getNextMission();
            this.updateMissionInterface();
            mission.on('complete', ()=>{
                this.getNewMission();
            });
        },
        updateMissionInterface:function(){
            this.updateAvailableMissionList();
            this.updateCurrentMissionView();
        },
        updateCurrentMissionView:function(){

        },
        updateAvailableMissionList:function(){
            $('.'+MISSION_LIST_CLASS).remove();
            this.$activeMissionName.html(Downlink.activeMission.name);
            let html = '';
            for(let mission of Downlink.availableMissions)
            {
                html += `<div class="row ${MISSION_LIST_CLASS}">${mission.name}</div>`;
            }
            let $html = $(html);
            this.$missionContainer.append($html);
        }
    };
    game.start();
    window.game = game;
})})(window.jQuery);
