const { src, dest, parallel, series, watch } = require('gulp');


const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require("gulp-uglify-es").default;
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require("gulp-clean-css");
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');
const pug = require('gulp-pug');
const webp = require('gulp-webp')
const imageminWebp = require('imagemin-webp')
const rename = require('gulp-rename')


function browsersync () {
    browserSync.init({
        server: { baseDir: "app/",
        directory: true},
        notify: true,
        online: false,
    })
}
function scripts() {
	return src([ // Берём файлы из источников
		'node_modules/jquery/dist/jquery.min.js',
        'node_modules/slick-carousel/slick/slick.js', // Пример подключения библиотеки
		'app/js/app.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
		])
	.pipe(concat('app.min.js')) // Конкатенируем в один файл
	.pipe(uglify()) // Сжимаем JavaScript
	.pipe(dest('app/js/')) // Выгружаем готовый файл в папку назначения
	.pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}


function styles() {
    return src(['app/styles/sass/main.sass',
                'node_modules/slick-carousel/slick/slick.css'])
    .pipe(sass())
    .pipe(concat('app.beatify.css'))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) // Создадим префиксы с помощью Autoprefixer
    .pipe(cleancss({ level: { 1: { specialComments: 0 } }, format: 'beautify' } )) // Минифицируем стили
    .pipe(dest('app/styles/')) // Выгрузим результат в папку "app/css/"
    .pipe(rename('app.min.css'))
    .pipe(cleancss()) // Минифицируем стили
    .pipe(dest('app/styles/'))
	.pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function buildcopy() {
    return src([
        'app/styles/**/*.min.css',
        'app/styles/**/*.beatify.css',
        'app/js/**/*.min.js',
        'app/images/dest/**/*',
        'app/**/*.html',
        'app/styles/fonts/*'
    ], { base: "app"})
    .pipe(dest('dist'))
        
}

function startwartch(){
    watch(['app/**/*.js','!app/**/*.min.js'], scripts); 
    watch(['app/**/sass/**/*'], styles)
    watch('app/**/*.html').on('change', browserSync.reload);
    watch('app/images/src/**/*', images);
    watch(['app/pug/*.pug','app/pug/pages/**/*.pug'] ,pug2html);
}

function images() {
    return src('app/images/src/**/*')
    .pipe(newer('app/images/dest/'))
    .pipe(imagemin())
    .pipe(dest('app/images/dest/'))
    .pipe(webp())
    .pipe(dest('app/images/dest/'))
}
function cleanimg() {
    return del(["app/images/dest/**/*","app/images/src/**/*"], { force: true})
}


function cleandist() {
    return del('dist/**/*', { force: true})
}

function pug2html() {
    return src('app/pug/*.pug')
    .pipe(pug())
    .pipe(dest("app/"))
}
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.build = series(styles, scripts, images, buildcopy)  
exports.styles = styles;
exports.images = images;
exports.cleandist = cleandist;
exports.pug2html = pug2html;
exports.cleanimg = cleanimg;
exports.buildcopy = buildcopy
exports.default = parallel(cleandist, pug2html, scripts, styles, browsersync, startwartch)