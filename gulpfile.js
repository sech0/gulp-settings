const gulp = require('gulp');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const terser = require('gulp-terser');
const del = require('del');
const browserSync = require('browser-sync').create();
const less = require('gulp-less');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const pngquant = require('gulp-pngquant');
const smartgrid = require('smart-grid');
const grid = require('./grid');

const config = {
    root: './src/',
    img: {
        src: 'img/**/*',
        dist: './dist/img/'
    },
    html: {
        src: 'index.html',
        dist: './dist/'
    },
    css: {
        src: 'less/**/*.less',
        dist: './dist/css/'
    },
    js: {
        src: 'js/**/*.js',
        dist: './dist/js/'
    }
};

gulp.task('sg', () =>
    smartgrid(config.root + 'less/', grid)
);

gulp.task('styles', () =>
    gulp.src(config.root + config.css.src)
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(concat('all.min.css'))
    .pipe(cleanCSS({
        level: 2
    }))
    .pipe(gulp.dest(config.css.dist))
    .pipe(browserSync.stream())
);

gulp.task('scripts', () =>
    gulp.src(config.root + config.js.src)
    .pipe(babel({
        presets: ['@babel/env'],
    }))
    .pipe(concat('all.min.js'))
    .pipe(terser())
    .pipe(gulp.dest(config.js.dist))
    .pipe(browserSync.stream())
);

gulp.task('img', () =>
    gulp.src(config.root + config.img.src)
    .pipe(imagemin({
        interlaced: true,
        progressive: true,
        svgoPlugins: [{
            removeViewBox: false
        }],
        use: [pngquant()]
    }))
    .pipe(gulp.dest(config.img.dist))
    .pipe(browserSync.stream())
);

gulp.task('html', () =>
    gulp.src(config.root + config.html.src)
    .pipe(gulp.dest(config.html.dist))
    .pipe(browserSync.stream())
);

gulp.task('clean', () =>
    del(['dist/*']),
);

gulp.task('start', () =>
    browserSync.init({
        server: {
            baseDir: config.html.dist
        },
        notify: false,
        tunnel: false
    }),

    gulp.watch(config.root + config.html.src, gulp.series('html')),
    gulp.watch(config.root + config.css.src, gulp.series('styles')),
    gulp.watch(config.root + config.js.src, gulp.series('scripts')),
    gulp.watch(config.root + config.img.src, gulp.series('img')),
    gulp.watch(config.root + config.html.src).on('change', browserSync.reload)
);

gulp.task('build', gulp.series('clean', gulp.parallel('html', 'styles', 'scripts', 'img')));

gulp.task('dev', gulp.series('build', 'start'));