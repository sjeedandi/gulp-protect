'use strict';

var aesjs = require('aes-js');
var through = require('through2');
var gutil = require('gulp-util');
var fs = require('fs');
var uglify = require('uglify-js');
var path = require('path');
var replace = require('replace');
var async = require('async');
var concat = require('concat');
var _ = require('lodash');
var PluginError = gutil.PluginError;


module.exports = function (encryptionKey, opts, callback) {


  var opt = _.defaults(opts || {}, {
    encoding: 'utf8',
    counter: 5,
    decryptFile: './lib/decrypt3.js',
    forgeFile: './lib/forge.min.js',
    aesFile: './node_modules/aes-js/index.js',
    tmp: './tmp',
    options: {}
  });


  // Uses 24 bits encryptionKey to encrypt data 
  // with AES modus CTR 
  
  function encrypt (data) {

    // Convert encryptionKey to bytes
    var key = aesjs.util.convertStringToBytes(encryptionKey);

    // Convert text to bytes 
    var dataBytes = aesjs.util.convertStringToBytes(data);

    // The counter is optional, and if omitted will begin at 0 
    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(opt.counter));
    var encryptedBytes = aesCtr.encrypt(dataBytes);

    return encryptedBytes;

  }




  function protect (file, enc, cb) {

    var self = this;

    if (!file) {
      throw new PluginError('gulp-protect', 'Missing file option for gulp-protect');
    }

    createApplicationScript({

        // Encrypted source
        'encrypted': JSON.stringify(encrypt(file.contents)),

        // Options to inject into anonymous function
        'options': JSON.stringify(opt.options),

        // Callback for bootstrapping the application
        'callback': callback,

        // Counter
        'counter': opt.counter

      },
      function (contents) {

        // Replace file contents
        file.contents = new Buffer(contents, opt.encoding);

        // Push to this for pipe
        self.push(file);

        // Callback      
        cb(null, file);

      });

  }


  function createApplicationScript (replacements, callback) {

    async.series([
        function (cb) {
          concat([path.resolve(__dirname, opt.aesFile), path.resolve(__dirname, opt.decryptFile)], opt.tmp, function (err) {
            if (err) {
              throw new PluginError('gulp-protect', 'Could not concatenate templates');
            }
            cb(null, true);
          });
        },
        function (cb) {
          _.forEach(replacements, function (value, key) {
            replace({
              regex: "__" + key + "__",
              replacement: value,
              paths: [opt.tmp],
              recursive: false,
              silent: true,
            });
          });
          cb(null, true);
        },
        function (cb) {
          fs.writeFile(opt.tmp, minify(opt.tmp), function (err) {
            if (err) {
              throw new PluginError('gulp-protect', 'Could not write .tmp');
            }
            cb();
          });
        }
      ],
      function () {
        fs.readFile(opt.tmp, {
          encoding: 'utf8'
        }, function (err, content) {
          if (err) {
            throw new PluginError('gulp-protect', 'Could not concatenate forge.js with .tmp');
          }
          callback(content);
        });
      });

  }


  function minify(file, options) {

    options = options || {};

    try {
      return uglify.minify(file, options).code;
    } catch (err) {
      throw new PluginError('gulp-protect', 'uglify failed');
      return '';
    }
  }


  return through.obj(protect);

};
