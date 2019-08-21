// namespace for the entire game;

(($)=>{
    const   Downlink = require('./Downlink'),
            TICK_INTERVAL_LENGTH=100;
    Downlink.initialise();

    let game = {
        interval:null,
        ticking:true,
        start:function(){
            this.ticking = true;
            this.tick();
        },
        stop:function(){
            console.log('Stopping tick interval');
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
    };

    game.start();
})(window.jQuery);
