'use strict';

var forge = require('node-forge');
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

module.exports = function (password, opt) {
  
  var encrypted;
  
  var defaultOpt = {
    keySize: 24,
    ivSize: 8
  };

  function protect (file, enc, cb) {

    if (!file) {
      throw new PluginError('gulp-protect', 'Missing file option for gulp-protect');
    }
    
    opt = opt || defaultOpt;

    // Get derived bytes
    var salt = forge.random.getBytesSync(8);
    // var md = forge.md.sha1.create(); // "-md sha1"
    
    var derivedBytes = forge.pbe.opensslDeriveBytes(password, salt, opt.keySize + opt.ivSize/*, md*/);
    var buffer = forge.util.createBuffer(derivedBytes);
    var key = buffer.getBytes(opt.keySize);
    var iv = buffer.getBytes(opt.ivSize);

    var cipher = forge.cipher.createCipher('3DES-CBC', key);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(file.contents, 'utf8'));
    cipher.finish();

    var output = forge.util.createBuffer();

    // If using a salt, prepend this to the output
    if (salt !== null) {
      output.putBytes('Salted__'); // (add to match openssl tool output)
      output.putBytes(salt);
    }

    output.putBuffer(cipher.output);

    // Create buffer from encrypted output and replace the contents of the file
    file.contents = new Buffer(forge.util.encode64(output.getBytes()), 'utf8');
    
    // Push file
    this.push(file);
    
    cb();
  
  }

  function endStream (cb) {
    cb();
  }

  return through.obj(protect);

};






