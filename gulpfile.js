var gulp = require('gulp'),
	protractorQA = require('gulp-protractor-qa');

// Registering the task
gulp.task('protractor-qa', function() {
    protractorQA.init({
        testSrc : 'test/e2e/**/*Spec.js',
        viewSrc : 'partials/*.html'
    });
});

// Running it
gulp.task('default', ['protractor-qa']);