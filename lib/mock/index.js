const moment = require('moment-timezone');
const _ = require('lodash');
const nock = require('nock');
const multipart = require('parse-multipart');

require('colors');

/* Contains the classes that represent the models for faces and ad's */
const Model = require('./generate');

/**
 *
 * @class
 * @constructor start mocking session, intercept all requests
 * @param {Array<string>} routes - the routes to intercept, leave blank for all
 * @param {Object<string, string, string>} credentials - what the mock server will test basic auth against
 *
 */
function Mock( numPlayers = 1, numAds = 5 ){

    // More players are not yet supported
    numPlayers = 1;

    this.players = _.range(numPlayers).map( index => new Mock.Player() );
    this.faces = _.range(numPlayers).map( index => new Mock.Face() );


    // Update timezone
    this.players.forEach( player => {
        player.updateState();
    });

    // Generate our loops
    this.faces.forEach( face => {
        // This should probably
        // be part of the constructor
        face.createAds( numAds );
        // let start = moment(new Date());
        // let end = moment(new Date()).add(1, 'hour');

    });

    console.log('Mocking session started, all requests will be intercepted'.yellow);

}

/**
 * Will block ALL outgoing HTTP requests, and intercept any heading to Ayuda's API
 * All request bodies recieved by the interceptor will be in 'multipart/form-data',
 * at the moment the parser set up for this is not very elegant and will be touched up
 * later.
 *
 * ROUTES:
 *  - Session/Login - returns a fixed sessionID, always 200
 *  - Player/GetDigitalPlayLogs - returns a randomly generated array of playlogs between start and end, always 200
 *  - Player/Get - returns the same player, id matching still not supported
 *  - Player/GetAll - not yet implemented
 *
 * @param credentials
 */

Mock.prototype.intercept = function( credentials = { username: '' , password: '' , apiUrl: '' } ){


    mockInstance = this;

    // Disable all REAL HTTP requests
    nock.disableNetConnect();

    // Routing
    let interceptor= nock( credentials.apiUrl )

        .intercept( '/Session/Login', 'POST' )
        .reply( function( uri, body ) {

            return [200, {sessionID: '111-222-333-444-555'}]

        })

        .intercept( '/Player/GetDigitalPlayLogs', 'POST' ).reply(( uri, body ) => {

            const splitByLines = body.split('\r\n');
            const start = splitByLines[3];
            const end = splitByLines[7];

            console.log(start, end)

            return [ 200, mockInstance.getDigitalPlayLogs( start, end )]
        })

        .intercept( '/Player/Get', 'POST' ).reply(( uri, body ) =>
            [ 200, mockInstance.getPlayers()[0].getInfo() ]
        )

        .intercept( '/Player/GetAll', 'POST' ).reply(( uri, body ) =>
            [ 200, "all playerinfos" ]
        )

        .persist();

};

Mock.Player = Model.Player;
Mock.Face = Model.Face;
Mock.Ad = Model.Ad;

module.exports = Mock;


/**
 * @returns {Array<Player>}
 */

Mock.prototype.getPlayers = function(){

    return this.players;

};

/**
 * @returns {Array<Face>}
 */

Mock.prototype.getFaces = function(){

    return this.faces;

};


// Intercept functions
// TODO: implement face filter
Mock.prototype.getDigitalPlayLogs = function( start, end, digitalFaceCodes ){

    // generate ads within time frame
    this.getFaces().forEach( face => face.generateLoop(start, end) );

    return this.getFaces().reduce( ( faces, face ) => {

        return faces.concat( face.getDigitalPlayLogs() )

    }, [] );


};

// Mock.prototype.get( playerID ){
//     // find single player
//     return this.getPlayers()
//         .filter( player => player.getInfo().)
// }
