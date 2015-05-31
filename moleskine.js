#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var promptly = require('promptly');
var chalk = require('chalk');

var Moleskine = require('./');

var mlsk = new Moleskine();

// Command-Line Setup
program
    .version('1.0.0')
    .usage('<command> <flags>');

program
    .command('open')
    .alias('o')
    .description('Print the file [ -s, --secret <password> ]')
    .option('-s, --secret <password>')
    .action(open);

program
    .command('write [text...]')
    .alias('w')
    .description('The text you want to write to the Moleskine\'s log')
    .action(write);

program.on('--help', function(){
    console.log('  Commands:');
    console.log('');
    console.log('    $ moleskine w hello world');
    console.log('    $ Saved to .moleskine');
    console.log('');
    console.log('    $ moleskine o --secret 2d2as');
    console.log('    $ hello world');
    console.log('');
});

program.parse(process.argv);

if (!program.args.length) {
    return program.help();
}

function exitMessage(err, message) {
    if (err) {
        console.error(chalk.red('Internal Error'));
        return process.exit(1);
    }

    console.log(chalk.green(message));
    process.exit(0);
}

function showContents(err) {
    if (err) {
        console.error(chalk.red('Internal Error'));
        return process.exit(1);
    }

    console.log(mlsk.decryptedText);
    return process.exit(0);
}


// Checks the __dirname for .moleskine
function write(contents) {
    var text = contents.join(' '),
        message = 'Saved to .moleskine',
        logPath = mlsk.logPath;

    // Open file to append, fail if 'ENOENT'
    fs.readFile(mlsk.logPath, { encoding: 'utf8' }, function(err, data) {

        // if file doesn't exist: create a new one
        if (err && err.code === 'ENOENT') {
            return mlsk.createFile(text, function(val) {
                // Question prompt
                var question = [
                    chalk.bold.green('Write the secret you want to encrypt with:'),
                    chalk.gray('(Text Input hidden)'),
                ].join('\n');

                // -> prompt the user for a secret
                if (val === 'y') {
                    mlsk.promptEncryption(question, text, function(err, secret) {
                        if (err) {
                            console.error(chalk.red('Internal Error'));
                            return process.exit(1);
                        }

                        mlsk.encrypt(secret, text, function(err, encryptedText) {
                            if (err) {
                                console.error(chalk.red('Internal Error'));
                                return process.exit(1);
                            }

                            mlsk.writeFile(logPath, message, encryptedText, exitMessage);
                        });
                    });
                }

                // -> write to file without encryption
                if (val === 'n') {
                    console.log(text);
                    mlsk.writeFile(logPath, message, text, exitMessage);
                }
            });
        }

        // if the error isn't ENOENT
        if (err) {
            console.error(chalk.red('Internal Error'));
            return process.exit(1);
        }

        // When file is NOT encrypted there is no '!'
        if (data[0] !== mlsk.token) {
            mlsk.writeFile(logPath, message, data + '\n' + text, exitMessage);
        }

        // When file is encrypted '!' is at index 0
        if (data[0] === mlsk.token) {
            mlsk.promptDecryption('What\'s the secret ?', data, function(err, secret) {
                if (err) {
                    console.error(chalk.red('Internal Error'));
                    return process.exit(1);
                }

                mlsk.encrypt(secret, mlsk.decryptedText + '\n' + text, function(err, encryptedText) {
                    if (err) {
                        console.error(chalk.red('Internal Error'));
                        return process.exit(1);
                    }

                    mlsk.writeFile(logPath, message, encryptedText, exitMessage);
                });
            });
        }
    });
}


function open(opts, done) {
    var logPath = mlsk.logPath;

    fs.readFile(logPath, { encoding: 'utf8' }, function(err, data) {
        if (err && err.code === 'ENOENT') {
            console.error(chalk.red('Couldn\'t find .moleskine in the current directory'));
            return process.exit(1);
        }

        if (err) {
            console.error(chalk.red('Internal Error'));
            return process.exit(1);
        }

        if (data[0] !== mlsk.token) {
            console.log(data);
            return process.exit(0);
        }

        if (opts.secret) {
            return mlsk.decrypt(opts.secret, data, function(err, decryptedText) {
                if (err && /.+bad decrypt?/g.test(err.message)) {
                    console.log(chalk.yellow('Wrong secret!'));
                    return mlsk.promptDecryption('What\'s the secret ?', data, showContents);
                }

                if (err) {
                    console.error(chalk.red('Internal Error'));
                    return process.exit(1);
                }

                console.log(decryptedText);
                return process.exit(0);
            });
        }

        // When file is encrypted '!' is at index 0
        if (data[0] === mlsk.token) {
            mlsk.promptDecryption('What\'s the secret ?', data, showContents);
        }
    });
}
