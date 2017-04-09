"use strict";

var DialogPromise = {};

DialogPromise.messages={
    Ok: 'Ok',
    Cancel: 'Cancel',
    Yes: 'Yes',
    No: 'No',
    Escaped: 'Escaped',
    NotConfirmed: 'Not confirmed',
    DoNotAskForAWhile: 'Do not ask for a while (answer yes the following times)',
};

DialogPromise.es={
    Ok: 'Aceptar',
    Cancel: 'Cancelar',
    Yes: 'Sí',
    No: 'No',
    Escaped: 'Escapado',
    NotConfirmed: 'No confirmado',
    DoNotAskForAWhile: 'No preguntar por un rato (contestar sí las siguientes veces)'
};

DialogPromise.defaultOpts={
    withCloseButton:true,
    reject:true,
    rejectWhenCancelPrompt:null // same as reject
};

function centerDialog(dialogWindow){
    var centerDialogEdge = function centerDialogEdge(edge, dialogAttr, windowAttr){
        dialogWindow.style[edge]=Math.floor(Math.max(50-dialogWindow[dialogAttr]/2*100/window[windowAttr]))+'%';
    };
    centerDialogEdge('left','offsetWidth','innerWidth');
    centerDialogEdge('top','offsetHeight','innerHeight');
}

function receiveOpts(target, source, force){
    for(var p in source){
        if(source.hasOwnProperty(p)){
            if(!(p in target) || force){
                target[p] = source[p];
            }
        }
    }
}

function receiveOpt(target, name, source){
    if(!(name in target)){
        target[name] = source;
    }
}

function excluding(source, objectWithNamesToExclude){
    var target=[];
    for(var p in source){
        if(source.hasOwnProperty(p)){
            if(!objectWithNamesToExclude[p]){
                target[p] = source[p];
            }
        }
    }
    return target;
}

function dialogPromise(dialogConstructor, opts){
    opts = opts||{};
    opts.mainAttrs = opts.mainAttrs||{};
    receiveOpts(opts, DialogPromise.defaultOpts);
    return new Promise(function(resolve, reject){
        var modalBackground = document.createElement('div');
        modalBackground.className='dialog-promise-background';
        var dialogWindow = document.createElement('div');
        dialogWindow.className='dialog-promise';
        receiveOpts(dialogWindow, opts.mainAttrs);
        var body = document.body;
        var closeWindow = function closeWindow(answer){
            window.removeEventListener('keydown', interceptKey);
            dialogWindow.style.display = 'none';
            body.removeChild(modalBackground);
            body.removeChild(dialogWindow);
            if(answer && answer instanceof Error){
                reject(answer);
            }else{
                resolve(answer);
            }
        };
        var rejectEnsuringErr=function rejectEnsuringErr(answer){
            if(answer && answer instanceof Error){
                reject(answer);
            }else{
                reject(new Error(answer));
            }
        };
        var closeWindowWithEmptyAnswer = opts.reject?(
            function(){ closeWindow(new Error(DialogPromise.messages.Escaped)); }
        ):closeWindow.bind(null,opts.closeValue);
        dialogPromise.addCloseButton[opts.withCloseButton](dialogWindow, closeWindowWithEmptyAnswer);
        dialogConstructor(dialogWindow, closeWindow);
        body.appendChild(modalBackground);
        body.appendChild(dialogWindow);
        dialogWindow.style.visibility='hidden';
        dialogWindow.style.display='block';
        var ubicateDialog=function(){
            if(opts.underElement){
                dialogWindow.setAttribute('docked','under');
                dialogWindow.style.position='absolute';
                var rect = opts.underElement.getBoundingClientRect();
                dialogWindow.style.top=rect.bottom+'px';
                dialogWindow.style.left=rect.left+'px';
                dialogWindow.style.visibility='visible';
                if(dialogWindow.offsetLeft+dialogWindow.offsetWidth>window.innerWidth){
                    dialogWindow.style.left=Math.max(rect.right-dialogWindow.offsetWidth,0)+'px';
                    dialogWindow.style.borderColor='red';
                    dialogWindow.setAttribute('docked','under-right');
                }
            }else{
                centerDialog(dialogWindow);
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
                            centerDialog(dialogWindow);
                        }
                    }
                },250);
            }
        };
        if(dialogWindow.offsetWidth){
            ubicateDialog();
        }
        setTimeout(ubicateDialog,25);
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
        };
        window.addEventListener('keydown', interceptKey);
    });
}

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
    return dialogPromise(function(mainElement, done){
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
    }, excluding(opts, {elementsList:true}));
}

function alertPromise(message, opts){
    opts = opts||{};
    receiveOpts(opts, DialogPromise.defaultOpts);
    receiveOpt(opts, 'elementsList', [message, opts.buttonDef||{label:DialogPromise.messages.Ok, value:true}]);
    return simpleFormPromise(excluding(opts,{buttonDef:true}));
}

