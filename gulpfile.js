const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');

gulp.task('buildStyles', function() {
    return gulp.src('style.scss') // Path to your main SCSS file
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['node_modules/bootstrap/scss'] // Path to Bootstrap's SCSS files
        }).on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/css')); // Output directory for compiled CSS files
});

gulp.task('watchTask', function() {
    gulp.watch('style.scss', gulp.series('buildStyles'));
});

gulp.task('default', gulp.series('buildStyles', 'watchTask'));
