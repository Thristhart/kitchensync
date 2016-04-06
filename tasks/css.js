const gulp = require('gulp');

function css() {
  return gulp.src("./stylesheets/*.css")
    .pipe(gulp.dest("./dist/stylesheets"));
}

gulp.task(css);
