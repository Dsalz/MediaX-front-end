// Imports
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var svgStore = require('gulp-svgstore');
var svgo = require('gulp-svgo');
var rename = require('gulp-rename');
var raster = require('gulp-raster');
var browserSync = require('browser-sync');

// Path to Files and Folders
var paths = {
    // Third Party Files
    srcBootstrapCSS: 'node_modules/bootstrap/scss/bootstrap.scss',
    srcBootstrapJS: 'node_modules/bootstrap/dist/js/bootstrap.min.js',
    srcJquery: 'node_modules/jquery/dist/jquery.min.js',
    srcTether: 'node_modules/tether/dist/js/tether.min.js',

    // Source Files
    SVGFiles: 'rawsvg/**/*.svg',
    SCSSMainFile: 'scss/*.scss',
    SCSSFiles: 'scss/**/*.scss',
    JSFiles: 'js/**/*.js',

    // Destination Folders
    css: 'css',
    scss: 'scss',
    js: 'js',
    svg: 'svg',
};

// Config options for SASS
var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'expanded'
};

// SASS task - converting scss to css + moving scc to css folder
gulp.task('sass', () => {
    return gulp
        .src([paths.srcBootstrapCSS, paths.SCSSFiles])
        .pipe(plumber())

        // Finding all files in the imports
        .pipe(sass({
            includePaths: ['scss']
        }))
        .pipe(plumber())

        // creating sourcesmaps
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(sourcemaps.write())

        // for vendor prefixing
        .pipe(autoprefixer())

        .pipe(gulp.dest(paths.css))

        // reloading browser
        .pipe(browserSync.reload({
            stream: true
        }));
});

// Move the javascript files into our js folder
gulp.task('js', () => {
    return gulp.src([paths.srcBootstrapJS,
    paths.srcJquery,
    paths.srcTether
    ])
        .pipe(gulp.dest(paths.js))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// SVG Sprites, Runs svgToPng first
gulp.task('sprites', ['svgToPng'], () => {
    return gulp.src(paths.SVGFiles)
        // rename svg files by prefixing with icon
        .pipe(rename({ prefix: 'icon-' }))

        // creates the SVG for inline use
        .pipe(svgStore({ inlineSvg: true }))

        // rename sprites
        .pipe(rename({ basename: 'sprite' }))
        .pipe(gulp.dest(paths.svg))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// Creating fallback PNG images for SVGs
gulp.task('svgToPng', () => {
    return gulp.src(paths.SVGFiles)
        // optimizes svg code
        .pipe(svgo())

        // converts each SVG to PNG
        .pipe(raster())
        .pipe(rename({
            prefix: 'icon-',
            extname: '.png'
        }))
        .pipe(gulp.dest(paths.svg))
});

// Static Server + watching scss/html files
gulp.task('browser-sync', () => {
    browserSync.init(["css/*.css", "js/*.js"], {
        server: {
            baseDir: "./"
        }
    });
});

gulp.task('default', ['sass', 'js', 'sprites', 'browser-sync'], function () {
    gulp.watch([paths.SCSSMainFile, paths.SCSSFiles], ['sass'])
    gulp.watch(paths.JSFiles, ['js']);
    gulp.watch(paths.SVGFiles, ['sprites']);
    gulp.watch("*.html").on('change', browserSync.reload);
});
