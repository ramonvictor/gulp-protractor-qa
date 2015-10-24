# [gulp](http://gulpjs.com)-protractor-qa [![NPM version](https://badge.fury.io/js/gulp-protractor-qa.svg)](http://badge.fury.io/js/gulp-protractor-qa) [![Build Status](https://travis-ci.org/ramonvictor/gulp-protractor-qa.svg?branch=master)](https://travis-ci.org/ramonvictor/gulp-protractor-qa)


<img src="https://raw.githubusercontent.com/ramonvictor/gulp-protractor-qa/master/assets/protractor-qa-logo.png" alt="Protractor QA Logo" />

Keeping end-to-end tests up-to-date can be really painful. Gulp Protractor QA warns you on the fly whether all element() selectors could be found or not within your application view files.

###### *Because code changes should not break your tests!*

## How it works?

<img src="https://raw.githubusercontent.com/ramonvictor/gulp-protractor-qa/master/assets/gulp-protractor-qa.gif" width="720" height="auto" alt="Video screen demo of gulp-protractor-qa in action!">


### [Screencast](http://bit.ly/1hceBSw)

<a href="http://bit.ly/1hceBSw" target="_blank"><img src="https://raw.githubusercontent.com/ramonvictor/gulp-protractor-qa/master/assets/screencast-gulp-protractor-qa.jpg" width="675" height="auto" alt="How gulp-protractor-qa works?"></a>

> TL;DR: a couple of new features and fixes have been added since this screencast publication.

## Install

```
npm install --save-dev gulp-protractor-qa
```

## Example

```js
var gulp = require('gulp');
var protractorQA = require('gulp-protractor-qa');
```

Registering the task
```js
gulp.task('protractor-qa', function() {
   protractorQA.init({
      runOnce: true, // optional
      testSrc: 'test/e2e/**/*Spec.js',
      viewSrc: [ 'index.html', 'partials/*.html' ]
   });
});
```

Running it
```js
gulp.task('default', ['protractor-qa']);
```
[See final gulpfile.js example](https://github.com/ramonvictor/gulp-protractor-qa/blob/master/assets/gulpfile.js).

## API

### protractorQA(options)

#### options

##### runOnce

Type: `Boolean`
Default: `false`

Optional: Set to `true` when you want to control yourself when to run task.
In other words, it won't watch files changes.

##### testSrc

Type: `String` or `Array`
Default: `""`

Where the plugin should watch the changes in order to map all `element()` indexes.

##### viewSrc

Type: `String` or `Array`
Default: `""`

Where your AngularJS view files are located. Protractor QA will watch the changes in those files to verify if all `element()` selectors could be found.

## Watched selectors by gulp-protractor-qa

Gulp-protractor-qa is currently watching the following `element()` locators:

- `by.binding()`;
- `by.model()`;
- `by.repeater()`;
- `by.css()`;
- `by.id()`;
- `by.className()`;
- `by.name()`;

Note: currently it can't find `by.css()` selectors with `:nth-child()`.

## Changelog

- **0.2.0** api completely rewritten, including:
	- Introducing `runOnce` feature;
	- Ignoring commented out element selectors;
	- Handle any form of denormalized directives - except `ng:*` due to `cheerio` limitation;
	- Fix a couple of bugs related to `by.css` old regex;
	- Add suport for more protractor locators: `by.id()`, `by.className()` and `by.name()`.

- **0.1.19** improve `by.css` regex;

- **0.1.18** bug fix: adding support for `data-*` attributes;

- **0.1.14** showing "`<number>` out of `<total>` element selectors are been watched" in the log;

- **0.1.12** bug fix related to `gaze` version;

- **0.1.10** `testSrc` and `viewSrc` now receive `string` or `array` value;

- **0.1.07**
	- Improved the error log showing in which file each wrong selector came from;
	- Improved the regex that find selectors by: `by.css('[attr-name="attr-value"]')`;

- **0.1.05**
	- Mapping more `element()` selectors: `by.css('[attr-name="attr-value"]')` and `by.binding()`;
	- Improve regex rules to support both: `protractor.By` and `by.`;
	- Other code improvements;

- **0.1.0** Mapping just two `element()` selectors: `by.model()` and `by.repeater()`.

## License

[MIT](https://github.com/ramonvictor/gulp-protractor-qa/blob/master/license.txt) © [Ramon Victor](https://github.com/ramonvictor)
