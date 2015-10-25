'use strict';

var gulp = require('gulp');
var gulpsync = require('gulp-sync')(gulp);
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var mocha = require('gulp-mocha');

var jsFiles = ['./index.js', './lib/*.js', './assets/*.js',
		'./test/*', 'gulpfile.js'];

// Test
// ----
gulp.task('jscs', function() {
	return gulp.src(jsFiles)
		.pipe(jscs());
});

gulp.task('jshint', function() {
	return gulp.src(jsFiles)
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('mocha', function() {
	return gulp
		.src(['test/*.js'])
		.pipe(mocha());
});

gulp.task('test', gulpsync.sync(['jshint', 'jscs', 'mocha']));
