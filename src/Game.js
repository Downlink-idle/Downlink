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
        computer:null,
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
            /**
             * Bind the UI elements
             * @type {*|jQuery|HTMLElement}
             */
            this.$missionContainer = $('#mission-list');
            this.$activeMissionName = $('#active-mission');
            this.$activeMissionPassword = $('#active-mission-password-input');
            this.$activeMissionEncryptionGrid = $('#active-mission-encryption-grid');
            this.$activeMissionEncryptionType = $('#active-mission-encryption-type');
            this.$activeMissionIPAddress = $('#active-mission-server-ip-address');
            this.$activeMissionServerName = $('#active-mission-server-name');

            /**
             * expose the player computer class for test purposes
             */
            this.computer = Downlink.playerComputer;

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
        tick:function() {
            try
            {
                if (this.ticking)
                {
                    Downlink.tick();
                    this.animateTick();
                    this.interval = window.setTimeout(() => {this.tick()}, TICK_INTERVAL_LENGTH);
                }
            }
            catch(e)
            {
                console.log(e);
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
                .addClass(passwordCracker.completed?"solvedPassword":"unsolvedPassword");
        },
        /**
         *
         * @param {EncryptionCracker} encryptionCracker
         */
        animateEncryptionGrid(encryptionCracker)
        {
            let html = '';

            let grid = encryptionCracker.cellGridArrayForAnimating;
            for(let row of grid)
            {
                html += '<div class="row">';
                for(let cell of row)
                {
                    html += `<div class="col ${cell.solved?"solved-encryption-cell":"unsolved-encryption-cell"}">${cell.letter}</div>`;
                }
                html += '</div>';
            }
            this.$activeMissionEncryptionGrid.html(html);
        },
        getNewMission:function(){
            let mission = Downlink.getNextMission();
            this.updateMissionInterface(mission);
            mission.on('complete', ()=>{
                this.getNewMission();
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
            this.$activeMissionName.html(mission.name);
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
