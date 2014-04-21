var gutil = require('gulp-util');
var fs = require('fs');
var chalk = require('chalk');
var Gaze = require('gaze').Gaze;
var glob = require("buster-glob");
var cheerio = require('cheerio');
var protractorQaUtil = require('./lib/util');

const PLUGIN_NAME = 'gulp-protractor-qa';

var gulpProtractorQA = {
	testFiles : [],
	viewFiles : [],
	totalNumOfElements : 0,

	ptorFindElements : {
		regex : protractorQaUtil.getRegexList(),
		foundList : []
	},

	findDotByMatches : function( path, contents ){
		var _this = this,
			results,
			regexList = _this.ptorFindElements.regex;
		
		// lopp regexlist
		for( var i = 0; i<regexList.length; i++ ){
			// verify matches
			while ((results = regexList[i].match.exec(contents)) !== null)
			{
				var res = {
					at : results[0],
					val : results[1],
					type : regexList[i].type,
					attrName : regexList[i].attrName,
					fileName : path
				};
				
				_this.ptorFindElements.foundList.push( res );

			}
		}

	},

	elementsCount : function( contents ){
		var _this = this,
			results,
			elemRegex =  /element[\.all\(|\()]/gi;

		while ((results = elemRegex.exec(contents)) !== null) {
			_this.totalNumOfElements = _this.totalNumOfElements + 1;
		}

	},

	searchProtractorDotByContents : function( updatedTestFiles, beforeViewMatches ){
		var _this = this;
		for( var i = 0; i<updatedTestFiles.length; i++ ){
			var obj = updatedTestFiles[i];
			_this.findDotByMatches(obj.path, obj.contents);
			_this.elementsCount( obj.contents );
		}

		// log number of watched elements
		if( typeof beforeViewMatches === 'function'){
			beforeViewMatches();
		}

		// verify matches
		_this.verifyViewMatches( _this.ptorFindElements.foundList );
	},

	updateFileContents : function( collection, filepath, newContent ){

		var _this = this;

		for( var i = 0; i < _this[ collection ].length; i++ ){
			var obj = _this[ collection ][i];
		    if( typeof obj.path != 'undefined' ){
		       	if( filepath.indexOf( obj.path.replace("./", "/") ) >= 0 ){
		       		obj.contents = newContent;
		       		break;
		       	}
		    }
		}

		// reset foundList and totalNumOfElements
		_this.totalNumOfElements = 0;
		_this.ptorFindElements.foundList = [];

		// map protractor elements
		_this.searchProtractorDotByContents( _this.testFiles );
	},

	bindExists : function( bind, contents ){
		var results,
			exists = false,
			pattern =  /{{(.*?)}}/gi;

		while ( (results = pattern.exec(contents)) !== null ){
			if( results[1].indexOf( bind ) >= 0 ){
				exists = true;
			}
		}
		
		return exists;
	},

	verifyViewMatches : function( foundList ){

		var _this = this,
			allElementsFound = true;

		for( var i = 0; i<foundList.length; i++ ){

			var found = false;
			var foundItem = foundList[i];

			for(var c = 0; c < _this.viewFiles.length; c++ ){
				var obj = _this.viewFiles[c];
				
				$ = cheerio.load( obj.contents );
				var selector = '';

				if( foundItem.type === "attr" ){
				 	selector = [ '[', foundItem.attrName, '="', foundItem.val, '"]' ].join("");

				 	if( foundItem.attrName === "ng-bind" ){
				 		// search for {{bindings}}
				 		if( _this.bindExists( foundItem.val, obj.contents ) ){
				 			found = true;
				 		}
				 	}

				} else if( foundItem.type === "cssAttr" ){
					selector = [ '[', foundItem.val, ']' ].join("");
				}

				if( $( selector ).length ){
					found = true;
				}
			}

			if( !found ){ 
				allElementsFound = false;
				gutil.log('[' + chalk.cyan(PLUGIN_NAME) + '] ' + chalk.red(foundItem.at) + ' at ' + chalk.bold(foundItem.fileName)  + ' not found in view files!');
			}

		}

		if( allElementsFound ){
			gutil.log( 
				'[' + chalk.cyan(PLUGIN_NAME) + '] ' + 
				chalk.green("all test element found!") 
			);
		}

	},

	storeFileContents : function( src, collection, _cb ){

		var _this = this;

		// watch test files changes
		var gaze = new Gaze(src);
		gaze.on('all', function(event, filepath) { 
			fs.readFile(filepath, 'utf8', function(err, data){
				if (err) { throw err };
				_this.updateFileContents(collection, filepath, data);
			});
		});


		// async map file contents
		var async = function async(arg, callback) {
		  	fs.readFile(arg, 'utf8', function (err, data) {
			    if (err) { throw err };
				callback(arg, data);
			});
		};

		glob.glob(src, function (er, files) {
				files.forEach(function(item) {
					async(item, function(filePath, data){
					    
					    _this[ collection ].push(
							{
								path : filePath,
								contents : data
							}
						);

					    if( _this[ collection ].length == files.length ) {
					      _cb();
					    }
					});
				});
		});

	},

	bindStoreFileContents : function( _callback ){
		
		var _this = this;

		_this.storeFileContents( _this.options.testSrc, "testFiles", function(){
			_this.storeFileContents( _this.options.viewSrc, "viewFiles", function(){
				_callback();
			});
		});

	}

};

gulpProtractorQA.init = function( options ){
	var globals = gulpProtractorQA;

	globals.options = options || {};
		
	if (typeof globals.options.testSrc == 'undefined') {
		throw new gutil.PluginError(PLUGIN_NAME, '`testSrc` required');
	}
	if (typeof globals.options.viewSrc == 'undefined') {
		throw new gutil.PluginError(PLUGIN_NAME, '`viewSrc` viewSrc!');
	}

	globals.bindStoreFileContents(function(){
		globals.searchProtractorDotByContents(globals.testFiles, function beforeViewMatches(){
			gutil.log( chalk.gray( " // " + globals.ptorFindElements.foundList.length + " out of " + globals.totalNumOfElements + " element selectors are been watched" ) );
		});
	});
	
};

// Exporting the plugin main function
module.exports = gulpProtractorQA;