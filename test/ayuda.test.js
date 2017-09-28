const Ayuda = require('../index.js');
const sinon = require('sinon');
const expect = require('chai').expect;


// () => {}
// Arrow functions are discouraged in mocha

describe('Ayuda', function() {

    let ayuda;

    before(function(){

        ayuda = new Ayuda({
            username: process.env.AY_API_USER || '',
            password: process.env.AY_API_PASSWORD || '',
            apiUrl: process.env.AY_API_URL || 'https://pv.ayudapreview.com/Juice/pi'
        });

    });

    describe('#makeRequest()', function(){

        it('should handle 200 successfully');
        it('should throw error on 302');
        it('should throw error on ###');

    });

    describe('#login()', function() {

        it('login successfully and return sessionID ', function(done) {
            ayuda.login(function(err, sessionID) {

                expect(err, "recieved error").to.be.null;
                expect(sessionID, "session").to.be.a('string');

                console.log(sessionID);
                done();

            });
        });

    });

    describe('#getDigitalPlayLogs', function(){

        // Playlogs are a large and could take a while
        // disable timeouts
        this.timeout(0);

        it('should obtain PoPs for the day', function(done){
            ayuda.getDigitalPlayLogs(new Date(), function(err,logs){


                expect(logs, "play logs")
                    .to.be.an('array')
                    .with.lengthOf.at.least(1);

                done();

            });
        });

    });

    describe('#setPlayer()', function(){

        it('should set player id in object');

    });

    describe('#flattenPlaylog()', function(){

        let dummyLogs;

        before(function(){

            dummyLogs = [

                {
                    MediaFileName: "foo",
                    Times: [
                        {"DateTime": "2017-08-04T00:00:01"},
                        {"DateTime": "2017-08-04T00:00:04"},
                        {"DateTime": "2017-08-04T00:00:07"}
                    ],
                },
                {
                    MediaFileName: "bar",
                    Times: [
                        {"DateTime": "2017-08-04T00:00:02"},
                        {"DateTime": "2017-08-04T00:00:05"},
                        {"DateTime": "2017-08-04T00:00:08"}
                    ],
                },
                {
                    MediaFileName: "baz",
                    Times: [
                        {"DateTime": "2017-08-04T00:00:03"},
                        {"DateTime": "2017-08-04T00:00:06"},
                        {"DateTime": "2017-08-04T00:00:09"}
                    ]
                },
            ];

        });

        it('should flatten deeply nested logs into a single array',function(done){

            // TODO: test for order
            let result = ayuda.flattenPlayLog(dummyLogs);
            expect(result).to.be.an('array');
            console.log(result);
            done();
        });

    });
});


