var Ayuda = require('../index.js');
var sinon = require('sinon');
var expect = require('chai').expect;


describe('Ayuda', function() {


    before(function(){

        ayuda = new Ayuda({
           username: process.env.AY_API_USER || '',
           password: process.env.AY_API_PASSWORD || '',
           apiUrl: process.env.AY_API_URL || 'https://pv.ayudapreview.com/Juice/pi'
        });

    });

    it('is able log in, and return a sessionID', function() {
        ayuda.login(function(){

            expect(session).to.be;

        })
    });

});


