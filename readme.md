# [gulp](http://gulpjs.com)-protractor-qa

> A gulp plugin to help you avoiding broken Protractor tests due to not found element() selectos.


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
        viewSrc : 'partials/*.html'
    });
});
```

Running it
```js
gulp.task('default', function() {   
    gulp.run('protractor-qa');
});
```


## API

### protractorQA(options)

#### options

##### testSrc

Type: `String`  
Default: `""`

Where the plugin should watch the changes in order to map all the element() index.

##### viewSrc

Type: `String`  
Default: `""`

Where your AngularJS view files are located. Protractor QA will watch the changes in those files to verify if all the element() selectors can be find.


## License

MIT © [Ramon Victor](https://github.com/ramonvictor)