function confirmPromise(message, opts){
    opts = opts||{};
    receiveOpts(opts, DialogPromise.defaultOpts);
    var elementsList=[message].concat(opts.buttonsDef||[
        {label:DialogPromise.messages.Yes, value:true}, 
        {label:DialogPromise.messages.No, value:false}
    ]);
    if(opts.askForNoRepeat){
        var askForNoRepeat=opts.askForNoRepeat;
        if(askForNoRepeat && typeof askForNoRepeat !== 'object'){
            confirmPromise.repos[askForNoRepeat] = confirmPromise.repos[askForNoRepeat] || {actived:false};
            askForNoRepeat = confirmPromise.repos[askForNoRepeat];
        }
        if(askForNoRepeat.last){
            if(new Date().getTime() - askForNoRepeat.last < askForNoRepeat.timeout && askForNoRepeat.actived){
                askForNoRepeat.last = new Date().getTime();
                return Promise.resolve(askForNoRepeat.result);
            }else{
                askForNoRepeat.actived=false;
            }
        }else{
            receiveOpts(askForNoRepeat, confirmPromise.defaults.askForNoRepeat);
        }
        var div=document.createElement('div');
        div.className='dialog-promise-dont-ask';
        var checkbox=document.createElement('input');
        checkbox.type='checkbox';
        checkbox.id='confirmPromise.checkboxId+'+(confirmPromise.checkboxId++);
        var label=document.createElement('label');
        label.htmlFor=checkbox.id;
        label.textContent=DialogPromise.messages.DoNotAskForAWhile;
        div.appendChild(checkbox);
        div.appendChild(label);
        elementsList.push(div);
    }
    receiveOpt(opts, 'elementsList', elementsList);
    return simpleFormPromise(excluding(opts,{buttonsDef:true, askForNoRepeat:true})).then(function(result){
        if(!result && opts.reject){
            throw new Error(DialogPromise.messages.NotConfirmed);
        }
        if(askForNoRepeat && checkbox.checked){
            askForNoRepeat.last = new Date().getTime();
            askForNoRepeat.actived=true;
            askForNoRepeat.result=result;
        }
        return result;
    });
}

confirmPromise.defaults={
    askForNoRepeat:{timeout:30000},
};

confirmPromise.checkboxId=1;

confirmPromise.repos={};

function promptPromise(message, defaultOrOpts, optsIfDefault){
    var opts;
    var defaultValue;
    if(arguments.length>2 || typeof defaultOrOpts !== "object"){
        opts = optsIfDefault;
        defaultValue = defaultOrOpts;
    }else{
        opts = defaultOrOpts;
        defaultValue = "";
    }
    if(defaultValue==null){
        defaultValue = "";
    }
    opts = opts||{};
    receiveOpts(opts, DialogPromise.defaultOpts);
    var buttonsDef = opts.buttonsDef||[
        {label:DialogPromise.messages.Ok, value:true}, 
        {label:DialogPromise.messages.Cancel, value:false}
    ];
    var input = document.createElement('input');
    input.value = defaultValue;
    var firstKey=true;
    input.onkeydown=function(event){
        if(firstKey && !input.value){
            firstKey=false;
        }else if((event.keyCode || event.which)==13){
            input.dialogPromiseDone(input.value);
        }
    };
    buttonsDef.forEach(function(buttonDef){
        if(buttonDef.value===true){
            Object.defineProperty(buttonDef, 'value', { get: function(){ return input.value; }});
        }
        if(buttonDef.value===false && (opts.rejectWhenCancelPrompt===true || opts.rejectWhenCancelPrompt===null && opts.reject)){
            Object.defineProperty(buttonDef, 'value', { get: function(){ return new Error(DialogPromise.messages.Escaped); }});
        }
    });
    setTimeout(function(){ 
        if(input.scrollWidth>input.clientWidth){
            input.style.width=Math.min(input.scrollWidth+10,Math.min(window.innerWidth,document.body.clientWidth)*0.9-20)+'px';
        }
        input.focus(); 
    },24);
    receiveOpt(opts, 'elementsList', [
        message, 
        input, 
        document.createElement('br')
    ].concat(buttonsDef));
    return simpleFormPromise(excluding(opts, {buttonsDef:true}));
}

function miniMenuPromise(menu, opts){
    return dialogPromise(function(mainElement,done){
        var table=document.createElement('table');
        table.className='dialog-menu';
        menu.forEach(function(menuOption){
            if(menuOption.startGroup){
                var rowGroup=table.insertRow();
                var tdLine=rowGroup.insertCell();
                tdLine.colSpan=2;
                tdLine.className='dialog-menu-line';
            }
            var row=table.insertRow();
            (menuOption.displayFun||miniMenuPromise.defaultDisplayFun)(row, menuOption, done, opts);
        });
        mainElement.appendChild(table);
        mainElement.classList.add('dialog-0');
    },opts);
}

miniMenuPromise.defaultDisplayFun = function defaultDisplayFun(row, menuOption, done, opts){
    var tdImage=row.insertCell();
    var doDone=function(){
        Promise.resolve().then(function(){
            if(menuOption.doneFun){
                return menuOption.doneFun(row, menuOption, opts);
            }else{
                return menuOption.value;
            }
        }).then(done, done);
    };
    if(menuOption.img){
        var imageElement=document.createElement('img');
        imageElement.setAttribute('class','mini-menu-opt-img');
        imageElement.src=menuOption.img;
        receiveOpts(imageElement.style, menuOption.imgStyle||(opts||{}).imgStyle||{}, true);
        imageElement.addEventListener('click', doDone);
        tdImage.appendChild(imageElement);
    }
    var tdLabel=row.insertCell();
    var labelElement=document.createElement('label');
    labelElement.textContent=menuOption.label;
    if('value' in menuOption){
        row.className='dialog-menu-option';
        tdLabel.addEventListener('click', doDone);
    }else{
        row.className='dialog-menu-non-option';
    }
    tdLabel.appendChild(labelElement);
};
