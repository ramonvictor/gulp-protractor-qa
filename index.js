var gutil = require('gulp-util');
var fs = require('vinyl-fs');
var es = require('event-stream');
var chalk = require('chalk');
var Gaze = require('gaze').Gaze;


const PLUGIN_NAME = 'gulp-protractor-qa';


var gulpProtractorAdvisor = {
	testFiles : [],
	viewFiles : [],
	
	ptorFindElements : {
		regex : [ 
			/by\.model\(\s*'(.*)'\s*\)/gi,
			/by\.repeater\(\s*'(.*)'\s*\)/gi
		],
		foundItems : []
	},

	findElementMatches : function( contents ){
		var results,
			regexList = this.ptorFindElements.regex;
		// lopp regexlist
		for(var i = 0; i<regexList.length; i++ ){
			// verify matches
			while ((results = regexList[i].exec(contents)) !== null)
			{
				  this.ptorFindElements.foundItems.push(results[1]);
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
		       	if( obj.path == filepath ){
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
			var currentItem = foundItems[i];


			for(var c = 0; c < this.viewFiles.length; c++ ){
				var obj = this.viewFiles[c];
				if( obj.contents.indexOf( currentItem ) >= 0 ){
					found = true;
				}
			}

			if( !found ){ 
				allElementFound = false;
				gutil.log('[' + chalk.cyan(PLUGIN_NAME) + '] "' + chalk.red(currentItem) + '" not found in view files!' );
			}

		}

		if(allElementFound){
			gutil.log('[' + chalk.cyan(PLUGIN_NAME) + '] ' + chalk.green("all test element found!") );
		}
	},

	populateFilesContent : function( callback ){
		
		var _this = this;

		// loop all test files and store its content
		fs.src( _this.options.testSrc )
			.pipe(
				es.map(function(file, cb){ 
					var str = file.contents.toString('utf8');

					_this.testFiles.push(
						{
							path : file.path,
							contents : str
						}
					);
					cb(null, file);
				})
			);


		// loop all html files and store its content
		fs.src( _this.options.viewSrc )
			.pipe(
				es.map(function(file, cb){ 
					var str = file.contents.toString('utf8');

					_this.viewFiles.push(
						{
							path : file.path,
							contents : str
						}
					);

					cb(null, file);

				})
			);


		callback();

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

	// watch test files changes
	var gazeTests = new Gaze(globals.options.testSrc);
	gazeTests.on('all', function(event, filepath) { 
		var r = fs.src(filepath)
			.pipe(
				es.map(function(file, cb){ 
					var str = file.contents.toString('utf8');
					globals.updateContent("testFiles", filepath, str);
				})
			);
	});

	// watch html files changes
	var gazeViews = new Gaze(globals.options.viewSrc);
	gazeViews.on('all', function(event, filepath) { 
		fs.src(filepath)
			.pipe(
				es.map(function(file, cb){ 
					var str = file.contents.toString('utf8');
					globals.updateContent("viewFiles", filepath, str);
				})
			);
	});

	globals.populateFilesContent(function(){
		globals.mapPtorElements(globals.testFiles);
	});
	
};

// Exporting the plugin main function
module.exports = gulpProtractorAdvisor;