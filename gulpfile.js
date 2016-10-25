var gulp        = require('gulp'),
    path        = require('path'),
    gutil       = require('gulp-util'),
    webpack     = require('webpack'),
    webserver   = require('gulp-webserver'),
    runSequence = require('run-sequence');

var WEBPACK_CONFIG = require('./webpack.config.js');
var DEV_PORT       = 8080;

WEBPACK_CONFIG.watch = true;

gulp.task('dev', function(callback) {
  runSequence(
    'dev.webpack',
    'dev.serve',
    callback
  );
});

gulp.task('dev.serve', function() {
  gulp.src('./')
    .pipe(webserver({
      port: DEV_PORT,
      fallback: 'index.html',
    }));
});

gulp.task('dev.webpack', function() {
  webpack(WEBPACK_CONFIG, function(err, stats) {
    if (err) {
      throw new gutil.PluginError('dev.webpack', err);
    }

    gutil.log('[dev.webpack]', stats.toString({
      colors: true
    }));
  });
});

gulp.task('default', ['dev']);
