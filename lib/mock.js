const moment = require('moment-timezone');
const nock = require('nock');



require('colors');

// Data generators,
//  faker has more internet options
//  casual has time and timezone fakes
const faker = require('faker');
const casual = require('casual');

// for consistency
const generate = {

    fake : faker.fake,
    internet : faker.internet,
    random : faker.random,
    timezone : casual.timezone,
    system : faker.system

};


/**
 *
 * @class Mock
 * @constructor start mocking session, intercept all requests
 * @param {Array<string>} routes - the routes to intercept, leave blank for all
 * @param {Object<username, password>} credentials - what the mock server will test basic auth against
 * @todo create usage and add docs for destructed version
 *
 */
function Mock(  credentials = { username: '' , password: ''}){

    // const username = credentials.username;
    // const password = credentials.password;
    //
    // this.players = [];
    // this.faces = [];
    // this.ads = [];
    //
    //
    //
    // console.log('Mocking session started, all requests will be intercepted'.yellow);
    //
    // // Disable all REAL HTTP requests
    // nock.disableNetConnect();
    //
    // // Routing
    // let nockScope = nock(credentials.apiUrl)
    //
    //     .intercept( '/Session/Login', 'POST' ).basicAuth(credentials).reply( ( uri, body ) =>
    //
    //         [ 200, { sessionID : faker.random.uuid() } ]
    //
    //     )
    //
    //     .intercept( '/Player/GetDigitalPlayLogs', 'POST' ).reply(( uri, body ) =>
    //
    //         [ 200, getDigitalPlayLogs( body ) ]
    //
    //     )
    //
    //     .intercept( '/Player/Get', 'POST' ).reply(( uri, body ) =>
    //
    //         [ 200, get( body ) ]
    //
    //     )
    //
    //     .intercept( '/Player/GetAll', 'POST' ).reply(( uri, body ) =>
    //
    //         [ 200, getAll( body ) ]
    //
    //     )
    //     .persist();
    //
    //
    // /* Mocking functions  */
    // let getDigitalPlayLogs = function(body){
    //
    //     // params : start, end, digitalFaceCode
    //     if( body.digitalFaceCodes.isNull() ){
    //
    //        return this.getAds();
    //     }
    //     else {
    //
    //         return this.getAds.filter( ad => ad.digitalFaceCode === body.digitalFaceCode );
    //
    //     }
    // };

}

Mock.prototype.Player = Player;
Mock.prototype.Face = Face;
Mock.prototype.Ad = Ad;


/**
 * @returns {Array<Player>}
 */

Mock.prototype.getPlayers = function(){

    return this.players;

};

/**
 * @returns {Array<Faces>}
 */

Mock.prototype.getFaces = function(){

    return this.faces;

};

/**
 * @typedef Player
 */

