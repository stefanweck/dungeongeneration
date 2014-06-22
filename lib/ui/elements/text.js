//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Text Element constructor
 *
 * @class Text
 * @classdesc An UI text element
 * Inherits from Element
 *
 * @param {Vector2} position - The position of the previous container that called this render function
 * @param {String} text - The text that is being displayed
 * @param {String} color - (optional) The color of the text. In RGBA format: rgba(255, 255, 255, 1)
 * @param {Number} fontSize - (optional) The size of the text
 * @param {String} font - (optional) The font that the text is being rendered in
 */
var Text = function(position, text, color, fontSize, font) {

	/**
	 * Inherit the constructor from the Element class
	 */
	Element.call(this, position);

	/**
	 * @property {String} text - The text that is being displayed
	 */
	this.text = text;

	/**
	 * @property {Number} fontSize - The size of the text
	 */
	this.color = color || "rgba(255, 255, 255, 1)";

	/**
	 * @property {Number} fontSize - The size of the text
	 */
	this.fontSize = fontSize || 12;

	/**
	 * @property {String} font - The font that the text is being rendered in
	 */
	this.font = font || "Courier New";

};

Text.prototype = Object.create(Element.prototype, {

	render: {

		/**
		 * Returns a function that handles rendering the current Element
		 * @protected
		 *
		 * @param {Object} context - Reference to the current canvas context
		 * @param {Vector2} parentPosition - The position of the previous container that called this render function
		 */
		value: function(context, parentPosition) {

			//Create a new starting position using the provided position and the position of this element
			var newPosition = parentPosition.combine(this.position);

			//Determine what the lineHeight is
			var lineHeight = this.fontSize;

			//Define the visual style of the text, font, color, etc
			context.font = this.fontSize + "px " + this.font;
			context.fillStyle = this.color;

			//Draw the text on screen
			context.fillText(
				this.text,
				newPosition.x,
				newPosition.y + lineHeight
			);

		}

	}

});

//Export the Browserify module
module.exports = Text;

