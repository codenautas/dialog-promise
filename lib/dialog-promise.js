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
            if(event.target!==dialogWindow && !dialogWindow.contains(event.target)){
                event.preventDefault();
            }
        }
        window.addEventListener('keydown', interceptKey);
    });
}

function simpleFormPromise(elementsList){
    return dialogPromise(function(mainElement, done){
        elementsList.forEach(function(elementDefinition){
            if(typeof elementDefinition=='string'){
                var div=document.createElement('div');
                div.innerText=elementDefinition;
                mainElement.appendChild(div);
            }else if(elementDefinition instanceof HTMLElement){
                mainElement.appendChild(elementDefinition);
            }else{
                var button=document.createElement('button');
                button.textContent=elementDefinition.label;
                button.addEventListener('click', function(){
                    done(elementDefinition.value);
                });
                mainElement.appendChild(button);
            }
        });
    });
}

function promptPromise(message){
    var input = document.createElement('input');
    var okObject = {label:'Ok'};
    Object.defineProperty(okObject, 'value', { get: function(){ return input.value; }});
    return simpleFormPromise([
        message, 
        input, 
        document.createElement('br'), 
        okObject, 
        {label:'Cancel', value:false}
    ]);
}

function confirmPromise(message){
    return simpleFormPromise([message, {label:'Ok', value:true}, {label:'Cancel', value:false}]);
}

function alertPromise(message){
    return simpleFormPromise([message, {label:'Ok', value:true}]);
}
