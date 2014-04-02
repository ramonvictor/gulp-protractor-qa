# [gulp](http://gulpjs.com)-protractor-advisor

> A gulp plugin to help avoiding broken Protractor tests due to not found element() selectos.


## Install

```
npm install --save-dev gulp-protractor-advisor
```


## Example

```js
var gulp = require('gulp');
var protractorAdvisor = require('gulp-protractor-advisor');

gulp.task('default', function () {
	gulp.src('tests/*-spec.js')
		.pipe(protractorAdvisor());
});
```


## API

### protractorAdvisor(options)

#### options

##### foo

Type: `Boolean`  
Default: `false`

Lorem ipsum.


## License

MIT © [Ramon Victor](https://github.com/ramonvictor)
