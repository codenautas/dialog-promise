"use strict";

var args = require('system').args;
var path = args[args.length-1].replace(/\\/g,'/').replace(/[/][^/]+[/][^/]+$/,'/example/popup-dp.html');
if(path[0]!='/'){
    path='/'+path;
}
casper.echo("path "+path);

var keys;

function sendKey(keysOrKey){
    // https://github.com/ariya/phantomjs/commit/cab2635e66d74b7e665c44400b8b20a8f225153a
    if(typeof keysOrKey === "string"){
        casper.page.sendEvent('keypress', keysOrKey);
    }else{
        var sendEvent = casper.page.sendEvent;
        sendEvent('keydown', keysOrKey);
        sendEvent('keyup', keysOrKey);
    }
}

casper.test.begin('Setup', function(test) {
    function clickOver(id){
        var box = casper.page.evaluate(function(id) {
            return __utils__.getElementBounds(id);
        }, id);
        test.assert(!!box, id+" element found");
        casper.mouse.click(box.left+Math.floor(box.width/2),box.top+Math.floor(box.height/2));
    }
    casper.start('file://'+path, function() {
        keys = casper.page.event.key;
        this.echo(this.getTitle());
        test.assertExists('#alert_example1', 'have the button');
        test.assertDoesntExist('.dialog_promise', 'dialog not exists');
        clickOver('#alert_example1');
        casper.wait(100, function() {
            this.echo("I've waited for a while.");
            this.capture('local-capture2.png');
            test.assertExists('.dialog-promise', 'dialog apears');
            test.assertVisible('.dialog-promise', 'dialog is visible');
            clickOver('#alert_example1');
            test.assertDoesntExist('.dialog-promise', 'dialog not exists 2');
            clickOver('#prompt_example2');
            casper.wait(1000, function() {
                test.assertVisible('.dialog-promise', 'dialog is visible 2');
                sendKey(keys.Return);
                this.capture('local-capture2b.png');
                test.assertDoesntExist('.dialog-promise', 'dialog not exists 3');
                casper.wait(200, function() {
                    var title=casper.evaluate(function(){
                        return prompt_example2.title;
                    });
                    this.echo("title "+title);
                    test.assertEqual(title,"Example Two");
                    test.done();
                });
            });
        });
    }).run(function() {
        test.done();
    });
});
