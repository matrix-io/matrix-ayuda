const Ayuda = require('../index.js');
const expect = require('chai').expect;
const nock = require('nock');

describe('Ayuda', function() {

    let ayuda;
    let userInfo;

    before(function(){

        userInfo = {
            username: process.env.AY_API_USER || 'test',
            password: process.env.AY_API_PASSWORD || 'testPass',
            apiUrl: process.env.AY_API_URL || 'https://test.ayudapreview.com/Juice/pi'
        };

        ayuda = new Ayuda(userInfo);

    });

    describe('#constructor', function(){

        it('should handle complete urls', function(done){

            const session = new Ayuda(userInfo);
            expect(session.getUrl()).to.equal(userInfo.apiUrl);
            done();
        });

        it('should handle incomplete urls', function(done){

            const sameInfoIncompleteUrl = {
                username: process.env.AY_API_USER || 'test',
                password: process.env.AY_API_PASSWORD || 'testPass',
                apiUrl: process.env.AY_API_URL || 'https://test.ayudapreview.com'
            };

            const session = new Ayuda(sameInfoIncompleteUrl);
            expect(session.getUrl()).to.equal(userInfo.apiUrl);
            done();
        });
    });

    // makeRequest should handle errors and successful requests appropriately
    describe('#makeRequest()', function(){

        it('should handle 200 successfully', function(done){

            let fakeAyuda = nock(userInfo.apiUrl)
                .get('/')
                .reply(200, 'path matched!');

            ayuda.makeRequest('GET','/', {},function(error, response, body){

                expect(response.statusCode).to.equal(200);
                done();

            });

        });

        it('should throw error when response code != 200', function(done){

            let fakeAyuda = nock(userInfo.apiUrl)
                .get('/')
                .reply(302, 'found');

            ayuda.makeRequest('GET', '/', {}, function (error, response, body) {

                expect(error).to.not.be.undefined;
                done();
            });


        });

    });

    describe('#login()', function() {

        it('login successfully and return sessionID ', function(done) {

            let fakeAyudaLogin = nock(userInfo.apiUrl)
                .post('/Session/Login')
                .basicAuth({

                    user: userInfo.username,
                    pass: userInfo.password

                })
                .reply(200, {

                    sessionID : '8a3feb73-a869-4e99-8d0e-ca8b33590726'

                });

            // ayuda.setTestMode(true);
            ayuda.login(function(err, sessionID) {

                expect(sessionID).to.be.a('string');
                done();

            });
        });


        it('return error on unsuccesful login', function(done){

            let fakeAyudaLogin = nock(userInfo.apiUrl)

                .post('/Session/Login')
                .basicAuth({

                    user: userInfo.username,
                    pass: userInfo.password

                })
                .reply(401, 'Unauthorized');

            ayuda.login(function(err, sessionID) {

                expect(err).to.not.be.undefined;
                done();

            });

        });
    });

    describe('#getDigitalPlayLogs', function(){

        // Playlogs are a large and could take a while
        // disable timeouts
        this.timeout(0);
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

        it('should obtain PoPs for the day', function(done){

            let fakeAyudaGetDigitalPlayLogs = nock(userInfo.apiUrl)

                .post('/Player/GetDigitalPlayLogs')
                .basicAuth({

                    user: userInfo.username,
                    pass: userInfo.password

                })
                .reply(200, dummyLogs);

            ayuda.getDigitalPlayLogs(new Date(), function(err,logs){

                expect(logs, "play logs")
                    .to.be.an('array')
                    .with.lengthOf.at.least(1);

                done();

            });
        });

    });

    describe('#setPlayer()', function(){
        it('should set player id in object', function(done){
            ayuda.setPlayerId('f75c62da-4086-4e4a-9dc5-e0e8c56ca69a');
            done();
        });
    });

    describe('#setDigitalFaceCode()', function(){
        it('should set digitalfacecode', function(done){
            ayuda.setDigitalFaceCode('');
            done();
        });
    });

    describe('#getTimeZone()',function(){
        it('should get timezone data from player', function(done){
            let fakeAyudaLogin = nock(userInfo.apiUrl)
                .post('/Player/Get')
                .reply(200, {

                    Success : true,
                    PlayerState : {
                        LastTimeZoneOffsetInMinutes : -420
                    }

                });

            ayuda.getTimeZone(function(err, body){
                if(err) throw err;
                done();
            });

        });
    });


});


