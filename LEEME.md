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

<!--lang:*-->

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

<!--lang:es-->
## Licencia
<!--lang:en--]
## License
[!--lang:*-->

[MIT](LICENSE)

