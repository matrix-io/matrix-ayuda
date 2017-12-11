const Ayuda = require('../index.js');
const expect = require('chai').expect;
const moment = require('moment');

describe.skip('Mock', function() {

    let ayuda;
    let mock;
    let userInfo;

    before( function(){

        userInfo = {
            username: 'test',
            password: 'testPass',
            apiUrl: 'https://fake.ayudapreview.com/Juice/pi'
        };

        ayuda = new Ayuda(userInfo);

    });


    describe( 'Models', function(){

        it( 'should randomly generate a player model, with appropriate time zone' , function(done){

            const EST = 'America/New_York';
            let easternDevice =  Ayuda.Mock.Player.create( EST );

            console.log( easternDevice.getInfo() );

            done()

        });


    });

    describe.skip('#login()', function() {

        it('login successfully and return sessionID ', function(done) {

            let mock = new ayuda.Mock(userInfo);
            ayuda.login(function(err, sessionID) {

                console.log(err);
                expect(sessionID).to.be.a('string');
                done();

            });
        });


        it('return error on unsuccesful login', function(done){

            ayuda.login(function(err, sessionID) {

                expect(err).to.not.be.undefined;
                done();

            });

        });
    });

    describe('Face', function(){

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

        it('should be able to generate a list of ad play times', function( done ){

            let start = moment(new Date());
            let end = moment(new Date()).add(1, 'hour');

            let Face = Ayuda.Mock.Face;
            let campaign = new Face();
            campaign.createAds( 3 );
            campaign.generateLoop(start, end);

            expect( campaign.getDigitalPlayLogs() ).to.be.an('Array');

            // console.log( ayuda.flattenPlayLog( campaign.getDigitalPlayLogs() , null, '\t') );

            done();

        });

    });

});

