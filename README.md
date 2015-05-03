gulp-protect
============

Protect applications by encrypting sourcecode with AES cipher using [aes-js](https://github.com/ricmoo/aes-js)

Features
--------
- Encrypt application code with 128, 192 or 256 bits key
- Adds decryption method
- Adds aes-js 
- Adds authentication method
- Adds callback method


#### Installation

```
$ npm install gulp-protect --save
```


#### Description

This module encrypts your main application code with AES CTR. 

```javascript
// Your application
function myApp () {
  alert('decrypted');
}

// Encrypted 
[212,216,224,87,158,154,86,11,121,4,163,89,221,203,131,167,179,129,11,230,3,103,135,49,78,140,231,215,166,136,158,80,240,246,218,213,132,147,100,40,163,220,15]
```

The encrypted cipher will be saved in a javascript file with an authentication method for retreiving a decryptionKey from an API, and a decryption method which will evaluate the decrypted code. After decryption a custom callback method will be called to bootstrap your application.


#### Usage
The example uses the module to protect an AngularJS application. 

```javascript  
var gulp = require("gulp");
var protect = require("gulp-protect");

// Provide 16, 24 or 32 bytes encryption key
var encryptionKey = "Secret16BytesKey";

// Set options
var options = { 
  partials: {
    auth: 'path/to/function.js',
  },
  options: {        
    url: 'http://your.authentication.api'
  }
}

// String with callback method 
var callback = 'function () { angular.bootstrap(document, [\'yourApp\']); }')

// Task
gulp.task('protect', function() {
  return gulp.src('dist/app.js')
    .pipe(protect(encryptionKey, options, callback))
    .pipe(gulp.dest('dist'));
});
```
Now you can run the task from the commandline 
```
$ gulp protect
```
