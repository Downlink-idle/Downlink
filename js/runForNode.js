const   $ = require('cheerio'),
        Downlink = require('./Downlink')($);
Downlink.initialise();
Downlink.start();
console.log(Downlink.availableMissions);
