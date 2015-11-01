// example-spec.js
describe('ax cart app', function() {

	it('should open the cart summary', function() {
		element.all( by.binding('cart.getNumberOfItems()') ).get(0).click();
		element.all( by.repeater('cartItem in cart.cartItems') ).then(function(rows) {
		    expect( rows.length ).toBe(2);
		});
	});

});