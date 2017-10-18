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

DialogPromise.i18n={messages:{}};
DialogPromise.i18n.messages.es={
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
    rejectWhenCancelPrompt:null, // same as reject
    lengthMenuWithoutFilter:10
};

DialogPromise.path={
    img:''
};

function centerDialog(dialogWindow, innerDivDialog){
    var centerDialogEdge = function centerDialogEdge(edge, dialogAttr, windowAttr){
        dialogWindow.style[edge]=Math.floor(Math.max(50-dialogWindow[dialogAttr]/2*100/window[windowAttr]))+'%';
    };
    centerDialogEdge('left','offsetWidth','innerWidth');
    centerDialogEdge('top','offsetHeight','innerHeight');
    innerDivDialog.style.height = dialogWindow.offsetHeight-innerDivDialog.offsetTop-2+'px';
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

function getRect(element){
    var rect = {top:0, left:0, width:element.offsetWidth, height:element.offsetHeight};
    while( element != null ) {
        rect.top += element.offsetTop;
        rect.left += element.offsetLeft;
        element = element.offsetParent;
    }
    rect.bottom=rect.top+rect.height;
    rect.rigth=rect.left+rect.width;
    return rect;
}

function dialogPromise(dialogConstructor, opts){
    opts = opts||{};
    opts.mainAttrs = opts.mainAttrs||{};
    receiveOpts(opts, DialogPromise.defaultOpts);
    return new Promise(function(resolve, reject){
        var ubicateDialog;
        var modalBackground = document.createElement('div');
        modalBackground.className='dialog-promise-background';
        var dialogWindow = document.createElement('div');
        dialogWindow.className='dialog-promise';
        var innerDivDialog = document.createElement('div');
        innerDivDialog.className='dialog-promise-inner-div';
        dialogWindow.appendChild(innerDivDialog);
        innerDivDialog.dialogWindow = dialogWindow;
        receiveOpts(dialogWindow, opts.mainAttrs);
        var body = document.body;
        var closeWindow = function closeWindow(answer){
            window.removeEventListener('keydown', interceptKey);
            window.removeEventListener('resize', ubicateDialog);
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
        var closeWindowWithEmptyAnswer;
        if(opts.reject){
            var error=new Error(DialogPromise.messages.Escaped);
            error.DialogPromise='Escaped';
            closeWindowWithEmptyAnswer = function(){ closeWindow(error); };
        }else{
            closeWindowWithEmptyAnswer = closeWindow.bind(null,opts.closeValue);
        }
        dialogPromise.addCloseButton[opts.withCloseButton](innerDivDialog, closeWindowWithEmptyAnswer);
        dialogConstructor(innerDivDialog, closeWindow);
        body.appendChild(modalBackground);
        body.appendChild(dialogWindow);
        dialogWindow.style.visibility='hidden';
        dialogWindow.style.display='block';
        ubicateDialog=function ubicateDialog(){
            if(opts.underElement){
                dialogWindow.setAttribute('docked','under');
                dialogWindow.style.position='absolute';
                var rect = getRect(opts.underElement);
                dialogWindow.style.top=rect.bottom+'px';
                dialogWindow.style.left=rect.left +'px';
                dialogWindow.style.visibility='visible';
                var windowWidth = window.visualViewport && window.visualViewport.width ? window.visualViewport.width : window.innerWidth;
                if(dialogWindow.offsetLeft+dialogWindow.offsetWidth>windowWidth){
                    dialogWindow.style.left=Math.max(rect.left+rect.width-dialogWindow.offsetWidth,0)+'px';
                    dialogWindow.style.borderColor='red';
                    dialogWindow.setAttribute('docked','under-right');
                }
            }else{
                centerDialog(dialogWindow, innerDivDialog);
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
                            centerDialog(dialogWindow, innerDivDialog);
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
        window.addEventListener('resize', ubicateDialog);
    });
}

dialogPromise.addUpperDiv = function addUpperDiv(mainElement){
    var dialogWindow = mainElement.dialogWindow;
    if(!dialogWindow.upperDiv){
        var div=document.createElement('div');
        div.className='dialog-promise-upper-div';
        dialogWindow.upperDiv=div;
        dialogWindow.insertBefore(div, mainElement);
        div.floatDivs=document.createElement('div');
        div.appendChild(div.floatDivs);
        var divClear=document.createElement('div');
        divClear.style.clear='both';
        div.appendChild(divClear);
    }
    return dialogWindow.upperDiv.childNodes[0];
};

dialogPromise.addCloseButton={
    false:function(){},
    true:function(mainElement, done){
        var div = dialogPromise.addUpperDiv(mainElement);
        var closeButton=document.createElement('button');
        closeButton.className='dialog-promise-close-button';
        div.appendChild(closeButton);
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
            var error=new Error(DialogPromise.messages.NotConfirmed);
            error.DialogPromise='NotConfirmed';
            throw error;
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
            Object.defineProperty(buttonDef, 'value', { get: function(){ 
                var error=new Error(DialogPromise.messages.Escaped);
                error.DialogPromise='Escaped';
                return error; 
            }});
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
        var dpmmLines = 'dpmmLines'+miniMenuPromise.instanceCount++;
        var style = document.createElement('style');
        mainElement.appendChild(style);
        if(opts && 'withMenuFilter' in opts?opts.withMenuFilter:menu.length>DialogPromise.defaultOpts.lengthMenuWithoutFilter){
            var div = dialogPromise.addUpperDiv(mainElement);
            var img=document.createElement('img');
            img.src=DialogPromise.path.img+'filter-dialog.png';
            img.style.height='16px';
            div.appendChild(img);
            div.onclick=function(){
                span.style.position='';
                span.focus();
            };
            var span=document.createElement('span');
            // span.contenteditable=true;
            span.contentEditable=true;
            div.appendChild(span);
            span.style.position='fixed'; span.style.top='-40px';
            setTimeout(function(){
                span.focus();
            },50);
            var cambiarTimeout;
            var cambiar = function cambiar(){
                if(span.textContent){
                    var caso=span.textContent.toLowerCase();
                    style.textContent="tr.dialog-menu-option{display: none} tr.dialog-menu-option["+dpmmLines+"*="+JSON.stringify(caso)+"]{ display: table-row}";
                }else{
                    style.textContent='';
                }
                cambiarTimeout = null;
            };
            span.onkeydown=function(event){
                var code=event.keyCode || event.which;
                if(code==13 || code==9){
                    event.preventDefault();
                    return;
                }
                span.style.position='';
                if(cambiarTimeout){
                    clearTimeout(cambiarTimeout);
                }
                cambiarTimeout=setTimeout(cambiar,200);
            };
        }
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
            row.setAttribute(dpmmLines, (menuOption.label||menuOption.labels).toString().toLowerCase());
            (menuOption.displayFun||miniMenuPromise.defaultDisplayFun)(row, menuOption, done, opts);
        });
        mainElement.appendChild(table);
        mainElement.classList.add('dialog-0');
    },opts);
}

miniMenuPromise.instanceCount=0;

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
    var labels=menuOption.label?[menuOption.label]:menuOption.labels;
    labels.forEach(function(label){
        var tdLabel=row.insertCell();
        var labelElement=document.createElement('label');
        labelElement.textContent=label;
        if('value' in menuOption || 'doneFun' in menuOption){
            row.className='dialog-menu-option';
            tdLabel.addEventListener('click', doDone);
        }else{
            row.className='dialog-menu-non-option';
        }
        tdLabel.appendChild(labelElement);
    });
};
