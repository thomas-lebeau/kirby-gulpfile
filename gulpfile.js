/* eslint-env node */
'use strict';

var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var concat = require('gulp-concat');
var connect = require('gulp-connect-php');
var del = require('del');
var eslint = require('gulp-eslint');
var filter = require('gulp-filter');
var minifyCSS = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var scsslint = require('gulp-scss-lint');
var size = require('gulp-size');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var zip = require('gulp-zip');

var reload = browserSync.reload;

var configs = {
  server: {
    hostname: '127.0.0.1',
    port: '8000',
    base: '.',
    stdio: 'ignore'
  },
  sass: {
    precision: 10,
    includePaths: ['bower_components/']
  },
  autoprefixer: {
    browsers: [
      '> 1%',
      'last 2 versions',
      'Firefox ESR',
      'Opera 12.1'
    ]
  }
};

var paths = {
  css: 'assets/css/',
  fonts: 'assets/fonts/',
  images: 'assets/img/',
  js: 'assets/js/',
  scss: 'assets/scss/'
};

var scripts = {
  main: {
    src: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/bootstrap/js/dist/util.js',
      'bower_components/bootstrap/js/dist/collapse.js',
      paths.js + 'main.js'
    ],
    template: false
  }
};

// Bip on error and display them in 'stylish' style
var errorHandler = {
  sass: function () {
    gutil.beep();
    browserSync.notify('Error in compiling sass files');
    this.emit('end');
  },
  js: function (err) {
    var color = gutil.colors;
    var message = color.gray(err.lineNumber) + ' ' + err.message;
    message = new gutil.PluginError(err.plugin, message).toString();

    gutil.beep();
    process.stderr.write(message + '\n');
    browserSync.notify('Error in compiling js files');
    this.emit('end');
  }
};

// Compile, minify, autoprefix & sourcemap scss files
gulp.task('styles', function () {
  return gulp.src([paths.scss + '**/*.scss'])
    .pipe(plumber({errorHandler: errorHandler.sass}))
    .pipe(sourcemaps.init())
    .pipe(sass.sync(configs.sass).on('error', sass.logError))
    .pipe(autoprefixer(configs.autoprefixer))
    .pipe(gulp.dest(paths.css))
    .pipe(minifyCSS())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.css))
    .pipe(filter('**/*.css'))
    .pipe(reload({stream: true}));
});

// Concat, minify & sourcemap js files
gulp.task('scripts', function (cb) {
  for (var i in scripts) {
    if ({}.hasOwnProperty.call(scripts, i)) {
      var script = scripts[i];
      var fileName = i + '.js';

      var dest = paths.js;
      if (script.template) {
        dest += 'templates/';
      }

      gulp.src(script.src)
        .pipe(sourcemaps.init())
        .pipe(plumber({errorHandler: errorHandler.js}))
        .pipe(uglify())
        .pipe(concat(fileName))
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest))
        .pipe(reload({stream: true, once: true}));
    }
  }
  cb();
});

// Copy some files out of bower_components folder
gulp.task('copy', function () {
  // return gulp.src([''])
  //   .pipe(gulp.dest(paths.fonts));
});

// Cleanup generated files
gulp.task('clean', function (cb) {
  del([
    paths.css + '**/*.min',
    paths.css + '**/*.map',
    paths.js + '**/*.min.js',
    paths.js + '**/*.map'
  ], cb);
});

// lint scss & js files
gulp.task('lint', function (cb) {
  gulp.src([paths.scss + '**/*.scss'])
    .pipe(scsslint({customReport: require('gulp-scss-lint-stylish')}));

  gulp.src([paths.js + '**/*.js', '!**/*.min.js', 'rename.js', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());

  cb();
});

// Make a zip ready for releasing
gulp.task('zip', ['build'], function () {
  var p = require('./package.json');
  var fileName = p.name + '-' + p.version + '.zip';
  var src = [
    '**/*',
    '!bower_components/**/*',
    '!bower_components',
    '!node_modules/**/*',
    '!node_modules',
    '!site/account/*.php',
    '!thumbs/**/*',
    '!assets/avatars/**/*',
    '!site/cache/**/*',
    'site/cache/index.html',
    '!site/config/**/*',
    'site/config/config.php',
    '!*.zip'
  ];

  return gulp.src(src)
    .pipe(size({title: 'unziped'}))
    .pipe(zip(fileName))
    .pipe(size({title: 'ziped'}))
    .pipe(gulp.dest('.'));
});

// Run a development server with browsersync
gulp.task('serve', ['compile'], function () {
  connect.server(configs.server, function () {
    browserSync({proxy: configs.server.hostname + ':' + configs.server.port});
  });

  // watch for changes
  gulp.watch([
    'site/**/*.php',
    paths.images + '**/*',
    paths.fonts + '**/*'
  ]).on('change', reload);

  gulp.watch(paths.scss + '**/*.scss', ['styles']);
  gulp.watch([paths.js + '**/*.js', '!**/*.min.js'], ['scripts']);
});

// aliases
gulp.task('compile', ['styles', 'scripts', 'copy']);
gulp.task('build', ['lint', 'clean'], function () {
  gulp.start('compile');
});
gulp.task('default', ['build']);
