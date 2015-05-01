#gulp-protect
Protect applications by encrypting sourcecode with AES cipher using [forge](https://github.com/digitalbazaar/forge)

###Installation
  
    $ npm install gulp-protect --save


###Usage
    
    var gulp = require("gulp");
    var protect = require("gulp-protect");

    gulp.task('protect', function() {
    return gulp.src('app.js')
        .pipe(protect('secretPassword'))
        .pipe(gulp.dest('./dist'));
    });


