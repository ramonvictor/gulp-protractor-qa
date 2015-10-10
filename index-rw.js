/* jshint node:true */
var gutil = require('gulp-util');
var fs = require('fs');
var chalk = require('chalk');
var Gaze = require('gaze').Gaze;
var glob = require('buster-glob');
var cheerio = require('cheerio');
var rsvp = require('rsvp');

var utils = require('./lib/util');
var PLUGIN_NAME = 'gulp-protractor-qa';

function GulpProtractorQA() {
	this.testFiles = [];
	this.viewFiles = [];

	this.ptorElementsFoundList = [];
	this.totalNumbOfElements = 0;

	this.ptorFindElementsRegex = utils.getRegexList();
}

/**
 * Push new item into `testFiles` array.
 *
 * @param {Object} file
 */
function setTestFiles(file) {
	this.testFiles.push(file);
}

/**
 * Push new item into `viewFiles` array.
 *
 * @param {Object} file
 */
function setViewFiles(file) {
	this.viewFiles.push(file);
}

/**
 * Push new item into `ptorElementsFoundList` array.
 *
 * @param {Object} element
 */
function setPtorElementFound(element) {
	this.ptorElementsFoundList.push(element);
}

/**
 * Push new item into `ptorElementsFoundList` array.
 *
 * @param {Number} intNumber
 */
function setTotalNumbOfElements(intNumber) {
	this.totalNumbOfElements = intNumber;
}

/**
 * Clear `ptorElementsFoundList` array.
 *
 */
function resetPtorElementsFound() {
	this.ptorElementsFoundList = [];
}

/**
 * Find '.by' strings within a given `path` and `content`.
 *
 * @param {String} path
 * @param {Object} content
 */
function findDotByMatches(path, content) {
	var results;
	var regexList = this.getPtorElementsRegex();

	for (var i = 0; i < regexList.length; i = i + 1) {
		while ((results = regexList[i].match.exec(content)) !== null) {
			setPtorElementFound.call(this, {
				at: results[0],
				val: results[1],
				type: regexList[i].type,
				attrName: regexList[i].attrName,
				fileName: path
			});
		}
	}
}

/**
 * Count 'element' and 'element.all' occurrences in a given `content`.
 *
 * @param {String} content
 */
