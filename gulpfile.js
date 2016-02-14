var yargs = require('yargs'),
    join  = require('path').join,
    gulp = require('gulp'),
    config = {
        paths: {
            scripts: ['src/**/*.ts', 'src/*.ts', 'src/**/*.tsx', 'src/*.tsx', 'typings/main.d.ts'],
            tests: ['test/*.spec.js'],
            dest: 'dist'
        }
    },
    args = yargs
            .default('only', undefined)
            .argv;

gulp.task('lint', function() {
    var tslint = require('gulp-tslint');
    return gulp.src(config.paths.scripts)
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

gulp.task('compile', function() {
    var merge = require('merge2');
    var babel = require('gulp-babel');
    var tsc = require('gulp-typescript');
    var tsStream = gulp.src(config.paths.scripts)
        .pipe(tsc({
            target: 'es6',
            declaration: true,
            moduleResolution: 'node',
            module: 'commonjs',
            preserveConstEnums: true,

            // custom typescript,
            typescript: require('typescript')
        }));

    return merge([
        tsStream.dts.pipe(gulp.dest(config.paths.dest)),
        tsStream.js.pipe(babel()).pipe(gulp.dest(config.paths.dest))
    ]);
});


gulp.task('test', ['compile'], function() {
    var mocha = require('gulp-mocha');
    return gulp.src(config.paths.tests, {read: false})
        .pipe(mocha({
            reporter: 'spec',
            ui: 'tdd',
            grep: args.only,
            compilers: {
                js: require('babel-register')({
                    presets: [
                        'es2015',
                        'stage-3'
                    ],
                    plugins: [
                        'transform-runtime'
                    ]
                })
            }
        }));
});

gulp.task('watch', ['test'], function() {
    gulp.watch(config.paths.scripts, ['lint', 'test']);;
    gulp.watch(config.paths.tests, ['lint', 'test']);;
});

gulp.task('setup', function(done) {
    var exec = require('child_process').exec;
    exec(join(__dirname, 'node_modules/.bin/typings') + ' install', 
         function(err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            done(err);
        });
});

gulp.task('docs', function() {
    var typedoc = require('gulp-typedoc');
    return gulp.src(config.paths.scripts)
        .pipe(typedoc({
            // info
            name: 'resonant-reddit-api',
            version: true,

            // doc options
            excludeExternals: true,

            // compiler options
            module: 'common',
            target: 'es6',
            includeDeclarations: true,
            preserveConstEnums: true,

            // output
            json: './typedoc/typedoc.json',
            out: './typedoc'
        }));
});

gulp.task('build', ['lint', 'test']);
