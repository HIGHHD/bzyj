var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var jshint = require('gulp-jshint');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sh = require('shelljs');
var ngmin = require('gulp-ngmin');
var notify = require('gulp-notify');
var stripDebug = require('gulp-strip-debug');

var paths = {
  sass: ['./scss/**/*.scss'],
  js:['./www/js/**/*.js']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});
gulp.task('minify', function(done) {
   gulp.src('./www/js/app.js')
      .pipe(ngmin({dynamic: false}))
      .pipe(stripDebug())
      .pipe(uglify({outSourceMap: false}))
      .pipe(concat('app.min.js'))
      .pipe(gulp.dest('./www/js/'))
      .on('end', done);
});
gulp.task('scripts',function(){
  return gulp.src('./www/js/**/*.js')
      //.pipe(jshint('.jshintrc'))
      //.pipe(jshint.reporter('default'))
      .pipe(concat('main.js'))
      .pipe(gulp.dest('./www/js'))
      .pipe(rename({suffix : '.min'}))
      .pipe(uglify())
      .pipe(gulp.dest('./www.js'))
      .pipe(notify({message : 'Scripts task complete' }))
})
gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  //gulp.watch(paths.js,['minify']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
