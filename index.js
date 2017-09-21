/**
 * This module simplifies requests made to Ayudas API service.
 * - Handles Basic auth
 * - Automatically stores and sends cookies with each request
 */

// NOTE: { jar : true } stores cookies
const request = require('request').defaults({ jar: true });
const _ = require('lodash');
const moment = require('moment');


// ENV VARIABLES
let APIHOST;
let SESSION_ID;
let USERNAME;
let PASSWORD;
let AUTHORIZATION

class Ayuda {

  // Login required for Ayuda's API
  constructor(auth) {
    APIHOST = auth.apiUrl;
    USERNAME = auth.username;
    PASSWORD = auth.password;
    SESSION_ID = '';
    AUTHORIZATION = 'Basic ' + new Buffer(USERNAME + ':' + PASSWORD).toString('base64');
  }

  /**
   * Sends a POST request to Ayudas login service using
   * 'env.username' and 'env.password' passed in to the constructor
   * @return {cb} Containing 'SESSION_ID'
   */
  login(cb) {

    const extraOpts = {
      formData: { username: USERNAME, password: PASSWORD },
      headers: { 'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' }
    };

    this.makeRequest('POST', 'Session/Login', extraOpts, (err, response) => {
      if (err) return cb(err);
      else if (!response || !response.body) return cb(new Error('No response, Login failure'));

      if (response.statusCode !== 200) {
        var errMsg = response.statusMessage ? response.statusMessage : 'Unknown status message';
        
        return cb(new Error('(' + response.statusCode + ') ' + errMsg));
      } else {

        try {
          SESSION_ID = JSON.parse(response.body).sessionID; //Store SESSION_ID within module and pass through                
        } catch (error) {
          err = error;
        }

        return cb(err, SESSION_ID);
      }
    });
  }

  /**
   * Obtain PoP data from Ayuda's API between start and end. Time in start will always default to 00:00:00,
   * this means you can change the YY:MM:DD of start but it will always send data starting from the beginning of the day.
   * @param {Date} start
   * @param {Date} end
   * @param {function} cb with an array of Objects containing PoP data
   */
  getDigitalPlayLogs(startDate, endDate, cb) {

    if (SESSION_ID === '') return cb(new Error('No Session ID -> Please login first'));
    else if (!(startDate instanceof Date) || !(endDate instanceof Date)) return cb(new Error('Needs to be a Date object'));

    const start = moment.utc(startDate).startOf('day');
    const end = moment.utc(endDate);

    const extraOpts = {
      formData: {
        'start': start.toISOString(),
        'end': end.toISOString()
      },
      headers: { 'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' }
    };

    this.makeRequest('POST', 'Player/GetDigitalPlayLogs', extraOpts, (err, response) => {
      var body;
      if (err) return cb(err);
      if (!response || !response.body) return cb(new Error('No response to parses'));
        
      try {
        body = JSON.parse(response.body); 
      } catch (error) {
        err = error;
      }
      
      if (err) return cb(err);
      if (body.Success === false) return cb(new Error('From Ayuda : ' + body.Error)); // Error comes from Ayuda's API

      return cb(err, body)
    });
  }

  /**
   * Sends a request to Ayuda's API service, all requests made against Ayuda's API will be done with this method.
   * Extending this module is as simple as creating a method and appending the appropiate method
   * @param  {string} method    e.g. POST or GET
   * @param  {string} route     Appended to the API URL. The format of routes and is `namespace/`
   * @param  {object} extraOpts Extra options to be merged with a defaul options object
   * @return {Promise.<object, Error>} - Resolves with a a response
   */
  makeRequest(method, route, extraOpts, cb) {
    if (route[0] !== '/') route = '/' + route;
    const url = APIHOST + route;

    const defaults = {
      method: method,
      url: url,
      headers: { authorization: AUTHORIZATION }
    };

    const options = _.merge(defaults, extraOpts);
    //console.log(`Sending request with the following options : ${JSON.stringify(options)}`);

    request(options, cb);
  } // makeRequest

  /**
   *  Takes in a PoP response from Ayuda's service and flattens it by time of play
   *  // [ { [ ... {} ] } , ...] => [ [ {} ... ], [ {} ... ] ]
   *
   * @param  {Object} playLog - Deeply nested JSON response from Ayuda's API (getDigitalPlayLogs)
   * @param {function} cb err, Represents a list of sorted (chronologically) Ad / Time objects. The time is in unix time
   */
  flattenPlayLog(playLog, cb) {

    const adTimeArrays = _.map(playLog, pop =>
      _.flatMap(pop.Times, time => {

        const adTimePair = {
          name: pop.MediaFileName,
          time: (+new Date(time.DateTime) / 1000).toFixed(0)
        };

        return adTimePair;
      })
    );

    const flattened = _.flattenDeep(adTimeArrays); // [[],[],[]] => []
    const sorted = flattened.sort((prev, curr) => prev.time - curr.time); // Sort by time : early to now

    return cb(undefined, sorted);
  }

} // class : Ayuda

module.exports = Ayuda;