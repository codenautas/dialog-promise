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
    var theName = "previous Name";
    promptPromise("What's your name?", theName).then(function(name){
        theName = name;
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

<!--lang:es-->
## Opciones
Las opciones pueden aplicarse a todas las funciones de este módulo

opción            |predeterminado|uso
------------------|--------------|-------------------------------------
`underElement`    |`null`        |elemento bajo el cual situar la ventana, de no especificarse se centrará en la pantalla
`withCloseButton` |`true`        |si coloca la cruz de cerrar en la esquina superior derecha
`mainAttrs`       |`{}`          |atributos para la ventana principal
`reject`          |`true`        |si se rechaza la promesa al devolver cerrando de la cruz o clickeando fuera de la pantalla o presionando escape
`closeValue`      |`undefined`   |valor que se envía al cerrar con cruz, escape o click fuera del díalogo
`buttonDef`       |`{label:'Ok', value:true}`|descripción del botón principal *(solo para `alertPrimse`)*


<!--lang:en--]
## Options
The options could be passed to all of these functions

option            |def           |use
------------------|--------------|----------------------------------
`underElement`    |`null`        |the dialog apears below this element. If no element is passed the dialog apears in the center of the window
`withCloseButton` |`true`        |display the close button
`mainAttrs`       |`{}`          |attributes for main dialog window
`reject`          |`true`        |true if rejects the promise when close by the close button, Esc key or clicking outside of the dialog
`closeValue`      |`undefined`   |value if rejects the promise when close by the close button, Esc key or clicking outside of the dialog
`buttonDef`       |`{label:'Ok', value:true}`|main button of the alertPromise dialog

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
### elementList en miniMenuPromise

Cada una de los renglones de element list puede tener

opción            |uso
------------------|-------------------------------------
`label`           |texto a desplegar
`value`           |valor que se devuelve al clickear. Si no está especificado el texto no se puede clickear
`img`             |Url de la imagen
`startGroup`      |si comienza un grupo (pone una pequeña linea de separación)
`imgStyle`        |objeto con los atributos de estilo de la imagen. Es importante poner el tamaño para el autocentrado
`displayFun`      |función alternativa que se utiliza para armar las celdas de la fila
`doneFun`         |función alternativa que se llamará al seleccionar el elemento del menú (en vez de resolver la promesa)

<!--lang:en--]
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

<!--lang:es-->
## Licencia
<!--lang:en--]
## License
[!--lang:*-->

[MIT](LICENSE)

