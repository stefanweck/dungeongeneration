/**
 * Image Element constructor
 *
 * @class Roguelike.UI.Element.Image
 * @classdesc An UI image element
 * Inherits from Roguelike.UI.Element
 *
 * @param {Roguelike.Vector2} position - The position of the previous container that called this render function
 * @param {String} image - The source of the image that is being used
 * @param {Number} scale - (optional) The scale of the image, defaults to 1
 */
Roguelike.UI.Element.Image = function(position, image, scale) {

	/**
	 * Inherit the constructor from the Element class
	 */
	Roguelike.UI.Element.call(this, position);

	/**
	 * @property {String} image - The source of the image that is being used
	 */
	this.image = image;

	/**
	 * @property {Number} scale - The scale of the image, defaults to 1
	 */
	this.scale = scale || 1;

};

Roguelike.UI.Element.Image.prototype = Object.create(Roguelike.UI.Element.prototype, {

	render: {

		/**
		 * Returns a function that handles rendering the current Element
		 * @protected
		 *
		 * @param {Object} context - Reference to the current canvas context
		 * @param {Roguelike.Vector2} parentPosition - The position of the previous container that called this render function
		 */
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
				image.width * this.scale,
				image.height * this.scale
			);

		}

	}

});
