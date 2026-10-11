"use strict";

// Tests that run inside the browser (see server4test-config.yaml and `npm run test-navigator`).
// lib/dialog-promise.js is loaded as a script, so its functions are globals declared here.

type DialogPromiseError = Error & {DialogPromise?: string};

type ButtonDef = {
    label: string
    value: unknown
    attributes?: Record<string, string>
    hotkey?: string
};

type DialogOpts = {
    withCloseButton?: boolean
    reject?: boolean
    rejectFalse?: boolean
    rejectWhenCancelPrompt?: boolean | null
    closeValue?: unknown
    underElement?: HTMLElement
    replacingElement?: HTMLElement
    setAttrs?: Record<string, string>
    buttonDef?: ButtonDef
    buttonsDef?: ButtonDef[]
    askForNoRepeat?: string | {timeout: number}
    inputDef?: {lines?: number, attributes?: Record<string, string>}
    withMenuFilter?: boolean
    initialSearch?: {text?: string, initialKeystrokes?: string}
    whenReady?: () => void
};

type MenuOption = {
    value?: unknown
    label?: string
    labels?: string[]
    id?: string
    img?: string
    imgStyle?: Partial<CSSStyleDeclaration>
    href?: string
    showPage?: () => void
    startGroup?: boolean
    doneFun?: (row: HTMLTableRowElement, menuOption: MenuOption, opts: DialogOpts | undefined) => unknown
};

declare function alertPromise(message: string, opts?: DialogOpts): Promise<unknown>;
declare function confirmPromise(message: string, opts?: DialogOpts): Promise<unknown>;
declare function promptPromise(message: string, defaultOrOpts?: string | DialogOpts, optsIfDefault?: DialogOpts): Promise<unknown>;
declare function miniMenuPromise(menu: MenuOption[], opts?: DialogOpts): Promise<unknown>;
declare function simpleFormPromise(opts: DialogOpts & {elementsList: (string | HTMLElement | ButtonDef)[]}): Promise<unknown>;

declare const DialogPromise: {
    messages: Record<string, string>
    i18n: {messages: {es: Record<string, string>}}
    defaultOpts: {lengthMenuWithoutFilter: number, autoFocus: boolean}
    path: {img: string}
    simplificateText: (text: string) => string
};

declare const discrepances: {
    showAndThrow(obtained: unknown, expected: unknown, opts?: {showContext?: string}): void
};

function sleep(ms: number): Promise<void>{
    return new Promise(resolve => setTimeout(resolve, ms));
}

function dialogs(): HTMLElement[]{
    return Array.prototype.slice.call(document.querySelectorAll('.dialog-promise'));
}

function lastDialog(): HTMLElement{
    var all = dialogs();
    var dialog = all[all.length - 1];
    if(!dialog) throw new Error('there is no open dialog');
    return dialog;
}

function find<T extends Element>(within: ParentNode, selector: string): T{
    var element = within.querySelector<T>(selector);
    if(!element) throw new Error('element not found: ' + selector);
    return element;
}

function buttonByText(within: HTMLElement, text: string): HTMLButtonElement{
    var button = Array.prototype.slice.call(within.querySelectorAll('button')).find(
        (candidate: HTMLButtonElement) => candidate.textContent == text
    );
    if(!button) throw new Error('button not found: ' + text);
    return button;
}

function keydown(target: EventTarget, keyCode: number, init?: KeyboardEventInit): KeyboardEvent{
    var event = new KeyboardEvent('keydown', {bubbles: true, cancelable: true, ...init});
    Object.defineProperty(event, 'keyCode', {get: () => keyCode});
    target.dispatchEvent(event);
    return event;
}

async function expectRejection(promise: Promise<unknown>, dialogPromiseCode: string): Promise<void>{
    var error: DialogPromiseError | null = null;
    try{
        await promise;
    }catch(err){
        error = err as DialogPromiseError;
    }
    if(error == null) throw new Error('the promise must be rejected with ' + dialogPromiseCode);
    discrepances.showAndThrow(error.DialogPromise, dialogPromiseCode);
}