function elementsCount(content) {
	var elemRegex =  /element[\.all\(|\()]/gi;

	while ((elemRegex.exec(content)) !== null) {
		setTotalNumbOfElements.call(this, this.getTotalNumbOfElements() + 1);
	}
}

/**
 * Search '.by' method within `testFiles` array.
 *
 * @param {String} content
 */
function searchDotByContents() {
	var self = this;
	var testFiles = this.getTestFiles();
	var testFile;

	var promise = new rsvp.Promise(function(resolve) {
		for (var i = 0; i < testFiles.length; i = i + 1) {
			testFile = testFiles[i];
			findDotByMatches.call(self, testFile.path, testFile.contents);
			elementsCount.call(self, testFile.contents);
		}
		resolve();
	});

	return promise;
}

/**
 * Update object related to modified file(s).
 *
 * @param {String} collection
 * @param {String} filepath
 * @param {String} newContent
 */
function updateFileContents(collection, filepath, newContent) {
	var i;
	var item;
	var fileName;
	var collectionList = collection === 'viewFiles' ?
		this.getViewFiles() : this.getTestFiles();

	for (i = 0; i < collectionList.length; i = i + 1) {
		item = collectionList[i];
		if (item.hasOwnProperty('path')) {
			fileName = item.path.replace('./', '/');
			if (filepath.indexOf(fileName) >= 0) {
				item.contents = newContent;
				break;
			}
		}
	}

	/**
	 * Reset `ptorElementsFoundList` and `totalNumbOfElements`.
	 */
	setTotalNumbOfElements.call(this, 0);
	resetPtorElementsFound.call(this);

	/**
	 * Map protractor elements.
	 */
	searchDotByContents.call(this);
}

/**
 * Check whether `{{bind}}` is present in a given `content` or not.
 *
 * @param  {String} bind
 * @param  {String} content
 * @return {Boolean}
 */
function bindExists(bind, content) {
	var results;
	var exists = false;
	var pattern =  /{{(.*?)}}/gi;

	while ((results = pattern.exec(content)) !== null) {
		if (results[1].indexOf(bind) >= 0) {
			exists = true;
		}
	}

	return exists;
}

/**
 * Lookup into `viewfle` content whether `ptorSelector` is findable.
 *
 * @param  {Object} ptorSelector
 * @param  {String} viewFile
 * @return {Boolean|undefined}
 */
function attrLookup(ptorSelector, viewFile) {
	var $ = cheerio.load(viewFile.contents);
	var selector;

	if (ptorSelector.type === 'attr') {
		selector = '[' + ptorSelector.attrName + '="' +
						ptorSelector.val + '"]';

		if (ptorSelector.attrName === 'ng-bind') {
			if (bindExists(ptorSelector.val, viewFile.contents)) {
				return true;
			}
		}
	} else if (ptorSelector.type === 'cssAttr') {
		selector = '[' + ptorSelector.val + ']';
	}

	if ($(selector).length) {
		return true;
	}

	return;
}

/**
 * Check whether all protractor selectors is findable within `viewFiles`.
 *
 * @return {Promise} which resolves when `allElementsFound` remains `true`;
 * 	and rejects when `allElementsFound` is `false`
 * 	sending `foundList` current index {Object} as argument.
 */
function verifyViewMatches() {
	var self = this;
	var allElementsFound = true;
	var foundList = this.getPtorElementsFound();
	var viewFiles = this.getViewFiles();
	var found;

	var queue = new rsvp.Promise.resolve();
	var queue2 = new rsvp.Promise.resolve();

	foundList.forEach(function(ptorSelector, queueIndex) {
		queue = queue.then(function() {
			console.log('queueIndex', queueIndex);

			viewFiles.forEach(function(viewFile, queue2Index) {
				queue2.then(function() {
					console.log('queueIndex', queue2Index);
					return attrLookup.call(self, ptorSelector, viewFile);
				});
			});

			queue2.then(function() {
			    if (!found) {
					allElementsFound = false;
					gutil.log(
						'[' + chalk.cyan(PLUGIN_NAME) + '] ' +
						chalk.red(ptorSelector.at) + ' at ' +
						chalk.bold(ptorSelector.fileName) +
						' not found in view files!'
					);
				}
			});

			return;
		});
	});

	queue.then(function() {
		console.log('::finish all');
		if (allElementsFound) {
			gutil.log(
				'[' + chalk.cyan(PLUGIN_NAME) + '] ' +
				chalk.green('all test element found!')
			);
		}
	});
}

/**
 * Watch files and trigger `updateFileContents` whenever a file changes.
 *
 * @param  {String} src
 * @param  {String} collection
 */
function watchTestfiles(src, collection) {
	var self = this;
	var gaze = new Gaze(src);
	gaze.on('all', function(event, filepath) {
		fs.readFile(filepath, 'utf8', function(err, data) {
			if (err) {
				throw err;
			}
			updateFileContents.call(self, collection, filepath, data);
		});
	});
}

/**
 * Loop through list of files and save a reference for each of them.
 *
 * @param  {String} src
 * @param  {String} collection
 * @return {Promise} which resolves when file reading process is done.
 */
function storeFileContents(src, collection) {
	var self = this;

	watchTestfiles.call(this, src, collection);

	var promise = new rsvp.Promise(function(resolve, reject) {
		var async = function async(arg, callback) {
			fs.readFile(arg, 'utf8', function(err, data) {
				if (err) {
					reject(err);
				}
				callback(arg, data);
			});
		};

		glob.glob(src, function(er, files) {
			files.forEach(function(item) {
				async(item, function(filePath, data) {
					var newItem = {
						path: filePath,
						contents: data
					};

					if (collection === 'testFiles') {
						setTestFiles.call(self, newItem);
						if (self.getTestFiles().length === files.length) {
							resolve();
						}
					} else {
						setViewFiles.call(self, newItem);
						if (self.getViewFiles().length === files.length) {
							resolve();
						}
					}
				});
			});
		});
	});

	return promise;
}

/**
 * Trigger for `storeFileContents`
 * @return {Promise}
 */
function bindStoreFileContents() {
	var self = this;
	var options = this.getOptions();

	var promise = new rsvp.Promise(function(resolve) {
		storeFileContents.call(self, options.testSrc, 'testFiles')
			.then(function() {
				storeFileContents.call(self, options.viewSrc, 'viewFiles')
					.then(function() {
						resolve();
					});
			});
	});

	return promise;
}

/**
 * PUBLIC API
 */

/**
 * Return `ptorFindElementsRegex` list of regex objects.
 */
GulpProtractorQA.prototype.getPtorElementsRegex = function() {
	return this.ptorFindElementsRegex;
};

/**
 * Return `testFiles` array.
 */
GulpProtractorQA.prototype.getTestFiles = function() {
	return this.testFiles;
};

/**
 * Return `viewFiles` array.
 */
GulpProtractorQA.prototype.getViewFiles = function() {
	return this.viewFiles;
};

/**
 * Return `ptorElementsFoundList` array.
 */
GulpProtractorQA.prototype.getPtorElementsFound = function() {
	return this.ptorElementsFoundList;
};

/**
 * Return `totalNumbOfElements`.
 */
GulpProtractorQA.prototype.getTotalNumbOfElements = function() {
	return this.totalNumbOfElements;
};

/**
 * Return `options`.
 */
GulpProtractorQA.prototype.getOptions = function() {
	return this.options;
};

/**
 * Initialize `GulpProtractorQA` with given `testSrc` and `viewSrc`.
 *
 * @param {Object} options
 */
GulpProtractorQA.prototype.init = function(options) {
	var self = this;
	this.options = options || {};

	if (typeof this.options.testSrc === 'undefined') {
		throw new gutil.PluginError(PLUGIN_NAME, '`testSrc` required');
	}
	if (typeof this.options.viewSrc === 'undefined') {
		throw new gutil.PluginError(PLUGIN_NAME, '`viewSrc` required!');
	}

	bindStoreFileContents.call(this)
		.then(function() {
			searchDotByContents.call(self)
				.then(function() {
					/**
					 * Log watched elements.
					 */
					gutil.log(
						'[' + chalk.cyan(PLUGIN_NAME) + '] ' +
						chalk.gray(
							'// ' + self.getPtorElementsFound().length +
							' out of ' + self.getTotalNumbOfElements() +
							' element selectors are been watched'
						)
					);

					/**
					 * Log number of elements watched.
					 */
					gutil.log(
						'[' + chalk.cyan(PLUGIN_NAME) + '] ' +
						chalk.gray(
							'// ' + self.getPtorElementsFound().length +
							' out of ' + self.getTotalNumbOfElements() +
							' element selectors are been watched'
						)
					);

					/**
					 * Verify view matches.
					 */
					verifyViewMatches.call(self);
				});
		});
};

/**
 * Expose `GulpProtractorQA`.
 */
module.exports = new GulpProtractorQA();
