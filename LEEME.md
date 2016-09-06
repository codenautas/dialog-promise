<!--multilang v0 es:LEEME.md en:README.md -->
# dialog-promise
Dialog that returns promises

<!-- cucardas -->
![extending](https://img.shields.io/badge/stability-extending-orange.svg)
[![npm-version](https://img.shields.io/npm/v/dialog-promise.svg)](https://npmjs.org/package/dialog-promise)
[![downloads](https://img.shields.io/npm/dm/dialog-promise.svg)](https://npmjs.org/package/dialog-promise)
[![build](https://img.shields.io/travis/codenautas/dialog-promise/master.svg)](https://travis-ci.org/codenautas/dialog-promise)
[![climate](https://img.shields.io/codeclimate/github/codenautas/dialog-promise.svg)](https://codeclimate.com/github/codenautas/dialog-promise)
[![dependencies](https://img.shields.io/david/codenautas/dialog-promise.svg)](https://david-dm.org/codenautas/dialog-promise)
[![qa-control](http://codenautas.com/github/codenautas/dialog-promise.svg)](http://codenautas.com/github/codenautas/dialog-promise)


<!--multilang buttons-->

idioma: ![castellano](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)
también disponible en:
[![inglés](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)](README.md)


# API

## alertPromise, confirmPromise & promptPromise

<!--lang:es-->
Implementa con promesas las funciones `alert`, `confirm` y `prompt`

<!--lang:en--]
Implements `alert`, `confirm` & `prompt` functions with Promises


<!--lang:es-->
## Uso
<!--lang:en--]
## Use
[!--lang:*-->

```html
<script src="dialog-promise.js"></script>
<button onclick='example2(this)'>example</button>
<script>
function example2(button){
    promptPromise("What's your name?").then(function(name){
        return alertPromise("Hi "+name);
    }).then(function(){
        button.textContent='try again!';
    });
}
</script>
```

## alertPromise, confirmPromise, promptPromise

<!--lang:es-->
Reciben un mensaje (y opcionalmente un conjunto de opciones). 
Equivalen a las funciones nativas `alert`, `confirm` y `prompt`

función   |valor devuelto
----------|---------------------
`alert`   |`true`
`confirm` |`true` o `false` según el botón presionado
`prompt`  |un string con el valor ingresado

Si se presiona `Escape` o se hace `click` fuera de la ventana de diálogo la función devuelve `undefined`.

<!--lang:en--]
Recives a mensage (and an object with options). 
These are versions of the native funcions `alert`, `confirm` y `prompt`

function  |returned value
----------|---------------------
`alert`   |`true`
`confirm` |`true` or `false` 
`prompt`  |a string with the entered text

If `Escape` is pressed or the mouse clicked outside the dialog the function returns `undefined`.

[!--lang:*-->
## miniMenuPromise(elementsList[, opts])
<!--lang:es-->
Despliega un menú

<!--lang:en--]
Display a menu

[!--lang:*-->

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

<!--lang:es-->
## Opciones
Las opciones pueden aplicarse a todas las funciones de este módulo

opción         |uso
---------------|-------------------------------------
`underElement` | elemento bajo el cual situar la ventana, de no especificarse se centrará en la pantalla

<!--lang:en--]
## Options
The options could be passed to all of these functions

option         |use
---------------|-------------------------------------
`underElement` | the dialog apears below this element. If no element is passed the dialog apears in the center of the window

<!--lang:es-->
## Licencia
<!--lang:en--]
## License
[!--lang:*-->

[MIT](LICENSE)