const KEY = {TAB: 9, ENTER: 13, ESC: 27, UP: 38, DOWN: 40, N: 78};

describe("dialog-promise", function(){
    this.timeout(10000);
    before(function(){
        DialogPromise.path.img = 'lib/img/';
    });
    afterEach(function(){
        var openDialogs = dialogs().length;
        var backgrounds = document.querySelectorAll('.dialog-promise-background').length;
        // closes what a failed test left open, so the following tests can run
        Array.prototype.forEach.call(document.querySelectorAll('.dialog-promise-background'), (background: HTMLElement) => background.click());
        if(this.currentTest && this.currentTest.state == 'passed'){
            discrepances.showAndThrow(openDialogs, 0, {showContext: 'all dialogs must be closed'});
            discrepances.showAndThrow(backgrounds, 0, {showContext: 'all backgrounds must be removed'});
        }
    });
    describe("alertPromise", function(){
        it("shows the message and resolves true with the Ok button", async function(){
            var promise = alertPromise('First example');
            var dialog = lastDialog();
            discrepances.showAndThrow(dialog.textContent!.includes('First example'), true);
            buttonByText(dialog, 'Ok').click();
            discrepances.showAndThrow(await promise, true);
        });
        it("rejects with Escaped when the close button is used", async function(){
            var promise = alertPromise('to close');
            find<HTMLButtonElement>(lastDialog(), '.dialog-promise-close-button').click();
            await expectRejection(promise, 'Escaped');
        });
        it("rejects with Escaped when the background is clicked", async function(){
            var promise = alertPromise('click outside');
            find<HTMLElement>(document, '.dialog-promise-background').click();
            await expectRejection(promise, 'Escaped');
        });
        it("rejects with Escaped when ESC is pressed", async function(){
            var promise = alertPromise('press ESC');
            var event = keydown(document.body, KEY.ESC);
            discrepances.showAndThrow(event.defaultPrevented, true);
            await expectRejection(promise, 'Escaped');
        });
        it("resolves the closeValue when reject is false", async function(){
            var promise = alertPromise('no reject', {reject: false, closeValue: 'closed'});
            keydown(document.body, KEY.ESC);
            discrepances.showAndThrow(await promise, 'closed');
        });
        it("has no close button when withCloseButton is false", async function(){
            var promise = alertPromise('no close button', {withCloseButton: false});
            var dialog = lastDialog();
            discrepances.showAndThrow(dialog.querySelectorAll('.dialog-promise-close-button').length, 0);
            buttonByText(dialog, 'Ok').click();
            await promise;
        });
        it("uses a custom button and attributes", async function(){
            var promise = alertPromise('custom', {
                buttonDef: {label: 'Got it', value: 'got', attributes: {'data-test': 'custom-button'}},
                setAttrs: {'data-dialog': 'custom'}
            });
            var dialog = lastDialog();
            discrepances.showAndThrow(dialog.getAttribute('data-dialog'), 'custom');
            find<HTMLButtonElement>(dialog, '[data-test="custom-button"]').click();
            discrepances.showAndThrow(await promise, 'got');
        });
        it("is docked under an element", async function(){
            var anchor = document.createElement('button');
            anchor.textContent = 'anchor';
            document.body.appendChild(anchor);
            try{
                var promise = alertPromise('under', {underElement: anchor});
                await sleep(50);
                var dialog = lastDialog();
                discrepances.showAndThrow(dialog.getAttribute('docked') != null, true);
                discrepances.showAndThrow(dialog.style.position, 'absolute');
                buttonByText(dialog, 'Ok').click();
                await promise;
            }finally{
                document.body.removeChild(anchor);
            }
        });
        it("is docked under-right when it does not fit at the right", async function(){
            var anchor = document.createElement('button');
            anchor.textContent = 'right anchor';
            anchor.style.position = 'absolute';
            anchor.style.right = '0px';
            anchor.style.top = '0px';
            document.body.appendChild(anchor);
            try{
                var promise = alertPromise('W'.repeat(100), {underElement: anchor});
                await sleep(50);
                var dialog = lastDialog();
                discrepances.showAndThrow(dialog.getAttribute('docked'), 'under-right');
                buttonByText(dialog, 'Ok').click();
                await promise;
            }finally{
                document.body.removeChild(anchor);
            }
        });
        it("replaces an element while it is open", async function(){
            var container = document.createElement('div');
            var replaced = document.createElement('span');
            replaced.textContent = 'replaced';
            container.appendChild(replaced);
            document.body.appendChild(container);
            try{
                var promise = alertPromise('replacing', {replacingElement: replaced});
                await sleep(50);
                discrepances.showAndThrow(replaced.style.display, 'none');
                buttonByText(lastDialog(), 'Ok').click();
                await promise;
                discrepances.showAndThrow(replaced.style.display, 'block');
            }finally{
                document.body.removeChild(container);
            }
        });
        it("prevents the keys outside the dialog unless allow-write", async function(){
            var outside = document.createElement('input');
            var allowed = document.createElement('input');
            allowed.setAttribute('allow-write', 'yes');
            document.body.appendChild(outside);
            document.body.appendChild(allowed);
            try{
                var promise = alertPromise('modal');
                discrepances.showAndThrow(keydown(outside, 'Q'.charCodeAt(0)).defaultPrevented, true);
                discrepances.showAndThrow(keydown(allowed, 'Q'.charCodeAt(0)).defaultPrevented, false);
                buttonByText(lastDialog(), 'Ok').click();
                await promise;
            }finally{
                document.body.removeChild(outside);
                document.body.removeChild(allowed);
            }
        });
        it("uses the spanish messages", async function(){
            var original = {...DialogPromise.messages};
            Object.assign(DialogPromise.messages, DialogPromise.i18n.messages.es);
            try{
                var promise = alertPromise('en castellano');
                buttonByText(lastDialog(), 'Aceptar').click();
                discrepances.showAndThrow(await promise, true);
            }finally{
                Object.assign(DialogPromise.messages, original);
            }
        });
    });
    describe("confirmPromise", function(){
        it("resolves true with Yes", async function(){
            var promise = confirmPromise('Do you like it?');
            buttonByText(lastDialog(), 'Yes').click();
            discrepances.showAndThrow(await promise, true);
        });
        it("rejects with NotConfirmed with No", async function(){
            var promise = confirmPromise('Do you like it?');
            buttonByText(lastDialog(), 'No').click();
            await expectRejection(promise, 'NotConfirmed');
        });
        it("resolves false with No when rejectFalse is false", async function(){
            var promise = confirmPromise('Do you like it?', {rejectFalse: false});
            buttonByText(lastDialog(), 'No').click();
            discrepances.showAndThrow(await promise, false);
        });
        it("answers with the hotkey (the first letter of the button)", async function(){
            var promise = confirmPromise('Do you like it?', {rejectFalse: false});
            if(document.activeElement instanceof HTMLElement) document.activeElement.blur();
            var event = keydown(document.body, KEY.N);
            discrepances.showAndThrow(event.defaultPrevented, true);
            discrepances.showAndThrow(await promise, false);
        });
        it("does not ask again when the user checks the don't ask checkbox", async function(){
            var repo = {timeout: 5000};
            var promise = confirmPromise('Do you like it?', {askForNoRepeat: repo});
            var dialog = lastDialog();
            find<HTMLInputElement>(dialog, '.dialog-promise-dont-ask input[type=checkbox]').checked = true;
            buttonByText(dialog, 'Yes').click();
            discrepances.showAndThrow(await promise, true);
            var second = confirmPromise('Do you like it?', {askForNoRepeat: repo});
            discrepances.showAndThrow(dialogs().length, 0, {showContext: 'the second time must not ask'});
            discrepances.showAndThrow(await second, true);
        });
        it("asks again when the don't ask timeout expires", async function(){
            var repo = {timeout: 1};
            var promise = confirmPromise('Do you like it?', {askForNoRepeat: repo});
            var dialog = lastDialog();
            find<HTMLInputElement>(dialog, '.dialog-promise-dont-ask input[type=checkbox]').checked = true;
            buttonByText(dialog, 'Yes').click();
            discrepances.showAndThrow(await promise, true);
            await sleep(20);
            var second = confirmPromise('Do you like it?', {askForNoRepeat: repo});
            discrepances.showAndThrow(dialogs().length, 1, {showContext: 'the timeout expired, it must ask'});
            buttonByText(lastDialog(), 'Yes').click();
            discrepances.showAndThrow(await second, true);
        });
        it("asks again when the don't ask checkbox is not checked (named repo)", async function(){
            var promise = confirmPromise('Do you like it?', {askForNoRepeat: 'named-repo-test'});
            buttonByText(lastDialog(), 'Yes').click();
            discrepances.showAndThrow(await promise, true);
            var second = confirmPromise('Do you like it?', {askForNoRepeat: 'named-repo-test'});
            discrepances.showAndThrow(dialogs().length, 1, {showContext: 'the second time must ask'});
            buttonByText(lastDialog(), 'Yes').click();
            discrepances.showAndThrow(await second, true);
        });
    });
    describe("promptPromise", function(){
        it("resolves the default value with Ok", async function(){
            var promise = promptPromise('Your name?', 'Ann');
            var dialog = lastDialog();
            discrepances.showAndThrow(find<HTMLInputElement>(dialog, 'input').value, 'Ann');
            buttonByText(dialog, 'Ok').click();
            discrepances.showAndThrow(await promise, 'Ann');
        });
        it("resolves the typed value", async function(){
            var promise = promptPromise('Your name?');
            var dialog = lastDialog();
            find<HTMLInputElement>(dialog, 'input').value = 'Bob';
            buttonByText(dialog, 'Ok').click();
            discrepances.showAndThrow(await promise, 'Bob');
        });
        it("resolves the value when ENTER is pressed in the input", async function(){
            var promise = promptPromise('Your name?', 'Carl', {});
            keydown(find<HTMLInputElement>(lastDialog(), 'input'), KEY.ENTER);
            discrepances.showAndThrow(await promise, 'Carl');
        });
        it("ignores the first key when the input is empty", async function(){
            var promise = promptPromise('Your name?');
            var input = find<HTMLInputElement>(lastDialog(), 'input');
            keydown(input, KEY.ENTER);
            discrepances.showAndThrow(dialogs().length, 1, {showContext: 'the first ENTER in an empty input must be ignored'});
            input.value = 'Fred';
            keydown(input, KEY.ENTER);
            discrepances.showAndThrow(await promise, 'Fred');
        });
        it("widens the input for a wide default value", async function(){
            var wide = 'a very wide default value '.repeat(10);
            var promise = promptPromise('Your name?', wide);
            var input = find<HTMLInputElement>(lastDialog(), 'input');
            await sleep(50);
            discrepances.showAndThrow(input.style.width != '', true);
            buttonByText(lastDialog(), 'Ok').click();
            discrepances.showAndThrow(await promise, wide);
        });
        it("rejects with Escaped with Cancel", async function(){
            var promise = promptPromise('Your name?', 'Dan');
            buttonByText(lastDialog(), 'Cancel').click();
            await expectRejection(promise, 'Escaped');
        });
        it("resolves false with Cancel when rejectWhenCancelPrompt is false", async function(){
            var promise = promptPromise('Your name?', {rejectWhenCancelPrompt: false});
            buttonByText(lastDialog(), 'Cancel').click();
            discrepances.showAndThrow(await promise, false);
        });
        it("uses a textarea when inputDef has lines", async function(){
            var promise = promptPromise('Your story?', 'once upon a time', {inputDef: {lines: 3, attributes: {'data-test': 'story'}}});
            var textarea = find<HTMLTextAreaElement>(lastDialog(), 'textarea[data-test="story"]');
            discrepances.showAndThrow(textarea.getAttribute('rows'), '3');
            buttonByText(lastDialog(), 'Ok').click();
            discrepances.showAndThrow(await promise, 'once upon a time');
        });
        it("moves the focus between the controls with TAB", async function(){
            var promise = promptPromise('Your name?', 'Eve');
            var dialog = lastDialog();
            await sleep(50);
            var input = find<HTMLInputElement>(dialog, 'input');
            input.focus();
            var event = keydown(input, KEY.TAB);
            discrepances.showAndThrow(event.defaultPrevented, true);
            discrepances.showAndThrow(document.activeElement != input && dialog.contains(document.activeElement), true);
            keydown(input, KEY.TAB, {shiftKey: true});
            keydown(document.body, KEY.ESC);
            await expectRejection(promise, 'Escaped');
        });
    });
    describe("miniMenuPromise", function(){
        var menu: MenuOption[] = [
            {value: 'one', label: 'Option one', id: 'option-one'},
            {value: 'two', label: 'Option two'},
            {label: 'Not an option'},
            {value: 'three', labels: ['Option', 'three'], startGroup: true},
        ];
        it("resolves the value of the clicked option", async function(){
            var promise = miniMenuPromise(menu);
            find<HTMLElement>(lastDialog(), '#option-one').click();
            discrepances.showAndThrow(await promise, 'one');
        });
        it("shows groups, options and non options", async function(){
            var promise = miniMenuPromise(menu);
            var dialog = lastDialog();
            discrepances.showAndThrow(dialog.querySelectorAll('tr.dialog-menu-option').length, 3);
            discrepances.showAndThrow(dialog.querySelectorAll('tr.dialog-menu-non-option').length, 1);
            discrepances.showAndThrow(dialog.querySelectorAll('td.dialog-menu-line').length, 1);
            keydown(document.body, KEY.ESC);
            await expectRejection(promise, 'Escaped');
        });
        it("selects an option with the arrows and ENTER", async function(){
            var promise = miniMenuPromise(menu);
            keydown(document.body, KEY.DOWN);
            keydown(document.body, KEY.DOWN);
            keydown(document.body, KEY.DOWN);
            keydown(document.body, KEY.UP);
            var event = keydown(document.body, KEY.ENTER);
            discrepances.showAndThrow(event.defaultPrevented, true);
            discrepances.showAndThrow(await promise, 'two');
        });
        it("resolves the result of doneFun", async function(){
            var promise = miniMenuPromise([
                {label: 'Computed', doneFun: (_row, menuOption) => 'computed by ' + menuOption.label},
            ]);
            find<HTMLElement>(lastDialog(), 'tr.dialog-menu-option td:last-child').click();
            discrepances.showAndThrow(await promise, 'computed by Computed');
        });
        it("has a filter when the menu is large and filters with the initial search", async function(){
            var large: MenuOption[] = [];
            for(var i = 1; i <= DialogPromise.defaultOpts.lengthMenuWithoutFilter + 1; i++){
                large.push({value: i, label: 'Item number ' + i + (i == 2 ? ' special' : '')});
            }
            var ready: () => void = () => undefined;
            var whenReady = new Promise<void>(resolve => { ready = resolve; });
            var promise = miniMenuPromise(large, {initialSearch: {text: 'special'}, whenReady: () => ready()});
            var dialog = lastDialog();
            discrepances.showAndThrow(dialog.querySelectorAll('.dialog-promise-upper-div img').length, 1);
            await whenReady;
            discrepances.showAndThrow(find<HTMLStyleElement>(dialog, 'style').textContent!.includes('special'), true);
            keydown(document.body, KEY.ESC);
            await expectRejection(promise, 'Escaped');
        });
        it("filters while typing in the filter", async function(){
            var promise = miniMenuPromise(menu, {withMenuFilter: true});
            var dialog = lastDialog();
            var upperDiv = find<HTMLElement>(dialog, '.dialog-promise-upper-div div');
            upperDiv.click();
            var span = find<HTMLSpanElement>(upperDiv, 'span');
            discrepances.showAndThrow(keydown(span, KEY.ENTER).defaultPrevented, true, {showContext: 'ENTER in the filter'});
            span.textContent = 'two';
            keydown(span, 'O'.charCodeAt(0));
            keydown(span, 'O'.charCodeAt(0));
            await sleep(300);
            var style = find<HTMLStyleElement>(dialog, 'style');
            discrepances.showAndThrow(style.textContent!.includes('two'), true);
            span.textContent = '';
            keydown(span, 'O'.charCodeAt(0));
            await sleep(300);
            discrepances.showAndThrow(style.textContent, '');
            keydown(document.body, KEY.ESC);
            await expectRejection(promise, 'Escaped');
        });
        it("shows images and links in the options", async function(){
            var shown: string[] = [];
            var promise = miniMenuPromise([
                {value: 'img', label: 'With image', img: 'lib/img/filter-dialog.png', imgStyle: {height: '10px'}},
                {value: 'link', label: 'With link', href: '#dialog-promise-test-link', showPage: () => { shown.push('link'); }},
            ]);
            var dialog = lastDialog();
            discrepances.showAndThrow(find<HTMLImageElement>(dialog, 'img.mini-menu-opt-img').style.height, '10px');
            find<HTMLAnchorElement>(dialog, 'a.mini-menu-opt-a').click();
            discrepances.showAndThrow(await promise, 'link');
            discrepances.showAndThrow(shown, ['link']);
            discrepances.showAndThrow(location.hash, '#dialog-promise-test-link');
        });
        it("has no filter when withMenuFilter is false", async function(){
            var promise = miniMenuPromise(menu, {withMenuFilter: false});
            discrepances.showAndThrow(lastDialog().querySelectorAll('.dialog-promise-upper-div img').length, 0);
            keydown(document.body, KEY.ESC);
            await expectRejection(promise, 'Escaped');
        });
    });
    describe("simpleFormPromise", function(){
        it("includes custom elements that can close the dialog", async function(){
            var custom = document.createElement('div') as HTMLDivElement & {dialogPromiseDone?: (value: unknown) => void};
            custom.className = 'custom-element';
            var promise = simpleFormPromise({elementsList: ['Choose', custom, {label: 'Ok', value: 'ok'}]});
            var element = find<HTMLDivElement & {dialogPromiseDone?: (value: unknown) => void}>(lastDialog(), '.custom-element');
            if(!element.dialogPromiseDone) throw new Error('the custom element must receive dialogPromiseDone');
            element.dialogPromiseDone('from custom');
            discrepances.showAndThrow(await promise, 'from custom');
        });
        it("uses the explicit hotkey of a button", async function(){
            var promise = simpleFormPromise({elementsList: ['Choose', {label: 'First', value: 1}, {label: 'Second', value: 2, hotkey: 'X'}]});
            if(document.activeElement instanceof HTMLElement) document.activeElement.blur();
            keydown(document.body, 'X'.charCodeAt(0));
            discrepances.showAndThrow(await promise, 2);
        });
    });
    describe("utilities", function(){
        it("simplifies text", function(){
            discrepances.showAndThrow(DialogPromise.simplificateText('Ñandú'), 'Nandu');
        });
    });
});
