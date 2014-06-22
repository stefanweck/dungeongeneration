//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Element constructor
 *
 * @class Element
 * @classdesc A single UI element
 *
 * @param {Vector2} position - The position of this element
 */
var Element = function(position) {

	/**
	 * @property {Vector2} position - The position of this element
	 */
	this.position = position;

	/**
	 * @property {Boolean} visible - Is this UI element visible or not
	 */
	this.visible = true;

	/**
	 * @property {Number} alpha - The opacity of the element
	 */
	this.alpha = 1;

	/**
	 * @property {Number} scale - The scale factor of the element
	 */
	this.scale = 1;

};

Element.prototype = {

	/**
	 * Toggle the visibility of this UI element
	 * @protected
	 */
	toggleVisibility: function() {

		//Invert the visibility of the UI element
		this.visible = !this.visible;

	}

};

//Export the Browserify module
module.exports = Element;
