var gulp = require('gulp');
var less = require('gulp-less');
var clean = require('gulp-clean');

gulp.task('clean', function () {
    gulp.src('./css')
        .pipe(clean());
});

gulp.task('less', function() {
    gulp.src('./less/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('./css'));
});

gulp.task('watch', function () {
    gulp.watch('./less/**/*.less', ['less']);
});

gulp.task('default', ['clean', 'less']);
