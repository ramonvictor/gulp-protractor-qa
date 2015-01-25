/* jshint node:true */
var gutil = require('gulp-util');
var fs = require('fs');
var chalk = require('chalk');
var Gaze = require('gaze').Gaze;
var glob = require('buster-glob');
var cheerio = require('cheerio');

var protractorQaUtil = require('./lib/util');
var PLUGIN_NAME = 'gulp-protractor-qa';

var GulpProtractorQA = (function(undefined) {
	'use strict';

	function GulpProtractorQA() {
		this.testFiles = [];
		this.viewFiles = [];
		this.totalNumberOfElements = 0;

		this.foundList = [];
		this.ptorFindElementsRegex = protractorQaUtil.getRegexList();
	}

	GulpProtractorQA.prototype.findDotByMatches = function(path, contents) {
		var results;
		var regexList = this.ptorFindElementsRegex;
		var resultItem = {};

		for (var i = 0; i < regexList.length; i = i + 1) {
			while ((results = regexList[i].match.exec(contents)) !== null) {
				resultItem = {
					at : results[0],
					val : results[1],
					type : regexList[i].type,
					attrName : regexList[i].attrName,
					fileName : path
				};
				
				this.foundList.push( resultItem );
			}
		}
	};


	GulpProtractorQA.prototype.elementsCount = function(contents) {
		var results;
		var elemRegex =  /element[\.all\(|\()]/gi;

		while ((results = elemRegex.exec(contents)) !== null) {
			this.totalNumOfElements = this.totalNumOfElements + 1;
		}
	};

	GulpProtractorQA.prototype.searchProtractorDotByContents = function(updatedTestFiles, beforeViewMatches) {
		for (var i = 0; i < updatedTestFiles.length; i = i + 1) {
			var obj = updatedTestFiles[i];
			this.findDotByMatches(obj.path, obj.contents);
			this.elementsCount(obj.contents);
		}

		// log number of watched elements
		if (typeof beforeViewMatches === 'function') {
			beforeViewMatches();
		}

		// verify matches
		this.verifyViewMatches( this.foundList );
	};

	GulpProtractorQA.prototype.updateFileContents = function(collection, filepath, newContent) {
		
		for (var i = 0; i < this[ collection ].length; i = i + 1) {
			var obj = this[collection][i];
			
			if (typeof obj.path !== 'undefined') {
				if( filepath.indexOf( obj.path.replace('./', '/') ) >= 0 ){
					obj.contents = newContent;
					break;
				}
			}
		}

		// reset foundList and totalNumOfElements
		this.totalNumOfElements = 0;
		this.foundList = [];

		// map protractor elements
		this.searchProtractorDotByContents( this.testFiles );
	};

	GulpProtractorQA.prototype.bindExists = function(bind, contents) {
		var results,
			exists = false,
			pattern =  /{{(.*?)}}/gi;

		while ((results = pattern.exec(contents)) !== null) {
			if (results[1].indexOf( bind ) >= 0) {
				exists = true;
			}
		}
		
		return exists;
	};

	GulpProtractorQA.prototype.verifyViewMatches = function(foundList) {
		var allElementsFound = true;

		for (var i = 0; i<foundList.length; i = i + 1) {

			var found = false;
			var foundItem = foundList[i];

			for (var c = 0; c < this.viewFiles.length; c = c + 1) {
				var obj = this.viewFiles[c];
				
				var $ = cheerio.load(obj.contents);
				var selector = '';

				if (foundItem.type === 'attr') {
				 	selector = '[' + foundItem.attrName + 
				 					'="' + foundItem.val + '"]';
					
					if (foundItem.attrName === 'ng-bind') {
				 		// search for {{bindings}}
				 		if (this.bindExists(foundItem.val, obj.contents)) {
				 			found = true;
				 		}
				 	}

				} else if (foundItem.type === 'cssAttr') {
					selector = '[' + foundItem.val + ']';
				}

				if ($(selector).length) {
					found = true;
				}
			}

			if (!found) { 
				allElementsFound = false;
				gutil.log(
					'[' + chalk.cyan(PLUGIN_NAME) + '] ' + 
					chalk.red(foundItem.at) + ' at ' + 
					chalk.bold(foundItem.fileName)  + 
					' not found in view files!'
				);
			}
		}

		if (allElementsFound) {
			gutil.log(
				'[' + chalk.cyan(PLUGIN_NAME) + '] ' + 
				chalk.green('all test element found!') 
			);
		}
	};

	GulpProtractorQA.prototype.storeFileContents = function(src, collection, _cb) {

		// watch test files changes
		var gaze = new Gaze(src);
		gaze.on('all', function(event, filepath) { 
			fs.readFile(filepath, 'utf8', function(err, data){
				if (err) { throw err; }
				this.updateFileContents(collection, filepath, data);
			});
		});


		// async map file contents
		var async = function async(arg, callback) {
		  	fs.readFile(arg, 'utf8', function (err, data) {
			    if (err) { throw err; }
				callback(arg, data);
			});
		};

		glob.glob(src, function (er, files) {
			files.forEach(function(item) {
				async(item, function(filePath, data){
					this[ collection ].push(
						{
							path : filePath,
							contents : data
						}
					);

					if (this[ collection ].length === files.length) {
						_cb();
					}
				});
			});
		});
	};


	GulpProtractorQA.prototype.init = function(options) {
		this.options = options || {};
			
		if (typeof this.options.testSrc === 'undefined') {
			throw new gutil.PluginError(PLUGIN_NAME, '`testSrc` required');
		}
		if (typeof this.options.viewSrc === 'undefined') {
			throw new gutil.PluginError(PLUGIN_NAME, '`viewSrc` required!');
		}

		this.bindStoreFileContents(function() {
			this.searchProtractorDotByContents(this.testFiles, 
				function beforeViewMatches() {
					gutil.log(
						'[' + chalk.cyan(PLUGIN_NAME) + '] ' + 
						chalk.gray( 
							'// ' + this.foundList.length + 
							' out of ' + this.totalNumOfElements + 
							' element selectors are been watched' 
						)
					);
			});
		});
		
	};

	return GulpProtractorQA;
})();

// Exporting the plugin main function
module.exports = GulpProtractorQA;
