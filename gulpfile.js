let tmplFolder = 'tmpl'; //template folder
let srcFolder = 'src'; //source folder
let buildFolder = 'build';

let gulp = require('gulp');
let watch = require('gulp-watch');
let del = require('del');
let fs = require('fs');
let ts = require('typescript');
let concat = require('gulp-concat');
let combineTool = require('../magix-composer/index');

combineTool.config({
    debug: true,
    commonFolder: tmplFolder,
    compiledFolder: srcFolder,
    projectName: 'd',
    loaderType: 'cmd_es',
    galleries: {
        mxRoot: 'gallery/'
    },
    scopedCss: [
        './tmpl/gallery/mx-style/index.less',
        './tmpl/assets/index.less'
    ],
    compileJSStart(content) {
        var str = ts.transpileModule(content, {
            compilerOptions: {
                lib: ['es7'],
                target: 'es6',
                module: ts.ModuleKind.None
            }
        });
        str = str.outputText;
        return str;
    }
});

gulp.task('cleanSrc', () => del(srcFolder));

gulp.task('combine', ['cleanSrc'], () => {
    return combineTool.combine().then(() => {
        console.log('complete');
    }).catch(function (ex) {
        console.log('gulpfile:', ex);
        process.exit();
    });
});

gulp.task('watch', ['combine'], () => {
    watch(tmplFolder + '/**/*', e => {
        if (fs.existsSync(e.path)) {
            var c = combineTool.processFile(e.path);
            c.catch(function (ex) {
                console.log('ex', ex);
            });
        } else {
            combineTool.removeFile(e.path);
        }
    });
});

var terser = require('gulp-terser-scoped');
gulp.task('cleanBuild', () => {
    return del(buildFolder);
});

gulp.task('build', ['cleanBuild', 'cleanSrc'], () => {
    combineTool.config({
        debug: false
    });
    combineTool.combine().then(() => {
        gulp.src(srcFolder + '/**/*.js')
            .pipe(terser({
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    keep_fargs: false,
                    global_defs: {
                        DEBUG: false
                    }
                }
            }))
            .pipe(gulp.dest(buildFolder));
    }).catch(ex => {
        console.error(ex);
    });
});

gulp.task('dist', ['cleanSrc'], () => {
    return del('./dist').then(() => {
        combineTool.config({
            debug: false
        });
        return combineTool.combine();
    }).then(() => {
        return gulp.src([
            './src/report.js',
            './src/gallery/**',
            './src/i18n/**',
            './src/util/**',
            './src/panels/**',
            './src/elements/**',
            './src/designer/**'])
            .pipe(concat('page.js'))
            .pipe(gulp.dest('./dist'));
    });
});

gulp.task('cdist', () => {
    return gulp.src('./dist/*.js')
        .pipe(terser({
            compress: {
                drop_console: true,
                drop_debugger: true,
                keep_fargs: false,
                global_defs: {
                    DEBUG: false
                }
            },
            output: {
                ascii_only: true
            }
        }))
        .pipe(gulp.dest('./dist'));
});


let langReg = /@\{lang#[\S\s]+?\}/g;
gulp.task('lang-check', () => {
    let c = combineTool.readFile('./tmpl/i18n/zh-cn.ts');
    let lMap = {}, missed = {};
    c.replace(langReg, m => {
        lMap[m] = 0;
    });
    combineTool.walk('./tmpl', f => {
        if (!f.includes('/lib/') &&
            !f.includes('/i18n/')) {
            let c = combineTool.readFile(f);
            c.replace(langReg, m => {
                if (lMap.hasOwnProperty(m)) {
                    lMap[m]++;
                } else {
                    missed[m] = 'missed';
                }
            });
        }
    });
    console.table(lMap);
    console.table(missed);
});