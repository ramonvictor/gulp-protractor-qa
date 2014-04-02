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

##### watchViewSrc

Type: `String`  
Default: `""`

Inform the view root folder. Where your angular html templates are located.
i.e: `watchViewSrc : "view/*.html"`


## License

MIT © [Ramon Victor](https://github.com/ramonvictor)
