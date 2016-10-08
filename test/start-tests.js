"use strict";

var Path = require('path');
var winOS = Path.sep==='\\';

var changing = require('best-globals').changing;

var spawn = require('child_process').spawn;
var args = process.argv;
var phantomPath=process.env.TRAVIS && process.env.TRAVIS_NODE_VERSION<'4'?'phantomjs':'./node_modules/phantomjs-prebuilt/lib/phantom/'+(winOS?'bin/phantomjs.exe':'bin/phantomjs');
var slimerPath=process.env.TRAVIS?'slimerjs':'./node_modules/slimerjs/lib/slimer/'+(winOS?'slimerjs.bat':'bin/slimerjs');
    
var pidBrowser = spawn(
    (process.env.TRAVIS && false?'casperjs':'./node_modules/casperjs/bin/'+(winOS?'casperjs.exe':'casperjs')),
    [
        'test',
        '--verbose',
        Path.resolve('./test/casper-test.js')
    ],
    { stdio: 'inherit' , env: changing(process.env,{PHANTOMJS_EXECUTABLE: phantomPath, SLIMERJS_EXECUTABLE:slimerPath},changing.options({mostlyPlain:true}))}
);
pidBrowser.on('close', function (code, signal) {
    console.log('browser closed', code, signal);
    pidBrowser = null;
    if(!(process.argv.indexOf('--hold')>0)){
        process.exit(code);
    }
});
console.log('all launched');

process.on('exit', function(code){
    console.log('process exit',code);
    if(pidBrowser){
        pidBrowser.kill('SIGHUP');
        console.log('SIGHUP sended to browser');
    }else{
        console.log('browser already closed');
    }
});


process.on('uncaughtException', function(err){
    console.log('process NOT CAPTURED ERROR',err);
    console.log(err.stack);
    process.exit(1);
});

