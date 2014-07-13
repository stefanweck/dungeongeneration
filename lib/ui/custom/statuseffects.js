//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Element = require('../element.js');

/**
 * UI Element Status Effects constructor
 *
 * @class TextLogElement
 * @classdesc An object that is able to render every status effect on a certain entity
 * Inherits from Element
 *
 * @param {Vector2} position - The position of this element
 * @param {Object} parent - The parent of this element
 * @param {Entity} target - Reference to the entity object
 */
var StatusEffects = function(position, parent, target) {

	/**
	 * Inherit the constructor from the Element class
	 */
	Element.call(this, position, parent);

	/**
	 * @property {Entity} target - Reference to the entity object
	 */
	this.target = target;

};

StatusEffects.prototype = Object.create(Element.prototype, {

	render: {

		/**
		 * Calls the render function of each of the containers children
		 * @protected
		 *
		 * @param {Object} context - Reference to the current canvas context
		 * @param {Vector2} parentPosition - The position of the previous container that called this render function
		 */
		value: function(context, parentPosition) {

			//Check if the container and it's children even need to be rendered
			if(!this.visible) {
				return;
			}

			//Create a new starting position using the provided position and the position of this container
			var newPosition = parentPosition.combine(this.position);

			//Grab all status effects from the target
			var statusEffects = this.target.getStatusEffects();

			//Loop through each status effect
			for(var i = 0; i < statusEffects.length; i++) {

				//Define the visual style of the text, font, color, etc
				context.font = "14px arial";
				context.fillStyle = "rgba(255, 255, 255, 1)";

				//Draw the text on screen
				context.fillText(
					statusEffects[i].name + ": " + statusEffects[i].turnsLeft,
					newPosition.x,
					newPosition.y + (50 * i)
				);

			}

		}

	}

});

//Export the Browserify module
module.exports = StatusEffects;
