const fs = require('fs'),
    PNG  = require('pngjs').PNG;
let validPoints = [];


fs.createReadStream('./img/osm-world-map.png')
    .pipe(new PNG({filterType:4}))
    .on("parsed", function()
    {
        let landPointX = 622,
            landPointY = 276,
            idx = (this.width * landPointY + landPointX) <<2;
        const LAND_COLOR = this.data[idx] * 255 * 255 + this.data[idx+1] * 255 + this.data[idx+2];


        for(let y = 0; y < this.height; y++)
        {
            for (let x = 0; x < this.width; x++)
            {
                let idx = (this.width * y + x) << 2,
                    red = this.data[idx] * 255 * 255,
                    green = this.data[idx+1] * 255,
                    blue = this.data[idx+2],
                    color = red + green + blue;
                if(color === LAND_COLOR)
                {
                    validPoints.push({x:x,y:y,color:color});
                }
            }
        }

        let pointsToSave = [];
        validPoints.forEach(function(element, index){
            if(index % 100 === 0)
            {
                pointsToSave.push(element);
            }
        });

        fs.writeFile("./worldMapPoints.js", "module.exports = "+ JSON.stringify(pointsToSave), function(err){
            if(err)
            {
                console.log(err);
            }
            else
            {
                console.log(pointsToSave.length);
            }
        });
    });
