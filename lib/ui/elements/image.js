/**
 * Image Element constructor
 *
 * @class Roguelike.UI.Element.Image
 * @classdesc An UI image element
 * Inherits from Roguelike.UI.Element
 */
Roguelike.UI.Element.Image = function(position, image) {

	/**
	 * Inherit the constructor from the Element class
	 */
	Roguelike.UI.Element.call(this, position);

	/**
	 * @property {String} image - The source of the image that is being used
	 */
	this.image = image;

};

Roguelike.UI.Element.Image.prototype = Object.create(Roguelike.UI.Element.prototype, {

	/**
	 * Returns a function that handles rendering the current Element
	 * @protected
	 */
	render: {

		value: function(context, parentPosition) {

			//Create a new starting position using the provided position and the position of this element
			var newPosition = parentPosition.combine(this.position);

			//TODO: Use a preloader and only get the file once, not every frame
			//Get the image
			var image = document.getElementById(this.image);

			//Draw the image on the canvas context
			context.drawImage(
				image,
				newPosition.x,
				newPosition.y,
				304,
				64
			);

		}

	}

});
