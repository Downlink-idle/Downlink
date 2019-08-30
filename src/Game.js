// This file is solely responsible for exposing the necessary parts of the game to the UI elements
(($)=>{$(()=>{

    const   Downlink = require('./Downlink'),
            CPU = require('./Computers/CPU'),
            Decimal = require('break_infinity.js'),
            TICK_INTERVAL_LENGTH=100,
            MISSION_LIST_CLASS = 'mission-list-row',
            COMPANY_REP_CLASS = 'company-rep-row',
            PLAYER_COMPUTER_CPU_ROW_CLASS = "cpu-row";

    function parseVersionNumber(versionNumberAsString)
    {
        let parts = versionNumberAsString.split('.'),
            partAsNumber = 0;
        for(let partIndex in parts)
        {
            partAsNumber +=  parts[partIndex] * Math.pow(1000, parts.length - 1 - partIndex);
        }
        return partAsNumber
    }

    function saveIsOlder(oldVersionString, currentVersionString)
    {
        let oldVersion = parseVersionNumber(oldVersionString),
            currentVersion = parseVersionNumber(currentVersionString);

        return oldVersion < currentVersion;
    }

    let game = {
        interval:null,
        ticking:true,
        initialised:false,
        takingMissions:false,
        mission:false,
        computer:null,
        downlink:null,
        version:"0.3.0a",
        requiresHardReset:true,
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
        $worldMapModal:null,
        $worldMapContainer:null,
        $worldMapCanvasContainer:null,
        $activeMissionServer:null,
        $settingsTimePlayed:null,
        $settingsModal:null,
        $importExportTextarea:null,
        $computerBuildModal:null,
        $computerBuild:null,
        $computerPartsCPURow:null,
        $connectionLength:null,
        $connectionTraced:null,
        $connectionWarningRow:null,
        /**
         * HTML DOM elements, as opposed to jQuery entities for special cases
         */
        mapImageElement:null,
        bindUIElements:function()
        {
            this.$missionContainer = $('#mission-list');
            this.$activeMissionName = $('#active-mission');
            this.$activeMissionServer = $('#active-mission-machine-details');
            this.$activeMissionPassword = $('#active-mission-password-input');
            this.$activeMissionEncryptionGrid = $('#active-mission-encryption-grid');
            this.$activeMissionEncryptionType = $('#active-mission-encryption-type');
            this.$activeMissionIPAddress = $('#active-mission-server-ip-address');
            this.$activeMissionServerName = $('#active-mission-server-name');
            this.$playerCurrencySpan = $('#player-currency');
            this.$playerStandingsTitle = $('#player-company-standings-title');
            this.$playerComputerCPUListContainer = $('#player-computer-processors');
            this.$worldMapModal = $('#connection-modal');
            this.$worldMapContainer = $('#world-map');
            this.$worldMapCanvasContainer = $('#canvas-container');
            this.$worldMapModal.on("hide.bs.modal", ()=>{this.afterHideConnectionManager()});
            this.$settingsTimePlayed = $('#settings-time-played');
            this.$settingsModal = $('#settings-modal');
            this.$importExportTextarea = $('#settings-import-export');
            this.$computerBuildModal = $('#computer-build-modal');
            this.$computerBuild = $('#computer-build-layout');
            this.$computerPartsCPURow = $('#computer-parts-cpu-row');
            this.$connectionLength = $('#connection-length');
            this.$connectionTraced = $('#connection-traced');
            this.$connectionWarningRow = $('#connection-warning-row');

            $('#settings-export-button').click(()=>{
                this.$importExportTextarea.val(this.save());
            });
            $('#settings-import-button').click(()=>{this.importFile(this.$importExportTextarea.val())});
            $('#settings-save-button').click(()=>{this.saveFile();});
            $('#connectionModalLink').click(()=>{this.showConnectionManager();});
            $('#settingsModalLink').click(()=>{this.showSettingsModal();});
            $('#game-version').html(this.version);
            $('#computerModalLink').click(()=>{this.showComputerBuildModal()});
            $('#start-missions-button').click(()=>{this.takingMissions = true; this.getNextMission();});
            $('#stop-missions-button').click(()=>{this.takingMissions = false;});
        },
        buildWorldMap:function()
        {
            // resizing the worldmap container
            let image = new Image();
            this.mapImageElement = image;
            let dimensionBounds = {x:{min:0, max:0}, y:{min:0, max:0}};
            /*
             This is needed so that we can know what the image values are before the game loads
             */
            let p = new Promise((resolve, reject)=>{

                image.onload =()=>{
                    this.buildCanvas();
                    resolve();
                };
                image.src = './img/osm-world-map.png';
            });

            return p;
        },
        getFreshCanvas()
        {
            let canvas = document.createElement('canvas');
            canvas.width = this.mapImageElement.width;
            canvas.height = this.mapImageElement.height;
            canvas
                .getContext('2d')
                .drawImage(
                    this.mapImageElement, 0, 0,
                    this.mapImageElement.width, this.mapImageElement.height
                );
            this.$worldMapCanvasContainer.empty().append($(canvas));
            return canvas;
        },
        /**
         * Using a canvas for two reasons. JavaScript requires one to figure out whether a random point is landbound or not
         * This will pass a fresh copy of the canvas to the Downlink object to keep for that purpose and also draw
         * one to the dom. The one on the dom will be drawn to and deleted and drawn to and deleted, but the
         * Downlink object needs to know the raw one.
         * @param image
         */
        buildCanvas:function()
        {
            this.downlink.performPostLoad(this.getFreshCanvas());

            this.$worldMapContainer.css({
                height:this.mapImageElement.height+'px',
                width:this.mapImageElement.width+'px'
            });
        },
        newGame:function()
        {
            this.downlink = Downlink.getNew();
        },
        loadGame:function(json)
        {
            this.downlink = Downlink.fromJSON(json);
        },
        saveFile:function()
        {
            let data = new Blob([this.save()], {type: 'text/plain'}),
                urlParam = window.URL.createObjectURL(data),
                a = document.createElement('a');
            a.href = urlParam;
            a.download = 'Downlink-Save.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },
        importFile:function(json)
        {
            this.stop();
            this.initialised = false;
            this.loadGame(json);
            this.performPostLoadCleanup().then(()=>{
                this.start();
            });
        },
        needsHardReset:function(saveFile)
        {
            if(!saveFile.version)
            {
                return true;
            }
            return (this.requiresHardReset && saveIsOlder(saveFile.version, this.version));
        },
        initialise:function()
        {
            this.bindUIElements();

            let saveFile = this.load();
            if (saveFile && !this.needsHardReset(saveFile))
            {
                this.loadGame(saveFile);
            }
            else
            {
                this.newGame();
            }

            return this.performPostLoadCleanup();
        },
        performPostLoadCleanup:function()
        {
            this.updatePlayerDetails();

            this.initialised = true;
            return this.buildWorldMap().then(()=>{

                let pc = this.downlink.getPlayerComputer();
                this.addComputerToWorldMap(pc);
                this.updateComputerBuild();
                this.buildComputerPartsUI();
                this.buildComputerGrid();

                this.addPublicComputersToWorldMap();
                this.$connectionLength.html(this.downlink.playerConnection.connectionLength);
                this.showOrHideConnectionWarning();

                this.ticking = true;
                this.updateConnectionMap();
            });
        },
        addPublicComputersToWorldMap:function()
        {
            for(let computer of this.downlink.allPublicServers)
            {
                this.addComputerToWorldMap(computer, ()=>{
                    this.addComputerToConnection(computer);
                });
            }
        },
        addComputerToConnection:function(computer)
        {
            this.downlink.addComputerToConnection(computer);
            this.updateConnectionMap();
        },
        updateConnectionMap:function()
        {
            let connection = this.downlink.playerConnection;
            let context = this.getFreshCanvas().getContext('2d');
            let currentComputer = this.downlink.playerComputer;
            for(let computer of connection.computers)
            {
                // connect the current computer to the current computer in the connection
                context.beginPath();
                context.moveTo(currentComputer.location.x, currentComputer.location.y);
                context.lineTo(computer.location.x, computer.location.y);
                context.stroke();
                // set the currentComputer to be the current computer in the connection
                currentComputer = computer;
            }
        },
        start:function(){
            this.ticking = true;
            if(this.initialised)
            {
                this.tick();
            }
            else
            {
                this.initialise().then(() => {
                    this.tick();
                });
            }
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
                    this.downlink.tick();
                    this.animateTick();
                    this.interval = window.setTimeout(() => {this.tick()}, TICK_INTERVAL_LENGTH);
                    this.$settingsTimePlayed.html(this.getRunTime());
                }
            }
            catch(e)
            {
                console.log(e);
            }
        },
        animateTick:function()
        {
            let tasks = this.downlink.currentMissionTasks;
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
            let height = this.$activeMissionEncryptionGrid.height(),
                cellHeight = height / grid.length;

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

            $('.encryption-cell').css('max-width', cellHeight+'px');
        },
        getNextMission:function(){
            if(!this.takingMissions)
            {
                return false;
            }
            this.$activeMissionServer.show();
            this.$connectionTraced.html(0);
            this.mission = this.downlink.getNextMission()
                .on('complete', ()=>{
                    this.updatePlayerDetails();
                    this.updateComputerPartsUI();
                    this.getNextMission();
                }).on("connectionStepTraced", (stepsTraced)=>{
                    this.$connectionTraced.html(stepsTraced);
                });
            this.downlink
                .on("challengeSolved", (task)=>{this.updateChallenge(task)});
            this.updateMissionInterface(this.mission);
            this.save();
        },
        updatePlayerDetails:function()
        {
            this.$playerCurrencySpan.html(this.downlink.currency.toFixed(2));
            this.updatePlayerReputations();
        },
        updatePlayerReputations:function()
        {
            $(`.${COMPANY_REP_CLASS}`).remove();
            let html = '';
            for(let company of this.downlink.companies)
            {
                html += `<div class="row ${COMPANY_REP_CLASS}"><div class="col">${company.name}</div><div class="col-2">${company.playerRespectModifier.toFixed(2)}</div></div>`;
            }
            this.$playerStandingsTitle.after(html);
        },
        updateComputerBuild:function()
        {
            $(`.${PLAYER_COMPUTER_CPU_ROW_CLASS}`).remove();

            let html = '';
            for(let cpu of this.downlink.playerComputer.cpus)
            {
                if(cpu)
                {
                    html += `<div class="row ${PLAYER_COMPUTER_CPU_ROW_CLASS}"><div class="col">${cpu.name}</div><div class="col">${cpu.speed}MHz</div></div>`;
                }
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
            for(let mission of this.downlink.availableMissions)
            {
                html += `<div class="row ${MISSION_LIST_CLASS}"><div class="col">${mission.name}</div></div>`;
            }
            let $html = $(html);
            this.$missionContainer.append($html);
        },
        addComputerToWorldMap(computer, callback)
        {
            let $node = $('<div/>')
                .addClass('computer')
                .attr('title', computer.name)
                .addClass(computer.constructor.name);
            if(callback)
            {
                $node.on("click", callback);
            }

            this.$worldMapContainer.append($node);
            let width = parseInt($node.css('width'), 10),
                height = parseInt($node.css('height'), 10);
            // This makes sure that the centre of the location is the centre of the div
            // which means that the lines between computer points go from centre point to centre point
            // instead of top left to top left
            $node.css({
                top:(computer.location.y - height / 2)+'px',
                left:(computer.location.x - width / 2)+'px'
            })
        },
        hardReset:function()
        {
            this.stop();
            localStorage.clear();
        },
        getJSON:function()
        {
            return this.downlink.toJSON();
        },
        save:function()
        {
            let json = this.getJSON();
            json.version = this.version;
            let jsonAsString = JSON.stringify(json),
                jsonAsAsciiSafeString = btoa(jsonAsString);
            localStorage.setItem('saveFile', jsonAsAsciiSafeString);
            return jsonAsAsciiSafeString;
        },
        parseLoadFile:function(loadFile)
        {
            let jsonAsString = atob(loadFile), json = JSON.parse(jsonAsString);
            return json;
        },
        load:function()
        {
            let jsonAsAsciiSafeString = localStorage.getItem('saveFile');
            if(jsonAsAsciiSafeString)
            {
                return this.parseLoadFile(jsonAsAsciiSafeString);
            }
            return null;
        },
        showConnectionManager:function()
        {
            this.takingMissions = false;
            this.$worldMapModal.modal({keyboard:false, backdrop:"static"});
        },
        showOrHideConnectionWarning:function()
        {
            if(this.downlink.playerConnection.connectionLength < 4)
            {
                this.$connectionWarningRow.show();
            }
            else
            {
                this.$connectionWarningRow.hide();
            }
        },
        afterHideConnectionManager:function()
        {
            this.$connectionTraced.html(0);
            this.$connectionLength.html(this.downlink.playerConnection.connectionLength);
            this.showOrHideConnectionWarning();
            this.takingMissions = true;
        },
        getRunTime:function()
        {
            return this.downlink.secondsRunning;
        },
        showSettingsModal:function()
        {
            this.$settingsModal.modal({keyboard:false, backdrop:"static"});
        },
        showComputerBuildModal:function()
        {
            this.$computerBuildModal.modal({keyboard:false, backdrop:"static"});
        },
        buildComputerPartsUI:function()
        {
            this.$computerPartsCPURow.empty();
            for(let cpu of CPU.getCPUs())
            {
                let cost = CPU.getPriceFor(cpu),
                    affordable = this.downlink.canAfford(cost);
                let $node = $(`<div data-part-cost="${cost.toString()}" class="col-4 cpu part ${affordable?"":"un"}affordable-part">
                        <div class="row"><div class="col"><i class="fas fa-microchip"></i></div></div>
                        <div class="row"><div class="col">${cpu.name}</div></div>
                        <div class="row"><div class="col">${cpu.speed} MHz</div></div>
                        <div class="row"><div class="col">${cost.toString()}</div></div>
                    </div>`);
                $node.click(() => {
                    this.setChosenPart(cpu, 'CPU', cost, $node);
                });

                this.$computerPartsCPURow.append($node);
            }
        },
        setChosenPart(part, type, cost, $node)
        {
            if(!this.downlink.canAfford(cost))
            {
                return;
            }
            $('.chosenPart').removeClass('chosenPart');
            if(part === this.chosenPart)
            {
                this.chosenPart = null;
                return;
            }
            this.chosenPart = part;
            $node.addClass('chosenPart');
        },
        updateComputerPartsUI:function()
        {
            let downlink = this.downlink
            $('.part').each(function(index){
                let $node = $(this),
                    cost = new Decimal($node.data('partCost')),
                    canAfford = downlink.canAfford(cost);
                $node.removeClass('affordable-part unaffordable-part').addClass(
                    (canAfford?'':'un')+'affordable-part'
                );
            });
        },
        buildComputerGrid:function()
        {
            this.$computerBuild.empty();

            let pc = this.downlink.playerComputer,
                gridSize = Math.floor(Math.sqrt(pc.maxCPUs)),
                html = '',
                cpuCount = 0;
            for(let i = 0; i < gridSize; i++)
            {
                html += '<div class="row cpuRow">'
                for(let j = 0; j < gridSize; j++)
                {
                    html += `<div data-cpu-slot="${cpuCount}" class="col cpuHolder">${pc.cpus[cpuCount]?'<i class="fas fa-microchip"></i>':''}</div>`;
                    cpuCount++;
                }
                html += '</div>';
            }
            this.$computerBuild.html(html);
            $('.cpuHolder').click((evt)=> {
                let cpuSlot = $(evt.currentTarget).data('cpuSlot');
                this.buyCPU(cpuSlot)
            });
            $('.cpuRow').css('width', gridSize * 30);
        },
        buyCPU:function(cpuSlot)
        {
            if(!this.chosenPart || !this.downlink.canAfford(CPU.getPriceFor(this.chosenPart)))
            {
                return;
            }
            this.downlink.buyCPU(this.chosenPart, cpuSlot);
            this.buildComputerGrid();
            this.updateComputerBuild();
        }
    };

    game.start();

    window.game = game;
})})(window.jQuery);
