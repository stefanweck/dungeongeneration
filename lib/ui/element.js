//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Element constructor
 *
 * @class Element
 * @classdesc A single UI element
 *
 * @param {Vector2} position - The position of this element
 * @param {Object} parent - The parent of this element
 * @param {Number} width - The width of this element
 * @param {Number} height - The height of this element
 */
var Element = function(position, parent, width, height) {

	/**
	 * @property {Vector2} position - The position of this element
	 */
	this.position = position;

	/**
	 * @property {Number} width - The width of this element
	 */
	this.width = width || 300;

	/**
	 * @property {Number} height - The height of this element
	 */
	this.height = height || 300;

	/**
	 * @property {Boolean} visible - Is this UI element visible or not
	 */
	this.visible = true;

	/**
	 * @property {Object} parent - The parent of this element
	 */
	this.parent = parent;

	/**
	 * @property {Number} alpha - The opacity of the element
	 */
	this.alpha = 1;

	/**
	 * @property {Number} scale - The scale factor of the element
	 */
	this.scale = 1;

	/**
	 * @property {Boolean} hover - Is the user currently hovering this element
	 */
	this.hover = false;

};

Element.prototype = {

	/**
	 * Toggle the visibility of this UI element
	 * @protected
	 */
	toggleVisibility: function() {

		//Invert the visibility of the UI element
		this.visible = !this.visible;

	},

	/**
	 * Return the position based on the parent's position
	 * @protected
	 */
	getPosition: function(){

		if(this.parent === null){

			return this.position;

		}else{

			var parentPosition = this.parent.getPosition();

			return parentPosition.combine(this.position);

		}

	},

	/**
	 * Function that is here to be overwritten
	 * @protected
	 */
	onHover: function(){
		//Overwrite
	},

	/**
	 * Function that is here to be overwritten
	 * @protected
	 */
	onClick: function(){
		//Overwrite
	}

};

//Export the Browserify module
module.exports = Element;
