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

gulp.task('default', function () {
	gulp.src('tests/*-spec.js')
		.pipe(protractorQA());
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
