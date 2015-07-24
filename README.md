# CompraFácil [![Build Status](https://travis-ci.org/log-oscon/node-comprafacil.svg)](https://travis-ci.org/log-oscon/node-comprafacil)

> CompraFácil payment gateway wrapper.

A JavaScript wrapper for interacting with the CompraFácil SOAP webservices.


## Install

```sh
$ npm install --save comprafacil
```


## Usage

### Create SOAP client

```js
var comprafacil = require('comprafacil');

var options = {
    wsdl:   'http://example.com/webservice?WSDL',
    onDone: function() {},
    onFail: function() {}
};

compraFacil.init(options);

```


### Get information about references

```js
var options = {
    username:     'foo',
    password:     'bar',
    dateStartStr: 'dd-MM-yyyy hh:mm:ss',
    dataEndStr:   'dd-MM-yyyy hh:mm:ss',
    type:         'R',
    onDone:       function() {},
    onFail:       function() {}
};

compraFacil.getInfo(client, options);

```


### Get information about a reference

```js
var options = {
    username:     'foo',
    password:     'bar',
    reference:    '000 000 000',
    onDone:       function() {},
    onFail:       function() {}
};

compraFacil.getInfoReference(client, options);

```


### Get a new MULTIBANCO reference

```js
var options = {
    username: 'foo',
    password: 'bar',
    amount:   1,
    email:    'user@example.com',
    onDone:   function() {},
    onFail:   function() {}
};

compraFacil.getReferenceMB(client, options);

```


### Get a new MULTIBANCO reference specifying a product

```js
var options = {
    username:  'foo',
    password:  'bar',
    productID: 0,
    quantity:  1,
    email:     'user@example.com',
    onDone:    function() {},
    onFail:    function() {}
};

compraFacil.getReferenceMB2(client, options);

```


### Get a new PayShop reference

```js
var options = {
    username: 'foo',
    password: 'bar',
    amount:   1,
    email:    'user@example.com',
    onDone:   function() {},
    onFail:   function() {}
};

compraFacil.getReferencePS(client, options);

```


### Get a new PayShop reference specifying a product

```js
var options = {
    username:  'foo',
    password:  'bar',
    productID: 0,
    quantity:  1,
    email:     'user@example.com',
    onDone:    function() {},
    onFail:    function() {}
};

compraFacil.getReferencePS2(client, options);

```


## Tests

```sh
$ npm run test
```


## Changelog

### 1.1.0

* Bug fixing and code review

### 1.0.0

* Stable release


## License

MIT
