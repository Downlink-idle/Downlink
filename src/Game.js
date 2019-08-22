// namespace for the entire game;

(($)=>{$(()=>{
    const   Downlink = require('./Downlink'),
            TICK_INTERVAL_LENGTH=100,
            MISSION_LIST_CLASS = 'mission-list-row';

    let game = {
        interval:null,
        ticking:true,
        initialised:false,
        mission:false,
        /**
         * jquery entities that are needed for updating
         */
        $missionContainer:null,
        $activeMissionName:null,
        $activeMissionPassword:null,
        $activeMissionEncryptionGrid:null,
        $activeMissionEncryptionType:null,
        $activeMissionIPAddress:null,
        $activeMissionServerName:null,
        initialise:function()
        {
            if(this.initialised)
            {
                return;
            }
            this.$missionContainer = $('#mission-list');
            this.$activeMissionName = $('#active-mission');
            this.$activeMissionPassword = $('#active-mission-password-input');
            this.$activeMissionEncryptionGrid = $('#active-mission-encryption-grid');
            this.$activeMissionEncryptionType = $('#active-mission-encryption-type');
            this.$activeMissionIPAddress = $('#active-mission-server-ip-address');
            this.$activeMissionServerName = $('#active-mission-server-name');
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
                this.animateTick();
                this.interval = window.setTimeout(() => {this.tick()}, TICK_INTERVAL_LENGTH);
            }
        },
        animateTick:function()
        {
            let tasks = Downlink.currentMissionTasks;
            if(tasks.crackers.password)
            {
                this.animatePasswordField(tasks.crackers.password);
            }
            if(tasks.crackers.encryption)
            {
                this.animateEncryptionGrid(tasks.crackers.encryption);
            }
        },
        /**
         *
         * @param {PasswordCracker} passwordCracker
         */
        animatePasswordField(passwordCracker)
        {
            this.$activeMissionPassword.val(passwordCracker.currentGuess)
                .removeClass("solvedPassword unsolvedPassword")
                .addClass(passwordCracker.isSolved?"solvedPassword":"unsolvedPassword");
        },
        /**
         *
         * @param {EncryptionCracker} encryptionCracker
         */
        animateEncryptionGrid(encryptionCracker)
        {

        },
        getNewMission:function(){
            console.log("Getting mission");
            let mission = Downlink.getNextMission();
            this.updateMissionInterface(mission);
            mission.on('complete', ()=>{
                //this.getNewMission();
            });
            this.mission = mission;
        },
        /**
         *
         * @param {Mission} mission
         */
        updateMissionInterface:function(mission){
            this.updateAvailableMissionList(mission);
            this.updateCurrentMissionView(mission.computer);

        },
        updateCurrentMissionView:function(server){
            this.$activeMissionPassword.val('');
            this.$activeMissionEncryptionGrid.empty();
            this.$activeMissionEncryptionType.html(server.encryption.name);
            this.$activeMissionIPAddress.html(server.ipAddress);
            this.$activeMissionServerName.html(server.name);
        },
        updateAvailableMissionList:function(mission){
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
