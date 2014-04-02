'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var module = require('module');

module.exports = function(options) {
	var options = options || {};
	return through.obj(function (file, enc, cb) {

		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-protractor-advisor', 'Streaming not supported'));
			return cb();
		}

		try {
			file.contents = file.contents.toString();
			console.log( file.contents );
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-protractor-advisor', err));
		}

		this.push(file);
		cb();
	});
};