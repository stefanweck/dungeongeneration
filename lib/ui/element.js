/**
 * Element constructor
 *
 * @class Roguelike.UI.Element
 * @classdesc A single UI element
 *
 * @param {Roguelike.Vector2} position - The position of this element
 */
Roguelike.UI.Element = function(position) {

	/**
	 * @property {Boolean} visible - Is this UI element visible or not
	 */
	this.visible = true;

	/**
	 * @property {Roguelike.Vector2} position - The position of this element
	 */
	this.position = position;

};

Roguelike.UI.Element.prototype = {

	/**
	 * Toggle the visibility of this UI element
	 * @protected
	 */
	toggleVisibility: function() {

		//Invert the visibility of the UI element
		this.visible = !this.visible;

	}

};
