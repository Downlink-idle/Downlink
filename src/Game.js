// namespace for the entire game;

(($)=>{$(()=>{
    const   Downlink = require('./Downlink'),
            TICK_INTERVAL_LENGTH=100,
            MISSION_LIST_CLASS = 'mission-list-row',
            COMPANY_REP_CLASS = 'company-rep-row',
            PLAYER_COMPUTER_CPU_ROW_CLASS = "cpu-row";

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
        $playerCurrencySpan:null,
        $playerStandingsTitle:null,
        $playerComputerCPUListContainer:null,
        initialise:function()
        {
            if(this.initialised)
            {
                return;
            }
            /*
             * Bind the UI elements
             */
            this.$missionContainer = $('#mission-list');
            this.$activeMissionName = $('#active-mission');
            this.$activeMissionPassword = $('#active-mission-password-input');
            this.$activeMissionEncryptionGrid = $('#active-mission-encryption-grid');
            this.$activeMissionEncryptionType = $('#active-mission-encryption-type');
            this.$activeMissionIPAddress = $('#active-mission-server-ip-address');
            this.$activeMissionServerName = $('#active-mission-server-name');
            this.$playerCurrencySpan = $('#player-currency');
            this.$playerStandingsTitle = $('#player-company-standings-title');
            this.$playerComputerCPUListContainer = $('#player-computer-processors');

            // build the html elements that are used without missions stuff
            this.updatePlayerReputations();
            this.updateComputerBuild();

            /*
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
         * @param {PasswordCracker|undefined} passwordCracker
         */
        animatePasswordField:function(passwordCracker)
        {
            if(passwordCracker)
            {
                this.$activeMissionPassword
                    .val(passwordCracker.currentGuess)
                    .removeClass("solved-password unsolved-password")
                    .addClass(passwordCracker.completed ? "solved-password" : "unsolved-password");
            }
            else
            {
                this.$activeMissionPassword
                    .removeClass("unsolved-password")
                    .addClass('solved-password');
            }
        },
        /**
         *
         * @param {EncryptionCracker} encryptionCracker
         */
        animateEncryptionGrid:function(encryptionCracker)
        {
            let html = '';

            let grid = encryptionCracker.cellGridArrayForAnimating;

            for(let row of grid)
            {
                html += '<div class="row">';
                for(let cell of row)
                {
                    html += `<div class="col encryption-cell ${cell.solved?"solved-encryption-cell":"unsolved-encryption-cell"}">${cell.letter}</div>`;
                }
                html += '</div>';
            }
            this.$activeMissionEncryptionGrid.html(html);
        },
        getNewMission:function(){
            this.mission = Downlink.getNextMission()
                .on('complete', ()=>{
                    this.updatePlayerDetails();
                    this.getNewMission();
                });
            Downlink
                .on("challengeSolved", (task)=>{this.updateChallenge(task)});
            this.updateMissionInterface(this.mission);
        },
        updatePlayerDetails:function()
        {
            this.$playerCurrencySpan.html(Downlink.currency.toFixed(2));
            this.updatePlayerReputations();
        },
        updatePlayerReputations:function()
        {
            $(`.${COMPANY_REP_CLASS}`).remove();
            let html = '';
            for(let company of Downlink.companies)
            {
                html += `<div class="row ${COMPANY_REP_CLASS}"><div class="col">${company.name}</div><div class="col">${company.playerRespectModifier.toFixed(2)}</div></div>`;
            }
            this.$playerStandingsTitle.after(html);
        },
        updateComputerBuild:function()
        {
            $(`.${PLAYER_COMPUTER_CPU_ROW_CLASS}`).remove();

            let html = '';
            for(let cpu of Downlink.playerComputer.cpus)
            {
                html += `<div class="row ${PLAYER_COMPUTER_CPU_ROW_CLASS}"><div class="col">${cpu.name}</div><div class="col">${cpu.speed}MHz</div></div>`;
            }

            this.$playerComputerCPUListContainer.html(html);
        },
        updateChallenge:function(challenge)
        {
            switch(challenge.constructor.name)
            {
                case "Password":
                    this.animatePasswordField();
                    break;
            }
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