function Player( timezone ){

    this._timezone = function(date) {
        return moment.tz(date, timezone);
    };

    this.Name = timezone;

    // Player id's
    this.PlayerID = generate.random.uuid();
    this.PlayerModelID = generate.random.uuid();

    // Network
    this.HostName = generate.fake("DESKTOP-{{uuid}}");
    this.IPAddress = generate.internet.ip();
    this.MACAddress = generate.internet.mac().replace(':','-');
    this.Code = this.MACAddress.replace('-', '');
    this.NetworkName = this.HostName;

    // Config
    this.IsDecommisioned = false;
    this.PlayerRemoteControlUrlParams = null;
    this.PlayerScreenShotUrlParams = null;
    this.EnableSynchronization = false;
    this.SynchronizationGroupName = "";

    // System
    this.HardDriveCapacity = ( 60*Math.random() )*1000;
    this.RAMQuantity = 1440;
    this.CPUType = "Unknown";
    this.RAMType = "Unknown";
    this.OS = "Win32NT";
    this.OSVersion = "Microsoft Windows NT 6.2.9200.0";
    this.PlayerSoftwareVersion = "7.2031.39960.0";

    // State
    this.PlayerState = {

        PlayerID : this.PlayerID,

        lastcheckintimeutc : {
            "datetime" : time.zone()
        },

        lasttimezoneoffsetinminutes : time.zone(),

        isdirty : false,

        lasttimeisdirtycheckin : {
            "datetime" : ""
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
 * @param checkDate
 * @returns {{}}
 */
Player.prototype.updateState = function( date = new Date() ){

    const currentDateInZone = this._timezone( date );

    return this.PlayerState = this.PlayerState.assign({

        lastcheckintimeutc : {
            "datetime" : currentDateInZone.utc().toISOString()
        },

        lasttimezoneoffsetinminutes : currentDateInZone.utcOffset,

        isdirty : false,

        lasttimeisdirtycheckin : {
            "datetime" : currentDateInZone.utc().toISOString()
        }

    });
};


// Collection of advertisements

function Face(){

    // assigned to a player
    // holds ads
    this.DigitalFaceCode = faker.commerce.department();
    this.ads = [];
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
 * @param {Date} start
 * @param {Date} end
 */

Face.prototype.generateTimeline = function( startDate, endDate ){

    const start = moment(startDate);
    const end = moment(endDate);

    let arrayPos = 0;
    let arrayLength = this.ads.length;

    let current = moment(start);
    while( current  <= end ){

        const index = arrayPos % arrayLength;

        this.ads[ index ].pushTime(current)

        const duration = this.ads[ index ].getDuration();

        current.add(duration, 'seconds');

        arrayPos++;
    }

};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

Face.prototype.getDigitalPlayLogs = function(){

    return this.ads.map( ad => {

        return {
            DigitalFaceCode : ad.DigitalFaceCode,
            SiteCode : ad.SiteCode,
            MediaFileName : ad.MediaFileName,
            AdvertiserName : ad.AdvertiserName,
            SpotLength : ad.SpotLength,
            DesignDuration : ad.DesignDuration,
            PlayToEnd : ad.PlayToEnd,
            Times : ad.Times
        }
    });
};

function Ad( DigitalFaceCode ) {


    this.DigitalFaceCode = DigitalFaceCode;

    this.SiteCode = faker.random.alphaNumeric();
    this.MediaFileName = faker.system.fileName();
    this.AdvertiserName = faker.company.companyName();
    this.AdvertiserCode = faker.company.companySuffix();

    this.SpotLength = getRandomInt( 10,30 );
    this.DesignDuration = getRandomInt( 10,30 );
    this.PlayToEnd = ( this.SpotLength > this.DesignDuration );

    this.Times = [];

};


Ad.prototype.pushTime = function( dateTime ){

    this.Times.push({

        "DateTime" : dateTime.toISOString()

    });

};

Ad.prototype.getDuration = function(){

    return this.PlayToEnd ? this.DesignDuration : this.SpotLength;

};


function getRandomInt(min, max) {

    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive

}

// /     `Times`      / util func mock, intercepts requests and responds with appropriate response
// function mock(method, route, code = 200){
//     let reply = {};
//
//     switch(route){
//         case '/Session/Login':
//             reply = {
//                 sessionID : '8a3feb73-a869-4e99-8d0e-ca8b33590726'
//             };
//             break;
//
//         case '/Player/GetDigitalPlayLogs':
//             reply = [
//
//                 {
//                     MediaFileName: "foo",
//                     Times: [
//                         {"DateTime": "2017-10-05T00:00:01"},
//                         {"DateTime": "2017-10-05T00:00:04"},
//                         {"DateTime": "2017-10-05T00:00:07"}
//                     ],
//                 },
//                 {
//                     MediaFileName: "bar",
//                     Times: [
//                         {"DateTime": "2017-10-05T00:00:02"},
//                         {"DateTime": "2017-10-05T00:00:05"},
//                         {"DateTime": "2017-10-05T00:00:08"}
//                     ],
//                 },
//                 {
//                     MediaFileName: "baz",
//                     Times: [
//                         {"DateTime": "2017-10-05T00:00:03"},
//                         {"DateTime": "2017-10-05T05:00:06"},
//                         {"DateTime": "2017-10-05T10:00:09"}
//                     ]
//                 },
//             ];
//             break;
//
//         case '/Player/Get':
//             reply = {
//                 Success : true,
//                 PlayerState : {
//                     LastTimeZoneOffsetInMinutes : -420
//                 }
//             };
//             break;
//
//         default:
//             reply = "not implemented yet";
//     }
//     return nock(apiHost).intercept(route, method).reply(code, reply);
// };


module.exports = Mock;