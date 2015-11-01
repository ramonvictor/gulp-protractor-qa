// example-spec.js
describe('ax cart app', function() {

	var id = by.className('btn-primary');
	var refresh = by.className('[href="/"]');
	var repeater = by.repeater('product in productVM.products | axFilter:categoryFilter:textFilter | orderBy: predicate:reverse');

	it('should go back to home', function() {
		element.all( by.css('[href="/"]') ).get(0).click();
		expect( element( repeater ).isPresent() ).toBeTruthy();
	});

});