var gulp = require('gulp');
var webserver = require('gulp-webserver');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyhtml = require('gulp-minify-html');
var sass = require('gulp-sass');
var livereload = require('gulp-livereload');
var http = require('http');
var clean = require('gulp-clean');
var fileinclude = require('gulp-file-include');
var sourcemaps = require('gulp-sourcemaps');

var src = 'public/src';
var dist = 'public/dist';

var paths = {
  js: src + '/js/**/*.js',
  scss: src + '/scss/*.scss',
  html: src + '/html/**/*.html'
};

var scssOptions = {
  outputStyle: "expanded",
  indentType: "tab",
  indentWidth: 1,
  precision: 3,
  sourceComments: false
};

gulp.task('clean', function() {
  return gulp.src(dist)
    .pipe(clean());
});

gulp.task('fileinclude', function() {
  gulp.src([src + '/html/*.html'], {
      base: ''
    })
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(dist + '/html'));
});

// 웹서버를 localhost:8000 로 실행한다.
gulp.task('server', function() {
  var stream = gulp.src(dist + '/')
    .pipe(webserver({
      livereload: false,
      directoryListing: false,
      open: true,
      middleware: function(req, res, next) {
        if (/_kill_\/?/.test(req.url)) {
          res.end();
          stream.emit('kill');
        }
        next();
      }
    }));
});

gulp.task('server-stop', function(cb) {
  http.request('http://localhost:8000/_kill_').on('close', cb).end();
});

// 자바스크립트 파일을 하나로 합치고 압축한다.
gulp.task('combine-js', function() {
  return gulp.src(paths.js)
    .pipe(concat('common.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dist + '/js'));
});

// sass 파일을 css 로 컴파일한다.
gulp.task('compile-sass', function() {
  return gulp.src(paths.scss)
    .pipe(sourcemaps.init())
    .pipe(sass(scssOptions).on('error', sass.logError))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest(dist + '/css'));
});

// HTML 파일을 압축한다.
gulp.task('compress-html', function() {
  return gulp.src(paths.html)
    .pipe(minifyhtml())
    .pipe(gulp.dest(dist + '/html'));
});


gulp.task('image', function() {
  return gulp.src(src + '/img/**/*.*')
    .pipe(gulp.dest(dist + '/img'));
});

// 파일 변경 감지 및 브라우저 재시작
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(paths.js, ['combine-js']);
  gulp.watch(paths.scss, ['compile-sass']);
  //gulp.watch(paths.html, ['compress-html']);
  gulp.watch(paths.html, ['fileinclude']);
  gulp.watch(dist + '/**').on('change', livereload.changed);
});

//기본 task 설정
gulp.task('default', [
  //'clean',
  'fileinclude',
  'server',
  'combine-js',
  'compile-sass',
  'image',
  //'compress-html',
  'watch'
]);