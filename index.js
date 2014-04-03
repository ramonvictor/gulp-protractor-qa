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
			/by\.model\('(.*?)'\)/gi,
			/by\.repeater\('(.*?)'\)/gi
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
		
		if(collection === "testSrc"){
			for(var i = 0; i<this.testFiles.length; i++ ){
				var obj = this.testFiles[i];
			    if(typeof obj.path != 'undefined'){
			       	if( obj.path == filepath ){
			       		obj.contents = newContent;
			       		break;
			       	}
			    }
			}
		}

		if(collection === "viewSrc"){
			for(var i = 0; i<this.viewFiles.length; i++ ){
				var obj = this.viewFiles[i];
			    if(typeof obj.path != 'undefined'){
			       	if( obj.path == filepath ){
			       		obj.contents = newContent;
			       		break;
			       	}
			    }
			}
		}

		// reset foundItems
		this.ptorFindElements.foundItems = [];
		// map protractor elements
		this.mapPtorElements(this.testFiles);
	},
	verifyViewMatches : function( foundItems ){

		var allElementFound = true;

		for(var i = 0; i<foundItems.length; i++ ){

			var found = false;
			var currentItem = foundItems[i];


			for(var c = 0; c<this.viewFiles.length; c++ ){
				var obj = this.viewFiles[c];
				if( obj.contents.indexOf( currentItem ) >= 0 ){
					found = true;
				}
			}

			if( !found ){ 
				allElementFound = false;
				gutil.log('[' + chalk.blue(PLUGIN_NAME) + '] "' + chalk.red(currentItem) + '" not found in view files!' );
			}

		}

		if(allElementFound){
			gutil.log('[' + chalk.blue(PLUGIN_NAME) + '] ' + chalk.green("all test element found!") );
		}
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


	// loop all test files and store its content
	fs.src(globals.options.testSrc)
		.pipe(
			es.map(function(file, cb){ 
				var str = file.contents.toString('utf8');

				globals.testFiles.push(
					{
						path : file.path,
						contents : str
					}
				);

			})
		);

	// watch test files changes
	var gazeTests = new Gaze(globals.options.testSrc);
	gazeTests.on('all', function(event, filepath) { 
		fs.src(filepath)
			.pipe(
				es.map(function(file, cb){ 
					var str = file.contents.toString('utf8');
					globals.updateContent("testSrc", filepath, str);
				})
			);
	});

	// loop all html files and store its content
	fs.src(globals.options.viewSrc)
		.pipe(
			es.map(function(file, cb){ 
				var str = file.contents.toString('utf8');

				globals.viewFiles.push(
					{
						path : file.path,
						contents : str
					}
				);

			})
		);

	// watch html files changes
	var gazeViews = new Gaze(globals.options.viewSrc);
	gazeViews.on('all', function(event, filepath) { 
		fs.src(filepath)
			.pipe(
				es.map(function(file, cb){ 
					var str = file.contents.toString('utf8');
					globals.updateContent("viewSrc", filepath, str);
				})
			);
	});
	
	// fire protractor-qa init function
	// globals.mapPtorElements(globals.testFiles);

};

// Exporting the plugin main function
module.exports = gulpProtractorAdvisor;