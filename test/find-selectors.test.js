'use strict';

var fs = require('fs');
var assert = require('assert');
var _ = require('underscore');

var findSelectors = require('../lib/find-selectors');

var firstTestObj;
var secondTestObj;

before(function() {
	var path = './test/mock/e2e/first-test.spec.js';
	firstTestObj = {
		path: path,
		content: fs.readFileSync(path, 'utf-8')
	};

	var path2 = './test/mock/e2e/second-test.spec.js';
	secondTestObj = {
		path: path2,
		content: fs.readFileSync(path2, 'utf-8')
	};
});

describe('gulp-protractor-qa/find-selectors', function() {
	it('first-test: should return first locator', function() {
		var locators = findSelectors.init(firstTestObj);

		assert.equal(locators[0].value, 'cart.getNumberOfItems()');
	});

	it('second-test: should return first locator', function() {
		var locators = findSelectors.init(secondTestObj);

		assert.equal(locators[0].value, 'btn-primary');
	});

	it('first-test: should return correct locators length', function() {
		var locators = findSelectors.init(firstTestObj);

		assert.equal(locators.length, 2);
	});

	it('second-test: should return correct locators length', function() {
		var locators = findSelectors.init(secondTestObj);

		assert.equal(locators.length, 4);
	});

	it('repeated locators should never have same path + line info', function() {
		var locators = findSelectors.init(secondTestObj);
		var filter = _.where(locators, {
			value: '[href="/"]'
		});

		var first = filter[0].path + ':' + filter[0].line;
		var second = filter[1].path + ':' + filter[1].line;

		assert.notEqual(first, second);
	});
});
