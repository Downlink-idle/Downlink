// namespace for the entire game;
var Downlink = Downlink?Downlink:{};

(function($){
    let cpu = new Downlink.CPU(),
        $currencyElement = $('#balance')
        $cpuContainer = $('.processes').first(),
        $quadraticGrid = $('#quadratic-equation-grid');

    let Game = {
        built:false,
        encryption:null,
        balance:0,
        balanceChange:false,
        playing:false,
        start:function()
        {
            if(!this.built)
            {
                Downlink.Alphabet.build();
                cpu.addTask(
                    new Downlink.Task('Tracer')
                ).addTask(
                    new Downlink.Task('Firewall')
                );

                this.built = true;
            }
            this.startNewEncryption();
            this.tickId = requestAnimationFrame(()=>{this.tick()});
            cpu.start();
            $(cpu).on('taskComplete', (event, task)=>{this.handleTaskCompletion(task);});
            cpu.$tasksRemainingElement = $cpuContainer;
            this.cpus = [cpu];
            this.playing = true;
        },
        stop:function() {
            cpu.stop();
            this.playing = false;
            cancelAnimationFrame(this.tickId);
        },
        handleTaskCompletion:function(task)
        {
            this.balance += task.getRewardRatio();
            this.balanceChange = true;
        },
        tick:function()
        {
            this.animateEncryptionGrid();
            this.animateCPUElement();
            if(this.balanceChange)
            {
                $currencyElement.html(this.balance.toFixed(2));
                this.balanceChange = false;
            }
            if(this.playing)
            {
                this.tickId = requestAnimationFrame(()=>{this.tick()});
            }
        },
        startNewEncryption:function()
        {
            this.encrypting = true;
            if(this.encryption)
            {
                return this.encryption;
            }

            this.encryption = new Downlink.Encryption(10, 10);
            cpu.addTask(this.encryption);
            $(this.encryption).on('complete', ()=>{this.finishEncryption();});
            return this.encryption;
        },
        finishEncryption:function()
        {
            this.encryption = null;
            if(this.encrypting)
            {
                this.startNewEncryption();
            }
        },
        stopEncrypting:function()
        {
            this.encrypting = false;
        },
        animateCPUElement:function()
        {

        },
        animateEncryptionGrid:function()
        {
            if(!this.encryption)
            {
                return;
            }
            let grid = this.encryption.grid,
                html = '';
            for(let row of grid)
            {
                html += '<div class="row">';
                for(let cell of row)
                {
                    html += `<div class="col ${cell.solved?"solved":"unsolved"}-quadratic-cell">${cell.letter}</div>`
                }
                html += '</div>';
            }
            $quadraticGrid.html(html);
        }
    };

    Downlink.Game = Game;
})(window.jQuery);
