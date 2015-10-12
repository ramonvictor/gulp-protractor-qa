var gutil = require('gulp-util');
var cheerio = require('cheerio');
var async = require('async');

var protractorQaUtil = require('./lib/util');
var storeFileContent = require('./lib/store-file-content');

var PLUGIN_NAME = 'gulp-protractor-qa';

function GulpProtractorQA() {
	this.testFiles = [];
	this.viewFiles = [];
}

GulpProtractorQA.prototype.init = function(options) {
	var self = this;
	this.options = options || {};

	if (typeof this.options.testSrc === 'undefined') {
		throw new gutil.PluginError(PLUGIN_NAME, '`testSrc` required');
	}
	if (typeof this.options.viewSrc === 'undefined') {
		throw new gutil.PluginError(PLUGIN_NAME, '`viewSrc` required!');
	}

	// read all file contents
	async.waterfall([
		function(callback) {
			storeFileContent.init(self.options.testSrc, callback);
		},
		function(data, callback) {
			self.testFiles = data;
			storeFileContent.init(self.options.viewSrc, callback);
		},
		function(data, callback) {
			self.viewFiles = data;
		}
	]);
}

// Exporting the plugin main function
module.exports = new GulpProtractorQA();