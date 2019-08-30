const   PlayerComputer = require('./PlayerComputer'),
        Computer = require('./Computer'),
        CPU = require('./CPU'),
        PublicComputer= require('./PublicComputer'),
        MissionComputer = require('../Missions/MissionComputer'),
        constructors = {PlayerComputer:PlayerComputer, PublicComputer:PublicComputer, MissionComputer:MissionComputer};

const LAND_COLOR = 0xf2efe9;

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

function getRandomBoundInt(boundary)
{
    return getRandomIntInclusive(boundary.min, boundary.max);
}

function colorArrayToHex(colorArray)
{
    let [red, green, blue] = colorArray;
    let rgb = red * 256 * 256 + green * 256 + blue;
    return rgb;
}

class ComputerGenerator
{
    constructor()
    {
        this.canvasContext = null;
        this.boundaries = {};
    }


    /**
     *
     */
    getRandomLandboundPoint()
    {
        let point = null;
        while(point == null)
        {
            let testPoint= this.getRandomPointData();
            if(testPoint.color === LAND_COLOR)
            {
                point = testPoint;
            }
        }
        return point;
    }

    getRandomPointData()
    {
        let point = {
            x:getRandomBoundInt(this.boundaries.x),
            y:getRandomBoundInt(this.boundaries.y)
        };
        let color = this.canvasContext.getImageData(point.x, point.y, 1, 1).data;
        point.color =  colorArrayToHex(color);

        return point;
    }


    /**
     * In order to determine valid locations for any new computer, the class needs a reference to the image so that
     * a random point on the image|map is on a land mass. This method builds up a canvas and throws the image onto
     * the canvas. The canvas' context is then bound as an instance variable
     * @see getRandomLandboundPoint
     * @param mapImage
     */
    defineMapImage(canvas)
    {

        this.boundaries = {
            x:{min:0, max:canvas.width},
            y:{min:0, max:canvas.height}
        };
        this.canvasContext = canvas.getContext('2d');
        return this;
    }

    newPlayerComputer(location)
    {
        let potato = new PlayerComputer([new CPU()]);
        potato.setLocation(location?location:this.getRandomLandboundPoint());
        return potato;
    }

    newPublicServer(company)
    {
        let server = new PublicComputer(company.name+' Public Server');
        server.setCompany(company);
        return server;
    }

    fromJSON(computerJSON, company)
    {
        let computer = constructors[computerJSON.className].fromJSON(computerJSON, company);
        return computer;
    }
}



module.exports = new ComputerGenerator();
