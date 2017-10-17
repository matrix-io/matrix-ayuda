/*
 * This test is similar ayuda.test.js, though this is meant to test the intercepting system
 */

const Ayuda = require('../index.js');
const expect = require('chai').expect;


describe('Ayuda', function() {

    let testAccount;
    let userInfo;

    before(function(){

        userInfo = {

            username: 'test',
            password: 'testPass',
            apiUrl: 'https://fakeDevice.ayudaFake.com/Juice/pi'

        };

        testAccount = new Ayuda( userInfo );
        let mock = new Ayuda.Mock();


        // INTERCEPT!!
        mock.intercept( userInfo );

    });

    describe('#login()', function() {

        it('login successfully and return sessionID ', function(done) {

            testAccount.login(function(err, sessionID) {

                if( err ) {

                    console.error( err );

                }

                expect( sessionID ).to.be.a( 'string' );
                done();

            });
        });

    });

    describe('#getDigitalPlayLogs', function(){

        this.timeout(0);
        it.only('should obtain PoPs for the day', function( done ){

            testAccount.getDigitalPlayLogs(new Date(), function( err, logs ){

                if(err) console.log(err);

                console.log( testAccount.flattenPlayLog( logs ) );

                expect(logs, "play logs")
                    .to.be.an('array')
                    .with.lengthOf.at.least(1);

                done();

            });
        });

    });

    describe('#getTimeZone()',function(){

        it('should get timezone data from player', function(done){

            testAccount.setPlayerId('whatever-this-is-a-test')
            testAccount.getTimeZone(function(err, body){

                if(err) throw err;
                done();

            });

        });

    });

});


