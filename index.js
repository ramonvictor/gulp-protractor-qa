var gutil = require('gulp-util');
var fs = require('fs');
var chalk = require('chalk');
var Gaze = require('gaze').Gaze;
var glob = require("glob");
var cheerio = require('cheerio');


const PLUGIN_NAME = 'gulp-protractor-qa';

var gulpProtractorAdvisor = {
	testFiles : [],
	viewFiles : [],
	
	ptorFindElements : {
		regex : [ 
			{
				htmlRel : "ng-model",
				match : /by\.model\(\s*'(.*?)'\s*\)/gi
			},
			{
				htmlRel : "ng-repeat",
				match : /by\.repeater\(\s*'(.*?)'\s*\)/gi
			}
		],
		foundItems : []
	},

	findElementMatches : function( contents ){
		var results,
			regexList = this.ptorFindElements.regex;
		// lopp regexlist
		for(var i = 0; i<regexList.length; i++ ){
			// verify matches
			while ((results = regexList[i].match.exec(contents)) !== null)
			{
				var res = {
					at : results[0],
					val : results[1],
					htmlRel : regexList[i].htmlRel
				};
				
				this.ptorFindElements.foundItems.push( res );
			}
		}
	},

	mapPtorElements : function( updatedTestFiles ){
		for(var i = 0; i<updatedTestFiles.length; i++ ){
			var obj = updatedTestFiles[i];
			this.findElementMatches(obj.contents);
		}
		this.verifyViewMatches( this.ptorFindElements.foundItems );
	},

	updateContent : function( collection, filepath, newContent ){

		var _this = this;

		for(var i = 0; i < _this[ collection ].length; i++ ){
			var obj = _this[ collection ][i];
		    if(typeof obj.path != 'undefined'){
		       	if( filepath.indexOf(obj.path) >= 0 ){
		       		obj.contents = newContent;
		       		break;
		       	}
		    }
		}

		// reset foundItems
		_this.ptorFindElements.foundItems = [];

		// map protractor elements
		_this.mapPtorElements( _this.testFiles );
	},

	verifyViewMatches : function( foundItems ){

		var allElementFound = true;

		for(var i = 0; i<foundItems.length; i++ ){

			var found = false;
			var foundItem = foundItems[i];

			for(var c = 0; c < this.viewFiles.length; c++ ){
				var obj = this.viewFiles[c];
				
				$ = cheerio.load( obj.contents );
				var selector = [ '[', foundItem.htmlRel, '="', foundItem.val,'"]' ].join("");
				if( $( selector ).length ){
					found = true;
				}
			}

			if( !found ){ 
				allElementFound = false;
				gutil.log('[' + chalk.cyan(PLUGIN_NAME) + '] ' + chalk.red(foundItem.at) + ' not found in view files!' );
			}

		}

		if(allElementFound){
			gutil.log('[' + chalk.cyan(PLUGIN_NAME) + '] ' + chalk.green("all test element found!") );
		}
	},

	populateFiles : function( src, collection, _cb ){

		var _this = this;

		// watch test files changes
		

		var gaze = new Gaze(src);
		gaze.on('all', function(event, filepath) { 
			fs.readFile(filepath, 'utf8', function(err, data){
				if (err) throw err;
				_this.updateContent(collection, filepath, data);
			});
		});


		// async map file contents
		var async = function async(arg, callback) {
		  	fs.readFile(arg, 'utf8', function (err, data) {
			    if (err) throw err;
				callback(arg, data);
			});
		};

		glob(src, function (er, files) {
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
					  })
				});
		});

	},

	populateFilesContent : function( _callback ){
		
		var _this = this;
		// popuplate files, then fire callback
		_this.populateFiles( _this.options.testSrc, "testFiles", function(){
			_this.populateFiles( _this.options.viewSrc, "viewFiles", function(){
				_callback();
			});
		});

	}

};

gulpProtractorAdvisor.init = function( options ){
	var globals = gulpProtractorAdvisor;

	globals.options = options || {};
		
	if (typeof globals.options.testSrc == 'undefined') {
		throw new gutil.PluginError(PLUGIN_NAME, '`testSrc` required');
	}
	if (typeof globals.options.viewSrc == 'undefined') {
		throw new gutil.PluginError(PLUGIN_NAME, '`viewSrc` viewSrc!');
	}

	globals.populateFilesContent(function(){
		globals.mapPtorElements(globals.testFiles);
	});
	
};

// Exporting the plugin main function
module.exports = gulpProtractorAdvisor;