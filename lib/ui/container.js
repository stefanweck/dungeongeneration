//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Element = require('./element.js');

/**
 * Container constructor
 *
 * @class Container
 * @classdesc An object that holds certain UI elements
 * Inherits from Element
 *
 * @param {Vector2} position - The position of this element
 * @param {Object} parent - The parent of this element
 * @param {Number} width - The width of this element
 * @param {Number} height - The height of this element
 */
var Container = function(position, parent, width, height) {

	/**
	 * Inherit the constructor from the Element class
	 */
	Element.call(this, position, parent, width, height);

	/**
	 * @property {Array} elements - An array that holds all UI elements
	 */
	this.elements = [];

};

Container.prototype = Object.create(Element.prototype, {

	addElement: {

		/**
		 * Function to add a new element to the UI
		 * @protected
		 *
		 * @param {Element || Container} element - The element that is being added to the UI
		 */
		value: function(element) {

			//Add the element to the elements array
			this.elements.push(element);

		}

	},

	removeElement: {

		/**
		 * Function to remove an element from the UI
		 * @protected
		 *
		 * @param {Element} element - The element that is being removed from the UI
		 *
		 * @return {Boolean} Returns true when the element is removed, returns false when not
		 */
		value: function(element) {

			//Try to find the element in both element arrays
			var index = this.elements.indexOf(element);

			//If the element isn't found, exit as soon as possible
			if(index === -1) {
				return false;
			}

			//The element has been found
			this.elements.splice(index, 1);

			//We've made it all the way down here so the element is removed
			return true;

		}

	},

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
			if(!this.visible || this.alpha === 0) {

				return;

			}

			//Create a new starting position using the provided position and the position of this container
			var newPosition = parentPosition.combine(this.position);

			//Loop through each element in this container
			for(var i = 0; i < this.elements.length; i++) {

				//Call the render function of the current element
				this.elements[i].render(context, newPosition);

			}

		}

	}

});

//Export the Browserify module
module.exports = Container;
