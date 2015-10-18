var gutil = require('gulp-util');
var cheerio = require('cheerio');
var async = require('async');

var storeFileContent = require('./lib/store-file-content');
var findSelectors = require('./lib/find-selectors');
var findViewMatches = require('./lib/find-view-matches');
var consoleOutput = require('./lib/console-output');

var PLUGIN_NAME = 'gulp-protractor-qa';

function GulpProtractorQA() {
	this.testFiles = [];
	this.viewFiles = [];

	this.selectors = [];
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
			callback(null, 'success');
		}
	], function(err, data) {
		findElementSelectors.call(self);
	});
}

function findElementSelectors() {
	var self = this;

	this.testFiles.forEach(function(item) {
		self.selectors = findSelectors.init(item);
	});

	checkSelectorViewMatches.call(this);
}

function checkSelectorViewMatches() {
	var self = this;

	this.viewFiles.forEach(function(item) {
		findViewMatches.init(self.selectors, item.content);
	});

	outputResult.call(this);
}

function outputResult() {
	var notFound = this.selectors.filter(function(item) {
	    return !item.found;
	});

	consoleOutput(notFound);
}

// Exporting the plugin main function
module.exports = new GulpProtractorQA();