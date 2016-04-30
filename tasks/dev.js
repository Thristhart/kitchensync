const gulp = require('gulp');
const browserSync = require('browser-sync').create('dev');

gulp.task('watch', () => {
  gulp.watch(['./app.js', './tags/**/*'], gulp.series('js', reloadIfNoError));
  gulp.watch(['./*.html', './static/**/*'], gulp.series('assets', reloadIfNoError));
  gulp.watch(['./stylesheets/*.css'], gulp.series('css', reloadIfNoError));
});

function reloadIfNoError() {
  if(!browserSync.error) {
    browserSync.reload();
  }
  browserSync.error = null;
}
function dev() {
  browserSync.init({
    server: {
      baseDir: "./public"
    },
    port: 8081,
    ghostMode: false,
    plugins: ["bs-fullscreen-message"]
  });
}

require('./javascript');
require('./css');
require('./assets');

gulp.task('dev', gulp.series(
  'clean',
  gulp.parallel('js', 'assets'),
  gulp.parallel('watch', dev)
));
