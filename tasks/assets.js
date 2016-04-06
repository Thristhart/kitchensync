const gulp = require('gulp');

function index() {
  return gulp.src("./*.html")
    .pipe(gulp.dest("./public"));
}

function images() {
  return gulp.src("./static/**/*")
    .pipe(gulp.dest("./public"));
}

gulp.task(index);
gulp.task(images);
gulp.task('assets', gulp.parallel('index', 'images'));
