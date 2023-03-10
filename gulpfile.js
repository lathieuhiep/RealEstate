'use strict';

const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const fileInclude = require('gulp-file-include');
const minifyCss = require('gulp-clean-css');
const rename = require('gulp-rename');
const changed = require('gulp-changed');
const imagemin = require('gulp-imagemin');

const pathRoot = './app/';
const pathDestBuild = './build/';

// server
function server() {
    browserSync.init({
        server: pathDestBuild
    })
}

// Task buildSCSSLibs
function buildCSSLibs() {
    return src([
        `${pathRoot}assets/scss/libs/*.scss`
    ])
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(minifyCss({
            level: {1: {specialComments: 0}}
        }))
        .pipe(rename( {suffix: '.min'} ))
        .pipe(dest(`${pathDestBuild}assets/css/libs`))
        .pipe(browserSync.stream());
}
exports.buildCSSLibs = buildCSSLibs;

// Task build styles
function buildStyle() {
    return src(`${pathRoot}assets/scss/style.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(dest(`${pathDestBuild}assets/css`))
        .pipe(browserSync.stream());
}
exports.buildStyle = buildStyle;

// Task build styles pages
function buildStylePages() {
    return src(`${pathRoot}assets/scss/pages/*.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(dest(`${pathDestBuild}assets/css/pages`))
        .pipe(browserSync.stream());
}
exports.buildStylePages = buildStylePages;

// Task compress lib js & mini file
function compressLibraryJsMin() {
    return src([
        './node_modules/jquery/dist/jquery.js',
        './node_modules/bootstrap/dist/js/bootstrap.bundle.js',
        './node_modules/owl.carousel/dist/owl.carousel.js',
    ], {allowEmpty: true})
        .pipe(uglify())
        .pipe(rename( {suffix: '.min'} ))
        .pipe(dest(`${pathDestBuild}assets/js/libs`))
        .pipe(browserSync.stream());
}
exports.compressLibraryJsMin = compressLibraryJsMin

// task build js page
function buildJsTemplate() {
    return src(`${pathRoot}assets/js/**/*.js`, {allowEmpty: true})
        .pipe(uglify())
        .pipe(rename( {suffix: '.min'} ))
        .pipe(dest(`${pathDestBuild}assets/js/`))
        .pipe(browserSync.stream());
}
exports.buildJsTemplate = buildJsTemplate

// Task optimize images
function optimizeImages() {
    const imgSrc = `${pathRoot}assets/images/**/*.+(png|jpg|webp|svg|gif)`;
    const imgDst = `${pathDestBuild}assets/images`;

    return src(imgSrc)
        .pipe(changed(imgDst))
        .pipe(imagemin())
        .pipe(dest(imgDst))
        .pipe(browserSync.stream());
}
exports.optimizeImages = optimizeImages;

// Task include HTML
function includeHTML() {
    return src([`${pathRoot}pages/*.html`])
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file',
            indent: true
        }))
        .pipe(dest(pathDestBuild))
        .pipe(browserSync.stream());
}
exports.includeHTML = includeHTML;

// Task live reload html
function liveReload() {
    return src([
        `${pathDestBuild}*.html`,
        `${pathDestBuild}**/*.css`,
        `${pathDestBuild}**/*.js`,
        `${pathDestBuild}assets/images/**/*`
    ])
        .pipe(browserSync.reload({ stream: true }))
}
exports.liveReload = liveReload

// build app first
function buildAppFirst() {
    buildCSSLibs()
    buildStyle()
    buildStylePages()
    compressLibraryJsMin()
    buildJsTemplate()
    optimizeImages()
    includeHTML()
    watchTask()
}
exports.buildAppFirst = buildAppFirst

// Task watch
function watchTask() {
    server()

    // watch style
    watch(`${pathRoot}assets/scss/libs/*.scss`, buildCSSLibs)
    watch([
        `${pathRoot}assets/scss/**/*.scss`,
        `!${pathRoot}assets/scss/libs/*.scss`,
        `!${pathRoot}assets/scss/pages/*.scss`
    ], buildStyle)
    watch(`${pathRoot}assets/scss/pages/*.scss`, buildStylePages)

    // watch js
    watch(`${pathRoot}assets/js/**/*.js`, buildJsTemplate)

    // watch images
    watch(`${pathRoot}assets/images/**/*`, optimizeImages)

    // watch HTML
    watch(`${pathRoot}**/*.html`, includeHTML)

    // watch liveReload
    watch([
        `${pathDestBuild}*.html`,
        `${pathDestBuild}**/*.css`,
        `${pathDestBuild}**/*.js`,
        `${pathDestBuild}assets/images/**/*`
    ], liveReload)
}
exports.watchTask = watchTask
