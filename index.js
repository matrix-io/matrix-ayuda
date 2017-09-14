/**
 * This module simplifies requests made to Ayudas API service.
 * - Handles Basic auth
 * - Automatically stores and sends cookies with each request
 */

// NOTE: { jar : true } stores cookies
const request = require('request').defaults({ jar: true });
const _ = require('lodash');
const moment = require('moment');

/**
 * ENV VARIABLES
 */

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
    AUTHORIZATION = new Buffer(USERNAME + ':' + PASSWORD).toString('base64');
  }

  /**
   * Sends a POST request to Ayudas login service using
   * `env.username` and `env.password` passed in to the constructor
   * @return {Promise.<string, string>} Resolves with `SESSION_ID`
   */
  login() {

    const extraOpts = {
      formData: { username: USERNAME, password: PASSWORD },
      headers: { 'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' }
    };

    return this.makeRequest('POST', 'Session/Login', extraOpts).then((response) => {
      if (!response) return Promise.reject('No response, Login failure');

      SESSION_ID = JSON.parse(response.body).sessionID; //Store SESSION_ID within module and pass through
      return Promise.resolve(SESSION_ID);
    })
  }

  /**
   * Obtain PoP data from Ayuda's API between start and end. Time in start will always default to 00:00:00,
   * this means you can change the YY:MM:DD of start but it will always send data starting from the beginning of the day.
   * @param  {Date} start
   * @param  {Date} end
   * @return {Promise.<Array>} - Resolves with an array of Objects containing PoP data
   */
  getDigitalPlayLogs(startDate, endDate) {

    const start = moment(startDate).utc().startOf('day');
    const end = moment(endDate).utc();

    if (SESSION_ID === '') return Promise.reject('No Session ID -> Please login first');
    else if (!(startDate instanceof Date) || !(endDate instanceof Date)) return Promise.reject(new TypeError('Needs to be a Date object'));

    const extraOpts = {
      formData: {
        'start': start.toISOString(),
        'end': end.toISOString()
      },
      headers: { 'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' }
    };

    return this.makeRequest('POST', 'Player/GetDigitalPlayLogs', extraOpts).then((response) => {

      const body = JSON.parse(response.body);
      if (body.Success === false) return Promise.reject(new Error('From Ayuda : ' + body.Error)); // Error comes from Ayuda's API

      return Promise.resolve(body)
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
  makeRequest(method, route, extraOpts) {

    return new Promise(function (resolve, reject) {

      if (route[0] !== '/') route = '/' + route;
      const url = APIHOST + route;

      const defaults = {
        method: method,
        url: url,
        headers: { authorization: AUTHORIZATION }
      };

      const options = _.merge(defaults, extraOpts);
      console.log(`Sending request with the following options : ${JSON.stringify(options)}`);

      request(options, function (err, response, body) {
        if (err) reject(new Error(err.msg));
        else resolve(response);
      });

    }); // promise

  } // makeRequest

  /**
   *  Takes in a PoP response from Ayuda's service and flattens it by time of play
   *
   * @param  {Object} playLog - Deeply nested JSON response from Ayuda's API (getDigitalPlayLogs)
   * @return {Array.<Object>} - Represents a list of sorted (chronologically) Ad / Time objects. The time is in unix time
   */
  flattenPlayLog(playLog) {

    // [ { [ ... {} ] } , ...] => [ [ {} ... ], [ {} ... ] ]
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

    return Promise.resolve(sorted)
  }

} // class : Ayuda

module.exports = Ayuda;