/* jshint node:true */
var gulp = require('gulp');
var protractorQA = require('gulp-protractor-qa');

(function() {
	'use strict';

	// Register GulpProtractorQA task.
	gulp.task('protractor-qa', function() {
		protractorQA.init({
			runOnce: true, // optional: when you don't want to watch files changes
			testSrc: 'test/e2e/**/*Spec.js',
			viewSrc: ['index.html', 'partials/*.html']
		});
	});

	// Run `gulp` tasks.
	gulp.task('default', ['protractor-qa']);
})();
