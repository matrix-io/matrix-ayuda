const Ayuda = require('../index.js');
//const testEnv = require('./test.env.js');


let ayuda = new Ayuda(testEnv);

console.log('logging in');

ayuda.login((err, sessionID)=> {

    if(err){
        console.error(err);
    }

    const start = new Date();   // => getDigitalPlayLogs will start from 00:00:00 no matter what time it is.
    const end = new Date();     // => This is be passed in as is.

    ayuda.getDigitalPlayLogs(start, (err, body) => {

        if(err){

            console.error(err);

        }

        console.log(ayuda.flattenPlayLog(body));

    })

});

////
///**
// * Ayuda uses Basic Auth
// */
//
//// if you see this on the github repo shoot Jorge
//username: process.env.AY_API_USER || 'colin',
//    password: process.env.AY_API_PASSWORD || 'Setsuko13',
//    apiUrl    : process.env.AY_API_URL   || 'https://pv.ayudapreview.com/Juice/pi',
//    digitalFaceCode: ''
