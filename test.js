'use strict';

/* global describe, it: false */

var chai = require('chai');
var path = require('path');
var Moleskine = require('./');

var expect = chai.expect;

var mlsk = new Moleskine();

describe('Moleskine', function() {
    var secret = 'foo';
    var str;

    it('should return the current directory + .moleskine', function() {
        expect(mlsk.logPath).to.eql(path.join(process.cwd(), '.moleskine'));
    });


    it('should return a special symbol followed by an encrypted string', function (done) {

        mlsk.encrypt(secret, 'foobar', function(err, encryptedText) {
            if(err) {
                return done(err);
            }

            str = encryptedText;

            expect(encryptedText[0]).to.eql(mlsk.token);
            return done();
        });
    });


    it('should return a decrypted string', function(done) {

        mlsk.decrypt(secret, str, function(err, decryptedText) {
            if(err) {
                return done(err);
            }

            expect(decryptedText).to.eql('foobar');
            return done();
        });
    });


    it('should use a new token', function(done) {

        var newToken = '\u2622';

        mlsk.token = newToken;

        mlsk.encrypt(secret, 'foobar', function(err, encryptedText) {
            if(err) {
                return done(err);
            }

            expect(encryptedText[0]).to.eql(newToken);
            return done();
        });
    });
});
