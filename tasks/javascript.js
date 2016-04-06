const gulp = require('gulp');

const browserify = require('browserify');
const riotify = require('riotify');

const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const util = require('gulp-util');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

const browserSync = require('browser-sync').get('dev');

function js() {
  return browserify({
    entries: ['./app.js'],
    debug: false
  })
  .transform(riotify)
  .on('error', function(error) {
    if(browserSync.sockets) {
      browserSync.sockets.emit('fullscreen:message', {
        title: error.message,
        body:  error.stack
      });
    }
    console.error(error.stack);
    this.emit('end', error);
  })
  .on('end', function(error) {
    if(error) {
      browserSync.error = error;
    }
  })
  .bundle()
  .pipe(source("app.js"))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(babel({
    presets: ['es2015']
  }))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./public'))
}


gulp.task(js);
