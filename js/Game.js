// namespace for the entire game;

(($)=>{
    const   Downlink = require('./Downlink'),
            TICK_INTERVAL_LENGTH=100,
            MISSION_LIST_CLASS = '.mission-list-row';

    let game = {
        interval:null,
        ticking:true,
        initialised:false,
        $missionContainer:null,
        $activeMission:null,
        initialise:function()
        {
            if(this.initialised)
            {
                return;
            }
            this.$missionContainer = $('#mission-list');
            this.$activeMission = $('#active-mission');
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
        updateMissionList:function(){
            this.$missionContainer.remove(MISSION_LIST_CLASS);
            this.$activeMission.text(Downlink.activeMission.name);
            let $html = '';
            for(let mission of Downlink.availableMissions)
            {
                $html += `<div class="row ${MISSION_LIST_CLASS}">${mission.name}</div>`;
            }
        }
    };

    Downlink.initialise();

    game.start();
    window.game = game;
})(window.jQuery);
