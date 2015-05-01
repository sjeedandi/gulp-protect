'use strict';

var forge = require('node-forge');
var through = require('through2');
var gutil = require('gulp-util');
var defaults = require('lodash').defaults;
var PluginError = gutil.PluginError;

module.exports = function (password, opts) {
  
  var opt = defaults(opts || {}, {
    keySize: 24,
    ivSize: 8,
    useSalt: true,
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

    // Create buffer from encrypted output and replace the contents of the file
    file.contents = new Buffer(forge.util.encode64(output.getBytes()), 'utf8');
    
    // Push file
    this.push(file);
    
    cb();
  
  }

  return through.obj(protect);

};






