"use strict";
/*jshint eqnull:true */
/*jshint browser:true */

var DialogPromise = {};

function dialogPromise(dialogConstructor, opts){
    opts = opts||{};
    opts.mainAttrs = opts.mainAttrs||{};
    return new Promise(function(resolve, reject){
        var dialogWindow = document.createElement('div');
        for(var attrName in opts.mainAttrs) if(opts.mainAttrs.hasOwnProperty(attrName)){
            dialogWindow[attrName] = opts.mainAttrs[attrName];
        }
        var body = document.body;
        var closeWindow = function closeWindow(){
            dialogWindow.style.display = 'none';
            body.removeChild(dialogWindow);
        }
        var doneWithGoodAnswer = function doneWithGoodAnswer(answer){
            closeWindow();
            resolve(answer)
        };
        var doneWithException = function doneWithException(answer){
            closeWindow();
            reject(answer)
        };
        dialogConstructor(dialogWindow, doneWithGoodAnswer, doneWithException);
        body.appendChild(dialogWindow);
        dialogWindow.style.display='block';
    });
}

function alertPromise(message){
    return dialogPromise(function(mainElement, done){
        var button=document.createElement('button');
        button.textContent='Ok';
        button.addEventListener('click', function(){
            done();
        });
        var div=document.createElement('div');
        div.innerText=message;
        mainElement.appendChild(div);
        mainElement.appendChild(button);
    },{mainAttrs:{className: 'alert-promise'}});
}
