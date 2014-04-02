# [gulp](http://gulpjs.com)-protractor-qa

> A gulp plugin to help avoiding broken Protractor tests due to not found element() selectos.


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

##### foo

Type: `Boolean`  
Default: `false`

Lorem ipsum.


## License

MIT © [Ramon Victor](https://github.com/ramonvictor)
