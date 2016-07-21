"use strict";
/*jshint eqnull:true */
/*jshint browser:true */

var DialogPromise = {};

function dialogPromise(dialogConstructor, opts){
    opts = opts||{};
    opts.mainAttrs = opts.mainAttrs||{};
    return new Promise(function(resolve, reject){
        var modalBackground = document.createElement('div');
        modalBackground.className='dialog-promise-background';
        var dialogWindow = document.createElement('div');
        dialogWindow.className='dialog-promise';
        for(var attrName in opts.mainAttrs) if(opts.mainAttrs.hasOwnProperty(attrName)){
            dialogWindow[attrName] = opts.mainAttrs[attrName];
        }
        var body = document.body;
        var closeWindow = function closeWindow(senderAnswerFunction, answer){
            window.removeEventListener('keydown', interceptKey);
            dialogWindow.style.display = 'none';
            body.removeChild(modalBackground);
            body.removeChild(dialogWindow);
            senderAnswerFunction(answer);
        }
        dialogConstructor(dialogWindow, closeWindow.bind(null,resolve), closeWindow.bind(null,reject));
        body.appendChild(modalBackground);
        body.appendChild(dialogWindow);
        dialogWindow.style.display='block';
        modalBackground.style.display='block';
        modalBackground.addEventListener('click', function(){
            closeWindow(opts.reject?reject:resolve,opts.closeValue);
        });
        var interceptKey = function interceptKey(event){
            // event.target.style.border='1px solid green';
            // event.target.style.border='1px solid green';
            if(event.target!==dialogWindow && !dialogWindow.contains(event.target)){
                event.preventDefault();
            }
        }
        window.addEventListener('keydown', interceptKey);
    });
}

function alertPromise(message){
    return dialogPromise(function(mainElement, done){
        var button=document.createElement('button');
        button.textContent='Ok';
        button.addEventListener('click', function(){
            done(true);
        });
        var div=document.createElement('div');
        div.innerText=message;
        mainElement.appendChild(div);
        mainElement.appendChild(button);
    });
}
