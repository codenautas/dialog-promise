"use strict";
/*jshint eqnull:true */
/*jshint browser:true */

var DialogPromise = {};

DialogPromise.messages={
    Ok: 'Ok',
    Cancel: 'Cancel',
    Yes: 'Yes',
    No: 'No'
};

DialogPromise.es={
    Ok: 'Aceptar',
    Cancel: 'Cancelar',
    Yes: 'Sí',
    No: 'No'
};

DialogPromise.defaultOpts={
};

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
        var closeWindowWithEmptyAnswer = closeWindow.bind(null,opts.reject?reject:resolve,opts.closeValue);
        dialogPromise.addCloseButton[dialogPromise.withCloseButton](dialogWindow, closeWindowWithEmptyAnswer);
        dialogConstructor(dialogWindow, closeWindow.bind(null,resolve), closeWindow.bind(null,reject));
        body.appendChild(modalBackground);
        body.appendChild(dialogWindow);
        dialogWindow.style.visibility='hidden';
        dialogWindow.style.display='block';
        var ubicateDialog=function(){
            if(opts.underElement){
                dialogWindow.style.position='absolute';
                var rect = opts.underElement.getBoundingClientRect();
                dialogWindow.style.top=rect.bottom+'px';
                dialogWindow.style.left=rect.left+'px';
                dialogWindow.style.visibility='visible';
            }else{
                dialogWindow.style.left=Math.floor(Math.max(50-dialogWindow.offsetWidth/2*100/window.innerWidth))+'%';
                dialogWindow.style.top=Math.floor(Math.max(50-dialogWindow.offsetHeight/2*100/window.innerHeight))+'%';
                dialogWindow.style.visibility='visible';
                dialogWindow.style.display='block';
                var changes=3;
                var control=setInterval(function(){
                    if(changes){
                        if(
                            dialogWindow.offsetHeight+dialogWindow.offsetTop>=window.innerHeight ||
                            dialogWindow.offsetWidth+dialogWindow.offsetLeft>=window.innerWidth
                        ){
                            changes--;
                            dialogWindow.style.top=Math.floor(Math.max(50-dialogWindow.offsetHeight/2*100/window.innerHeight))+'%';
                            dialogWindow.style.left=Math.floor(Math.max(50-dialogWindow.offsetWidth/2*100/window.innerWidth))+'%';
                        }
                    }
                },250);
            }
        };
        if(dialogWindow.offsetWidth){
            ubicateDialog();
        }else{
            setTimeout(ubicateDialog,25);
        }
        modalBackground.style.display='block';
        modalBackground.addEventListener('click', closeWindowWithEmptyAnswer);
        var interceptKey = function interceptKey(event){
            var code=event.keyCode || event.which;
            if(code==27){
                closeWindowWithEmptyAnswer();
                event.preventDefault();
            }else if(code>=112 && code<=123){
            }else if(event.target!==dialogWindow && !dialogWindow.contains(event.target)){
                event.preventDefault();
            }
        }
        window.addEventListener('keydown', interceptKey);
    });
}

dialogPromise.withCloseButton=true;
dialogPromise.addCloseButton={
    false:function(){},
    true:function(dialogWindow, done){
        var closeButton=document.createElement('button');
        closeButton.className='dialog-promise-close-button';
        dialogWindow.appendChild(closeButton);
        closeButton.addEventListener('click', done);
    }
};

function simpleFormPromise(opts){
    var elementsList=opts.elementsList;
    delete opts.elementsList;
    return dialogPromise(function(mainElement, done, opts){
        elementsList.forEach(function(elementDefinition){
            if(typeof elementDefinition=='string'){
                var div=document.createElement('div');
                div.innerText=elementDefinition;
                mainElement.appendChild(div);
            }else if(elementDefinition instanceof HTMLElement){
                elementDefinition.dialogPromiseDone=done;
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

function alertPromise(message, opts){
    opts=opts||DialogPromise.defaultOpts;
    opts.elementsList=[message, opts.buttonDef||{label:DialogPromise.messages.Ok, value:true}];
    if(opts.buttonDef){
        delete opts.buttonDef;
    }
    return simpleFormPromise(opts);
}

function confirmPromise(message, opts){
    opts=opts||DialogPromise.defaultOpts;
    opts.elementsList=[message].concat(
        opts.buttonsDef||[
            {label:DialogPromise.messages.Yes, value:true}, 
            {label:DialogPromise.messages.No, value:false}
        ]
    )
    if(!opts.buttonsDef){
        delete opts.buttonsDef;
    }
    return simpleFormPromise(opts);
}

function promptPromise(message, opts){
    opts=opts||DialogPromise.defaultOpts;
    var buttonsDef = opts.buttonsDef||[
        {label:DialogPromise.messages.Ok, value:true}, 
        {label:DialogPromise.messages.Cancel, value:false}
    ];
    delete opts.buttonsDef;
    var input = document.createElement('input');
    var firstKey=true;
    input.onkeydown=function(event){
        if(firstKey){
            firstKey=false;
        }else if((event.keyCode || event.which)==13){
            input.dialogPromiseDone(input.value);
        }
    };
    buttonsDef.forEach(function(buttonDef){
        if(buttonDef.value===true){
            Object.defineProperty(buttonDef, 'value', { get: function(){ return input.value; }});
        }
    });
    setTimeout(function(){ input.focus(); },50);
    opts.elementsList=[
        message, 
        input, 
        document.createElement('br')
    ].concat(buttonsDef);
    return simpleFormPromise(opts);
}

function miniMenuPromise(menu, opts){
    opts=opts||DialogPromise.defaultOpts;
    return dialogPromise(function(mainElement,done){
        var table=document.createElement('table');
        table.className='dialog-menu';
        menu.forEach(function(menuOption){
            var row=table.insertRow();
            var tdImage=row.insertCell();
            var imageElement=document.createElement('img');
            imageElement.src=menuOption.img;
            imageElement.addEventListener('click', function(){
                done(menuOption.value);
            });
            tdImage.appendChild(imageElement);
            var tdLabel=row.insertCell();
            var labelElement=document.createElement('label');
            labelElement.textContent=menuOption.label;
            tdLabel.addEventListener('click', function(){
                done(menuOption.value);
            });
            tdLabel.appendChild(labelElement);
        })
        mainElement.appendChild(table);
        mainElement.classList.add('dialog-0');
    },opts)
}
