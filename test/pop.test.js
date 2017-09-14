const Ayuda = require('../index.js');
const testEnv = require('./test.env.js');

// TODO: Let's start using Mocha.js
let ayuda = new Ayuda(testEnv);

console.log('logging in');
ayuda.login()

  /* Session ID is stored in instance and passed through Promise.resolve */

  .then(session => console.log(session)).then(() => {

    const start = new Date();   // => getDigitalPlayLogs will start from 00:00:00 no matter what time it is.
    const end = new Date();     // => This is be passed in as is.

    // get all data from 00:00:00 (last night midnight) to right right now
    return ayuda.getDigitalPlayLogs(start, end);

  })
  .then(ayuda.flattenPlayLog)
  .then((flattendTimeArray) => console.log(flattendTimeArray))
  .catch(err => console.error(`=> ${err.stack}`));
