#Downlink

##About the project

A html5+jQuery fronted set of javascript classes I am in the process of turning into an idle game.
Shamelessly inspired by the 2001 hacking simulator [Uplink](https://en.wikipedia.org/wiki/Uplink_%28video_game%29) ([Introversion Uplink Page](https://www.introversion.co.uk/uplink/), [Steam page](https://store.steampowered.com/app/1510/Uplink/)).

All of the code in js/bundle.js is built using [Browserify](http://browserify.org/) as a node build command.
I don't currently program anything for node, but I like the clean code that comes from writing for node so I have used it to help me to write cleaner code.

The current game loop abstracts a simulated computer solving some simulated problems. The Game.js file is what is exposed to the browser and is the only file that expects to see the window object at all.
The game JSON object requires Downlink which module.exports an instance of a class to encompass the game's business logic, where Game.js is solely concerned with what to do with the browser's DOM (which I render using [Bootsrap](https://getbootstrap.com/) and update with [jquery](https://jquery.com/) via their respective CDNs).

The Game class isntantiates a Downlink Object and adds some listeners to it.

At present the primitive game loop looks like this:
1) Game Object asks Downlink to tick which
    1) tells its simulated pc to tick
    2) tells its simulated mission to tick (which is currently just a void method that does nothing, but I envisage doing the likes of the connection tracing that Uplink had)
2) finally draws the UI information for the Downlink object
   
Any time the Downlink object fires off a missionComplete event the Game Object asks Downlink to choose a new mission for itself.

This game loop is always going to be running in the background but there will be a few more things added to it before the game is done. 

Any time a Mission is requested, it creates a computer which has some challenges that must be solved in order for the mission computer (an extended Computer class) to tell the mission it's done.
When the mission is done it triggers an event. These tasks are passed to the player's computer which adds tasks to its CPUs. When those tasks solve their challenges, they tell the CPU they're done.

The current very primitive UI can be seen at the [git hub pages branch page](https://cuannan.github.io/Downlink/).  
