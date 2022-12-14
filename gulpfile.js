'use strict';

const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const fileInclude = require('gulp-file-include');
const minifyCss = require('gulp-clean-css');
const concatCss = require('gulp-concat-css');

const pathRoot = './app/';

// server
function server() {
    browserSync.init({
        server: pathRoot
    })
}

// Task include HTML
function includeHTML() {
    return src([`${pathRoot}pages/*.html`])
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file',
            indent: true
        }))
        .pipe(dest(pathRoot))
        .pipe(browserSync.stream());
}
exports.includeHTML = includeHTML;

// Task build styles
function buildStyles() {
    return src(`${pathRoot}assets/scss/style.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(dest(`${pathRoot}assets/css/`))
        .pipe(browserSync.stream());
}
exports.buildStyles = buildStyles;

// Task compress mini library css theme
function compressLibraryCssMin() {
    return src([
        './node_modules/bootstrap/dist/css/bootstrap.css',
        './node_modules/owl.carousel/dist/assets/owl.carousel.css',
    ]).pipe(concatCss("library.min.css"))
        .pipe(minifyCss({
            compatibility: 'ie8',
            level: {1: {specialComments: 0}}
        }))
        .pipe(dest(`${pathRoot}assets/css/`))
        .pipe(browserSync.stream());
}
exports.compressLibraryCssMin = compressLibraryCssMin

// Task compress lib js & mini file
function compressLibraryJsMin() {
    return src([
        './node_modules/bootstrap/dist/js/bootstrap.bundle.js',
        './node_modules/owl.carousel/dist/owl.carousel.js',
    ], {allowEmpty: true})
        .pipe(concat('library.min.js'))
        .pipe(uglify())
        .pipe(dest(`${pathRoot}assets/js/`))
        .pipe(browserSync.stream());
}
exports.compressLibraryJsMin = compressLibraryJsMin

// Task live reload html
function liveReloadHTML() {
    return src([`${pathRoot}*.html`])
        .pipe(browserSync.reload({ stream: true }))
}
exports.liveReloadHTML = liveReloadHTML

// build app first
function buildAppFirst() {
    includeHTML()
    buildStyles()
    watchTask()
}
exports.buildAppFirst = buildAppFirst

// Task watch
function watchTask() {
    server()
    watch(`${pathRoot}pages/*.html`, includeHTML)
    watch(`${pathRoot}components/*.html`, includeHTML)
    watch(`${pathRoot}assets/scss/**/*.scss`, buildStyles)
    watch(`${pathRoot}*.html`, liveReloadHTML)
}
exports.watchTask = watchTask
