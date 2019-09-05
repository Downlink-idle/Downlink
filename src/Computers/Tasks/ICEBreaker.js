const Task = require('./Task');

class IceBreakerPoint
{
    constructor()
    {

    }
}

class IceBreaker extends Task
{
    constructor(ice)
    {
        super('ICE Breaker', ice);
        this.width = ice.width;
        this.height = ice.height;

    }
}
