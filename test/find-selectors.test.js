/* globals describe, it */
'use strict';

var findSelectors = require('../lib/find-selectors');
var assert = require('assert');

describe('gulp-protractor-qa/find-selectors', function() {
	it('should return correct locator', function() {
		var testContent = {
			path: 'test.js',
			content: 'var id = by.className(\'btn-primary\');'
		};
		var locators = findSelectors.init(testContent);

		assert.equal(locators[0].value, 'btn-primary');
	});
});
