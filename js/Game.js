// namespace for the entire game;
var Downlink = Downlink?Downlink:{};



(($)=>{
    class Game
    {
        static initialise()
        {
            if(Game.initialised)
            {
                return;
            }

            Game.initialised = true;

        }

        static start()
        {
            this.initialise();
        }
    }



})(window.jQuery);
