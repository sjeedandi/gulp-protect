'use strict';

var forge = require('node-forge');
var through = require('through2');
var gutil = require('gulp-util');
var defaults = require('lodash').defaults;
var PluginError = gutil.PluginError;
var fs = require('fs');
var uglify = require('uglify-js');


module.exports = function (password, opts) {
  
  
  var opt = defaults(opts || {}, {
    keySize: 24,
    ivSize: 8,
    useSalt: true,
    writeAsVar: 'protect',
    decryptFn: './node_modules/gulp-protect/lib/decrypt.js'
  });


  function protect (file, enc, cb) {

    if (!file) {
      throw new PluginError('gulp-protect', 'Missing file option for gulp-protect');
    }
    
    // Get derived bytes
    var salt = opt.useSalt ? forge.random.getBytesSync(8) : null;
    
    var derivedBytes = forge.pbe.opensslDeriveBytes(password, salt, opt.keySize + opt.ivSize);
    var buffer = forge.util.createBuffer(derivedBytes);
    var key = buffer.getBytes(opt.keySize);
    var iv = buffer.getBytes(opt.ivSize);

    // Create cipher
    var cipher = forge.cipher.createCipher('3DES-CBC', key);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(file.contents, 'utf8'));
    cipher.finish();

    var output = forge.util.createBuffer();

    // If using a salt, prepend this to the output
    // and add 'Salted__' prefix to match openssl tool output
    if (salt !== null) {
      output.putBytes('Salted__'); 
      output.putBytes(salt);
    }

    output.putBuffer(cipher.output);

    var encrypted = forge.util.encode64(output.getBytes());

    // Write encrypted string as variable
    if (opt.writeAsVar && typeof encrypted === 'string') {
      encrypted = 'var ' + opt.writeAsVar + ' = "' + encrypted + '";';
    }
    // Add decryption function
    if (opt.decryptFn) {
      encrypted = appendDecryptionFn(encrypted);
    }
    // Add minified forge script
    encrypted = prependForge(encrypted);
    // Create buffer from encrypted output and replace the contents of the file
    file.contents = new Buffer(encrypted, 'utf8');
    // Push file
    this.push(file);
    
    cb();
  
  }


  function prependForge (file) {
    
    var str = fs.readFileSync('node_modules/node-forge/js/forge.min.js', 'utf8');
    
    return str
      + '\n\n'
      + file;

  }


  function minify(file, options) {
    
    var mangled = '';

    options = options || {};

    if (typeof file !== 'string') {
      file = String(file.contents);
    }
    try {
      mangled = uglify.minify(file, options);
      // mangled.code = new Buffer(mangled.code.replace(reSourceMapComment, ''));
      return mangled;
    } catch (e) {
      throw new PluginError('gulp-protect', e);
      return '';
    }
  }


  function appendDecryptionFn (file) {
    
    if (opt.decryptFn === undefined || typeof opt.decryptFn !== 'string') {
      throw new PluginError('gulp-protect', 'Missing decrypt method for gulp-protect');
      return file;
    }

    return file 
      + '\n\n'
      + minify(opt.decryptFn).code
      + '\n\n'
      + opt.callback;
  }

  function endStream (cb) {
    cb();
  }

  return through.obj(protect);

};
