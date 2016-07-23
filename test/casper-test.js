"use strict";

var casper = require('casper').create({
    onLoadError: function(casper,requestUrl,status){
        casper.echo('loading error '+status);
    }
});

var args = require('system').args;
var path = args[args.length-1].replace(/\\/g,'/').replace(/[/][^/]+[/][^/]+$/,'/example/popup-dp.html');
if(path[0]!='/'){
    path='/'+path;
}
casper.echo("path "+path);

casper.start('file://'+path, function() {
    this.echo("I'm in");
    this.echo(this.getTitle());
});

casper.run();