'use strict';

var path = require('path');
var chalk = require('chalk');
var lockme = require('lockme');
var promptly = require('promptly');

/*
    File-type: .moleskine
*/

function Moleskine() {
    this.logPath = path.join(process.cwd(), '.moleskine');

    lockme.call(this);
}

Moleskine.prototype = Object.create(lockme.prototype);

Moleskine.prototype.createFile = function createFile(text, cb) {
    // Choice prompt
    var choice = [
        chalk.bold.green('Create .moleskine with encryption ? (y/n)'),
        chalk.blue('>')
    ].join('\n');

    promptly.choose(choice, ['y', 'n'], {
        retry: false
    }, function(err, val) {
        if (err) {
            console.log(chalk.yellow('Choose between: y or n'));
            return err.retry();
        }

        return cb(val);
    });
};

module.exports = exports = Moleskine;
