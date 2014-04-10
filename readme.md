# [gulp](http://gulpjs.com)-protractor-qa

A gulp plugin to help you avoiding broken Protractor tests due to not found `element()` selectors.

<img src="https://raw.githubusercontent.com/ramonvictor/gulp-protractor-qa/master/assets/gulp-protractor-qa.gif" alt="Video screen demo of gulp-protractor-qa in action!">

> This is a beta version. From now, it's just mapping the following `element()` selectors: `by.model()`, `by.binding()`, `by.css('[attr-name="attr-value"]')` and `by.repeater()`.
This project is for the community, so please: test it, open [issues](https://github.com/ramonvictor/gulp-protractor-qa/issues), [fork it](https://github.com/ramonvictor/gulp-protractor-qa/) and if you like, give it a start! :) 
Help me make [gulp-protractor-qa](https://www.npmjs.org/package/gulp-protractor-qa) an awesome tool! 

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
        testSrc : 'test/e2e/**/*Spec.js',
        viewSrc : [ 'index.html', 'partials/*.html' ]
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

##### testSrc

Type: `String` or `Array`
Default: `""`

Where the plugin should watch the changes in order to map all `element()` indexes.

##### viewSrc

Type: `String` or `Array`
Default: `""`

Where your AngularJS view files are located. Protractor QA will watch the changes in those files to verify if all `element()` selectors could be found.

## Changelog

### 0.1.10
- `testSrc` and `viewSrc` now receive `string` or `array` value;

### 0.1.07

- Improved the error log showing in which file each wrong selector came from;
- Improved the regex that find selectors by: `by.css('[attr-name="attr-value"]')`;


### 0.1.05

- Mapping more `element()` selectors: `by.css('[attr-name="attr-value"]')` and `by.binding()`;
- Improve regex rules to support both: `protractor.By` and `by.`;
- Other code improvements;

### 0.1.0
- Mapping just two `element()` selectors: `by.model()` and `by.repeater()`;

## License

MIT © [Ramon Victor](https://github.com/ramonvictor)
