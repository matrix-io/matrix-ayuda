

// Both generate fake data
const faker = require('faker');
const casual = require('casual');

// moment + twix ( moment addon )
const moment = require('moment');
require('twix');

Models = {

    // Hardware device
    Player: Player,

    // Collection of ads, a loop -- holds playlogs
    Face: Face,

    // A single ad
    Ad: Ad

};

module.exports = Models;


const generate = {

    fake : faker.fake,
    internet : faker.internet,
    random : faker.random,
    timezone : casual.timezone,
    system : faker.system

};



/**
 * @param  {string} timezone - string of form 'country/state' e.g. 'America/Los_Angeles'
 * @constructor build a instance of a player with all time information configured according to timezone
 */

function Player( timezone ){

    this._timezone = function(date) {

        return moment.tz(date, timezone);

    };

    this.info = {

        Name : timezone,

        // Player id's
        PlayerID : generate.random.uuid(),
        PlayerModelID : generate.random.uuid(),

        // network
        HostName : generate.fake("DESKTOP-{{random.uuid}}"),
        IPAddress : generate.internet.ip(),
        MACAddress : generate.internet.mac().replace(':','-'),
        Code : generate.internet.mac().replace(':', ''),
        NetworkName : generate.fake("DESKTOP-{{random.uuid}}"),

        // Config
        IsDecommisioned : false,
        PlayerRemoteControlUrlParams : null,
        PlayerScreenShotUrlParams : null,
        EnableSynchronization : false,
        SynchronizationGroupName : "",

        // System
        HardDriveCapacity : ( 60*Math.random() )*1000,
        RAMQuantity : 1440,
        CPUType : "Unknown",
        RAMType : "Unknown",
        OS : "Win32NT",
        OSVersion : "Microsoft Windows NT 6.2.9200.0",
        PlayerSoftwareVersion : "7.2031.39960.0",

        // State
        PlayerState : {

            PlayerID : this.PlayerID,

            lastcheckintimeutc : {
                "datetime" : ""
            },

            LastTimeZoneOffsetInMinutes :  "",

            isdirty : false,

            lasttimeisdirtycheckin : {
                "datetime" : ""
            }

        }
    };

}

/* Static methods */

/**
 * Convenience method, supports arrays of timezone
 * @param { String | Array } timezone - defaults to UTC
 * @return { Player | Array<Player> }
 */

Player.create = function(timezone = 'UTC'){

    // Single element
    if ( typeof timezone === 'string' ){

        return new Player(timezone);

    }

    // Collection of elements
    else if( timezone.isArray() ) {

        return timezone.map( tz => new Player(tz) );

    }

};

/**
 * Update player state
 * @param date
 * @returns {object}
 */
Player.prototype.updateState = function( date = new Date() ){

    const currentDateInZone = this._timezone( date );

    return this.info.PlayerState = {

        lastcheckintimeutc : {
            "datetime" : currentDateInZone.utc().toISOString()
        },

        LastTimeZoneOffsetInMinutes : currentDateInZone.utcOffset,

        isdirty : false,

        lasttimeisdirtycheckin : {
            "datetime" : currentDateInZone.utc().toISOString()
        }

    };
};

Player.prototype.getInfo = function(){

    return this.info;

};

// A "loop" of ads

function Face(){

    // assigned to a player
    // holds ads
    this.DigitalFaceCode = faker.commerce.department();
}

Face.prototype.createAds = function( numberOfAds ){

    let ads = Array( numberOfAds );

    for( let i = 0; i < numberOfAds; i++){

        let ad = new Ad( this.DigitalFaceCode );

        ads[i] = ad;

    }

    this.ads = ads;
};

/**
 * Create a loop using the currently populated list
 * @param {Date} startDate
 * @param {Date} endDate
 */

Face.prototype.generateLoop = function( startDate, endDate ){

    const start = moment(startDate);
    const end = moment(endDate);

    console.log(start, end);


    let arrayPos = 0;
    let arrayLength = this.ads.length;

    let current = moment(start);
    while( current  <= end ){

        const index = arrayPos % arrayLength;

        const duration = this.ads[ index ].getDuration();

        current = moment(current).add(duration, 'seconds');

        this.ads[ index ].pushTime(current);

        arrayPos++;
    }

};

Face.prototype.getDigitalPlayLogs = function(){

    return this.ads.map( ad => ad.getInfo() );
};

function Ad( DigitalFaceCode ) {

    let spot = getRandomInt(10, 30);
    let design = getRandomInt(10, 30);
    let playToEnd = ( spot > design );

    this.info = {

        // ASSIGNED
        DigitalFaceCode : DigitalFaceCode,

        // RANDOM
        SiteCode : faker.random.alphaNumeric(),
        MediaFileName : faker.system.fileName(),
        AdvertiserName : faker.company.companyName(),
        AdvertiserCode : faker.company.companySuffix(),
        SpotLength : spot,
        DesignDuration : design,
        PlayToEnd : playToEnd,

        // GENERATED
        Times : []

    }

}

Ad.prototype.pushTime = function( dateTime ){

    this.info.Times.push({

        "DateTime" : dateTime.toISOString()

    });

};

Ad.prototype.getDuration = function(){

    return this.info.PlayToEnd ? this.info.DesignDuration : this.info.SpotLength;

};

Ad.prototype.getInfo = function(){

    return this.info;

};

// Helper
function getRandomInt(min, max) {

    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive

}
