var through = require('through2');
var concat = require('concat');
var uglify = require('uglify-js');
var replace = require('replace');
var async = require('async');

module.exports = function (password, opts) {
  var replacements = ['encrypted', 'options', 'callback'];
  
  async.series([
    function (cb) {
      concat(['./lib/header.js','./lib/decrypt2.js','./lib/footer.js'], './tmp', function (err) {
        if (!err) {
          cb(null,true);
        }
      });
    },
    function (cb) {
      for (var i = 0; i<replacements.length;i++) {
        replace({
          regex: "__"+replacements[i]+"__",
          replacement: replacements[i],
          paths: ['./tmp'],
          recursive: false,
          silent: true,
        });
      }
      cb(null,true);
    }
  ],function () {
    console.log('ready');
  });
  
  // var decryptFn = uglify.minify(['./lib/header.js','./lib/decrypt2.js','./lib/footer.js']);
  
  // console.log(decryptFn);

  function c(file, enc, cb) {
    console.log(file);
    cb();
  }
  return through.obj(c);
}
