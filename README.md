# dialog-promise
Dialog that returns promises

![extending](https://img.shields.io/badge/stability-extending-orange.svg)
[![npm-version](https://img.shields.io/npm/v/dialog-promise.svg)](https://npmjs.org/package/dialog-promise)
[![downloads](https://img.shields.io/npm/dm/dialog-promise.svg)](https://npmjs.org/package/dialog-promise)



language: ![English](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)
also available in:
[![Spanish](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)](LEEME.md)


# API

## alertPromise, confirmPromise & promptPromise

Implements `alert`, `confirm` & `prompt` functions with Promises


## Use

```html
<link rel="stylesheet" type="text/css" href="dialog-promise.css">
<script src="dialog-promise.js"></script>
<button onclick='example2(this)'>example</button>
<script>
function example2(button){
    var theName = "previous Name";
    promptPromise("What's your name?", theName).then(function(name){
        theName = name;
        return confirmPromise("Do you want to know my name?");
    }).then(function(result){
        return alertPromise("Hi "+theName+". My name is DialogPromise");
    }).then(function(){
        button.textContent='try again!';
    },function(err){
        console.log("User Escapes. Don't insist.")
    });
}
</script>
```

## alertPromise, confirmPromise, promptPromise

Recives a mensage (and an object with options).
These are versions of the native funcions `alert`, `confirm` y `prompt`

function  |returned value
----------|---------------------
`alert`   |`true`
`confirm` |`true` or `false`
`prompt`  |a string with the entered text

If `Escape` is pressed or the mouse clicked outside the dialog the function returns a rejected promise.

## Options
The options could be passed to all of these functions

option            |def           |use
------------------|--------------|----------------------------------
`underElement`    |`null`        |the dialog apears below this element. If no element is passed the dialog apears in the center of the window
`replacingElement`|`null`        |hides the specified element and places the window under his father. If father not exists, window hangs from body
`withCloseButton` |`true`        |display the close button
`mainAttrs`       |`{}`          |attributes (properties) for main dialog window
`setAttrs`        |`{}`          |DOM attributes for main dialog window
`reject`          |`true`        |true if rejects the promise when close by the close button, Esc key or clicking outside of the dialog
`closeValue`      |`undefined`   |value if rejects the promise when close by the close button, Esc key or clicking outside of the dialog
`inputDef`        |`{lines:1, attributes:{attrname: 'attrvalue', othername:'othervalue'}}`   |lines option transforms input to textarea with *lines* rows, attributes is used to set attributes
`buttonDef`       |`{label:'Ok', value:true}`|main button of the alertPromise dialog
`buttonsDef`       |`{label:'Ok', value:true, attributes:{attrname: 'attrvalue', othername:'othervalue'}}`| button description
`askForNoRepeat`  |`false`       |id (or object) to permits the user to ask to remember de answer

## miniMenuPromise(elementsList[, opts])
Display a menu


```html
<script src="dialog-promise.js"></script>
<button id=theButton onclick='example3(this)'>example</button>
<script>
function example3(button){
    miniMenuPromise([
        {value:'ar', img:'ar.png', label:'Argentina'},
        {value:'cl', img:'cl.png', label:'Chile'},
        {value:'uy', img:'uy.png', label:'Uruguay'},
    ], {underElement: theButton}).then(function(option){
        return alertPromise("val = "+option);
    });
}
</script>
```
### miniMenuPromise elementList
The options could be passed to all of these functions

option            |use
------------------|----------------------------------
`label`           |text to show
`value`           |value when click. If not set the row is not clickeable.
`img`             |image url
`startGroup`      |if it starts a group (puts a little line)
`imgStyle`        |object with style attributes for the image
`displayFun`      |alternate function to create cells of the row
`doneFun`         |alternate function to callback when the option was selected instead of resolving the promise
`labels`          |array of texts to show (in table)


## simpleFormPromise(elements, opts)

Shows a simple form

### elements
  * if it is a string it shows the text
  * if it is an HTML elementit shows it
  * otherwise creates a button

## Opciones

atributo de element  |predeterminado|uso
---------------------|--------------|-------------------------------------
`dialogPromiseDone`  |              |see spanish
`firstFocus`         |`null`        |see spanish
`label`              |              |see spanish
`attributes`         |`{}`          |see spanish
`value`              |`null`        |see spanish
`hotkey`             |              |see spanish
## License

[MIT](LICENSE)

