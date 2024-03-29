"use strict";

const bestGlobals = require("best-globals");

var DialogPromise = {};

var dialogPromiseZindex = 11;
var backgroundZindex = 10;

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
    rejectFalse:true, // only for confirmPromise
    lengthMenuWithoutFilter:10,
    disableKeyboads:true,
    autoFocus:true
};

DialogPromise.path={
    img:''
};

DialogPromise.simplificatedChars = bestGlobals.simplifiedLetters;
DialogPromise.simplificateText = bestGlobals.simplifyText;

function centerDialog(dialogWindow, innerDivDialog){
    var centerDialogEdge = function centerDialogEdge(edge, dialogAttr, windowAttr){
        dialogWindow.style[edge]=Math.floor(Math.max(50-dialogWindow[dialogAttr]/2*100/window[windowAttr]))+'%';
    };
    centerDialogEdge('left','offsetWidth','innerWidth');
    centerDialogEdge('top','offsetHeight','innerHeight');
    // innerDivDialog.style.height = dialogWindow.offsetHeight-innerDivDialog.offsetTop-4+'px';
    dialogWindow.style.height = innerDivDialog.offsetHeigth+innerDivDialog.offsetTop+4+'px';
}

function receiveOpts(target, source, force){
    for(var p in source){
        if(source.hasOwnProperty(p)){
            if(!(p in target) || force===true || force==='falsy' && !target.p){
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

function getRectClient(element){
    var rect = {top:0, left:0, width:element.clientWidth, height:element.clientHeight};
    while( element != null ) {
        rect.top += element.clientTop;
        rect.left += element.clientLeft;
        element = element.clientParent;
    }
    rect.bottom=rect.top+rect.height;
    rect.rigth=rect.left+rect.width;
    return rect;
}

var dialogPromiseIdGenerator=1;

function findTabStop(which, within, element){
    var focusables = within.querySelectorAll('input, button, select, textarea, a[href], [contenteditable="true"]');
    var the={
        previous:null,
        next:null,
        first:null,
        last:null,
    }
    the.all=the;
    var elementWasFound=false;
    Array.prototype.forEach.call(focusables, function(item){
        if(item==element){
            elementWasFound=true;
        }else{
            if(item.tabIndex >= 0){
                if(!the.first){
                    the.first=item;
                }
                if(elementWasFound){
                    if(!the.next){
                        the.next=item;
                    }
                }else{
                    the.previous=item;
                }
                the.last=item;
            }
        }
    });
    return the[which];
}

function dialogPromise(dialogConstructor, opts){
    opts = opts||{};
    opts.mainAttrs = opts.mainAttrs||{};
    opts.setAttrs = opts.setAttrs||{};
    receiveOpts(opts, DialogPromise.defaultOpts);
    return new Promise(function(resolve, reject){
        var ubicateDialog;
        var modalBackground = document.createElement('div');
        modalBackground.className='dialog-promise-background';
        modalBackground.style.zIndex = backgroundZindex;
        backgroundZindex++;
        var dialogWindow = document.createElement('div');
        dialogWindow.className='dialog-promise';
        dialogWindow.style.zIndex=dialogPromiseZindex;
        dialogPromiseZindex++;
        var innerDivDialog = document.createElement('div');
        innerDivDialog.className='dialog-promise-inner-div';
        dialogWindow.appendChild(innerDivDialog);
        innerDivDialog.dialogWindow = dialogWindow;
        dialogWindow.innerDivDialog = innerDivDialog;
        receiveOpts(dialogWindow, opts.mainAttrs, 'falsy');
        for(var attr in opts.setAttrs){
            if(opts.setAttrs.hasOwnProperty(attr)){
                dialogWindow.setAttribute(attr,opts.setAttrs[attr]);
            }
        }
        var body = document.body;
        var closeWindow = function closeWindow(answer){
            if(DialogPromise.defaultOpts.disableKeyboads){
                window.removeEventListener('keydown', interceptKey);
            }
            window.removeEventListener('resize', ubicateDialog);
            dialogWindow.style.display = 'none';
            body.removeChild(modalBackground);
            delete window.openDialogPromises[dialogWindow.id];
            window.openDialogPromises.lastWindows=window.openDialogPromises.lastWindows.filter(function(id){
                return id != dialogWindow.id;
            });
            body.removeChild(dialogWindow);
            if(opts.replacingElement && opts.replacingElement instanceof HTMLElement){
                var element = opts.replacingElement;
                element.style.display='block';
            }
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
        dialogWindow.id='dialog-promise-'+dialogPromiseIdGenerator++;
        body.appendChild(dialogWindow);
        if(innerDivDialog.firstFocus && DialogPromise.defaultOpts.autoFocus){
            setTimeout(function(){
                innerDivDialog.firstFocus.focus();
            },20)
        }
        window.openDialogPromises=window.openDialogPromises||{
            lastWindows:[]
        };
        window.openDialogPromises[dialogWindow.id]=true;
        window.openDialogPromises.lastWindows.unshift(dialogWindow.id);
        dialogWindow.style.visibility='hidden';
        dialogWindow.style.display='block';
        ubicateDialog=function ubicateDialog(){
            if(opts.replacingElement && opts.replacingElement instanceof HTMLElement){
                var element = opts.replacingElement;
                element.style.display='none';
                opts.underElement = element.parentElement;
            }
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
            }else if(code>=112 && code<=123 || code==67 && event.ctrlKey){
            }else{
                var topDialog=document.getElementById(window.openDialogPromises.lastWindows[0]);
                if(topDialog){
                    var tableMenu=topDialog.querySelector('.dialog-menu')
                }
                var readyToMove=tableMenu && !event.shiftKey  && !event.ctrlKey  && !event.altKey  && !event.metaKey;
                var selectTheRow = function selectTheRow(row){
                    row.setAttribute('key-selected','1')
                    var container=row;
                    var contained=row;
                    var acumTop=container.offsetTop;
                    while(container=container.parentElement){
                        if(acumTop>container.clientHeight+container.scrollTop){
                            contained.scrollTop=acumTop-container.clientHeight 
                        }
                        acumTop+=container.offsetTop;
                        contained=container;
                    }
                }
                var moveTry = function moveTry(keycode, mover){
                    if(code==keycode && readyToMove){
                        var selecteds = topDialog.querySelectorAll('[key-selected="1"]');
                        var selectedRow=null;
                        Array.prototype.forEach.call(selecteds, function(row){
                            row.removeAttribute('key-selected')
                            selectedRow=row;
                        });
                        if(selectedRow){
                            var nextSelected=selectedRow
                            while((nextSelected = nextSelected[mover]) && (nextSelected.clientWidth==0 || !nextSelected.dialogPromiseRowDone)){
                            }
                            selectTheRow(nextSelected||selectedRow);
                        }else{
                            selectTheRow(tableMenu.rows[0]);
                        }
                        event.preventDefault();
                        return true;
                    }
                }
                if(moveTry(40,'nextElementSibling') || moveTry(38,'previousElementSibling') ){
                    // ok move
                }else if(readyToMove && code==13){
                    var selectedRow=topDialog.querySelector('[key-selected="1"]');
                    if(selectedRow){
                        selectedRow.dialogPromiseRowDone();
                        event.preventDefault();
                    }
                }else if(code==9 && !event.ctrlKey && !event.altKey && !event.metaKey){
                    var tabStops = findTabStop('all', innerDivDialog, document.activeElement);
                    if(DialogPromise.defaultOpts.autoFocus){
                        if(event.shiftKey){
                            (tabStops.previous||tabStops.last).focus();
                        }else{
                            (tabStops.next||tabStops.first).focus();
                        }
                        dialogWindow.focus();
                    }
                    event.preventDefault();
                }else{
                    var letra=String.fromCharCode(code).toUpperCase();
                    if(
                        topDialog.innerDivDialog 
                        && topDialog.innerDivDialog.hotkeys 
                        && topDialog.innerDivDialog.hotkeys[letra] 
                        && (
                            document.activeElement.tagName=='BODY' 
                            || document.activeElement.tagName=='BUTTON' 
                            || document.activeElement.tagName=='INPUT' && document.activeElement.type=='BUTTON')
                        && !event.ctrlKey
                        && !event.altKey
                    ){
                        topDialog.innerDivDialog.hotkeys[letra].click();
                        event.preventDefault();
                    }else if(event.target!==dialogWindow && !dialogWindow.contains(event.target)){
                        if(!event.target.getAttribute('allow-write')){
                            event.preventDefault();
                        }
                    }
                }
            }
        };
        if(DialogPromise.defaultOpts.disableKeyboads){
            window.addEventListener('keydown', interceptKey);
        }
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
    var hotkeys={};
    return dialogPromise(function(mainElement, done){
        elementsList.forEach(function(elementDefinition, i){
            if(typeof elementDefinition=='string'){
                var div=document.createElement('div');
                if(!i && false){
                    var button=document.createElement('button')
                    button.className='dialog-promise-div-button';
                    button.innerText=elementDefinition;
                    div.appendChild(button);
                    mainElement.firstFocus=button;
                    button.addEventListener('keypress',function(event){
                        var code = event.keycode||event.which;
                        var letra=String.fromCharCode(code).toUpperCase();
                        if(hotkeys[letra]){
                            hotkeys[letra].click();
                        }
                    })
                }else{
                    if(!i){
                        setTimeout(function(){
                            var sel = window.getSelection();
                            sel.collapse(div,0);
                        },20)
                    }
                    div.innerText=elementDefinition;
                }
                mainElement.appendChild(div);
            }else if(elementDefinition instanceof HTMLElement){
                elementDefinition.dialogPromiseDone=done;
                mainElement.appendChild(elementDefinition);
                if(elementDefinition.firstFocus){
                    mainElement.firstFocus=elementDefinition;
                }
                button=elementDefinition;
            }else{
                var button=document.createElement('button');
                button.textContent=elementDefinition.label;
                for(var attr in elementDefinition.attributes){
                    button.setAttribute(attr,elementDefinition.attributes[attr]);
                }
                button.addEventListener('click', function(){
                    done(elementDefinition.value);
                });
                mainElement.appendChild(button);
            }
            if(elementDefinition.hotkey){
                hotkeys[elementDefinition.hotkey]=button;
            }else{
                if(button){
                    var letra=button.textContent.substr(0,1).toUpperCase();
                    if(!(letra in hotkeys)){
                        hotkeys[letra]=button;
                    }
                }
            }
            mainElement.hotkeys=hotkeys;
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
        if(result == null && opts.reject || result === false && opts.rejectFalse){
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
    var inputDef = opts.inputDef || {}
    if(inputDef.lines){
        var input = document.createElement('textarea');
        input.setAttribute('rows', inputDef.lines || 1);
    }else{
        var input = document.createElement('input');
    }
    for(var attr in inputDef.attributes){
        input.setAttribute(attr,inputDef.attributes[attr]);
    }
    input.value = defaultValue;
    var firstKey=true;
    input.addEventListener('keydown',function(event){
        if(firstKey && !input.value){
            firstKey=false;
        }else if((event.keyCode || event.which)==13){
            input.dialogPromiseDone(input.value);
        }
    });
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
        // input.focus(); 
    },24);
    input.firstFocus=true;
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
            img.alt='🔍';
            img.style.height='16px';
            div.appendChild(img);
            div.onclick=function(){
                span.style.position='';
                if(DialogPromise.defaultOpts.autoFocus){
                    span.focus();
                }
            };
            var span=document.createElement('span');
            // span.contenteditable=true;
            span.contentEditable=true;
            div.appendChild(span);
            span.style.position='fixed'; span.style.top='-40px';
            if(DialogPromise.defaultOpts.autoFocus){
                setTimeout(function(){
                    span.focus();
                },50);
            }
            var cambiarTimeout;
            var cambiar = function cambiar(){
                var caso=DialogPromise.simplificateText(span.textContent.toLowerCase()).split(' ').filter(function(word){ return word.trim()});
                console.log('caso',caso,span.textContent.length?span.textContent.charCodeAt(span.textContent.length-1):0);
                if(caso.length){
                    style.textContent="tr.dialog-menu-option{display: none} tr.dialog-menu-option"+
                        caso.map(function(word){
                            return word?"["+dpmmLines+"*="+JSON.stringify(word)+"]":"";
                        }).join('')+
                        "{ display: table-row}";
                    console.log(style.textContent);
                }else{
                    style.textContent='';
                }
                cambiarTimeout = null;
            };
            span.addEventListener('keydown', function(event){
                var code=event.keyCode || event.which;
                if(code==13 || code==9){
                    event.preventDefault();
                    return;
                }
                mostrar();
            });
            var mostrar = function(){
                span.style.position='';
                if(cambiarTimeout){
                    clearTimeout(cambiarTimeout);
                }
                cambiarTimeout=setTimeout(cambiar,200);
                if(document.activeElement === span){
                    var sel = window.getSelection()
                    sel.collapse(document.activeElement,document.activeElement.childNodes.length);
                }
            }
            setTimeout(function(){
                if(opts && opts.initialSearch){
                    span.textContent = opts.initialSearch.text || opts.initialSearch.initialKeystrokes;
                    mostrar();
                    cambiar();
                }
                if(opts && opts.whenReady){
                    opts.whenReady();
                }
            },100);
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
            row.setAttribute(dpmmLines, DialogPromise.simplificateText((menuOption.label||menuOption.labels).toString()).toLowerCase());
            (menuOption.displayFun||miniMenuPromise.defaultDisplayFun)(row, menuOption, done, opts);
        });
        mainElement.appendChild(table);
        mainElement.classList.add('dialog-0');
    },opts);
}

miniMenuPromise.instanceCount=0;

miniMenuPromise.defaultDisplayFun = function defaultDisplayFun(row, menuOption, done, opts){
    var tdImage=row.insertCell();
    var wrap;
    var doDone;
    var labelTag;
    var whenDoneClose=function(){
        Promise.resolve().then(function(){
            if(menuOption.doneFun){
                return menuOption.doneFun(row, menuOption, opts);
            }else{
                return menuOption.value;
            }
        }).then(done, done);
    };
    if(menuOption.href){
        wrap = function wrapWithA(element){
            var aElement = document.createElement('a');
            aElement.setAttribute('class','mini-menu-opt-a');
            aElement.appendChild(element);
            aElement.href=menuOption.href;
            aElement.onclick=function(event){
                if(!event.ctrlKey && menuOption.showPage){
                    history.pushState(null, null, this.href);
                    menuOption.showPage();
                    whenDoneClose();
                    event.preventDefault();
                }
            };
            return aElement;
        };
        doDone=function(){};
        labelTag='span';
    }else{
        wrap = function no_wrap(element){ return element;};
        doDone=whenDoneClose;
        labelTag='label';

    }
    if(menuOption.img){
        var imageElement=document.createElement('img');
        imageElement.setAttribute('class','mini-menu-opt-img');
        imageElement.src=menuOption.img;
        receiveOpts(imageElement.style, menuOption.imgStyle||(opts||{}).imgStyle||{}, true);
        imageElement.addEventListener('click', doDone);
        tdImage.appendChild(wrap(imageElement));
    }
    var labels=menuOption.label?[menuOption.label]:menuOption.labels;
    labels.forEach(function(label, i){
        var tdLabel=row.insertCell();
        if(!i && menuOption.id){
            tdLabel.id=menuOption.id;
        }
        var labelElement=document.createElement(labelTag);
        labelElement.textContent=label;
        if('value' in menuOption || 'doneFun' in menuOption){
            row.className='dialog-menu-option';
            tdLabel.addEventListener('click', doDone);
            row.dialogPromiseRowDone=doDone;
        }else{
            row.className='dialog-menu-non-option';
        }
        tdLabel.appendChild(wrap(labelElement));
    });
};
