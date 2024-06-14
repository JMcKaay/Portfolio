const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));

function buildStyles() {
    return src('style.scss') // Watch the correct source SASS file
        .pipe(sass().on('error', sass.logError)) // Handle errors gracefully
        .pipe(dest('dist/css')); // Output directory
}

function watchTask() {
    watch(['style.scss'], buildStyles); // Watch all .sass files in the src/scss directory
}

exports.default = series(buildStyles, watchTask);
