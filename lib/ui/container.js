/**
 * Container constructor
 *
 * @class Roguelike.UI.Container
 * @classdesc An object that holds certain UI elements
 *
 * @param {Roguelike.Vector2} position - The position of this element
 */
Roguelike.UI.Container = function(position) {

	/**
	 * @property {Array} elements - An array that holds all UI elements
	 */
	this.elements = [];

	/**
	 * @property {Boolean} visible - Is this UI element visible or not
	 */
	this.visible = true;

	/**
	 * @property {Roguelike.Vector2} position - The position of this element
	 */
	this.position = position;

};

Roguelike.UI.Container.prototype = {

	/**
	 * Function to add a new element to the UI
	 * @protected
	 *
	 * @param {Roguelike.UI.Element} element - The element that is being added to the UI
	 */
	addElement: function(element) {

		//Add the element to the elements array
		this.elements.push(element);

	},

	/**
	 * Function to remove an element from the UI
	 * @protected
	 *
	 * @param {Roguelike.UI.Element} element - The element that is being removed from the UI
	 *
	 * @return {Boolean} Returns true when the element is removed, returns false when not
	 */
	removeElement: function(element) {

		//Try to find the element in both element arrays
		var index = this.elements.indexOf(element);

		//If the element isn't found, exit as soon as possible
		if(index === -1){
			return false;
		}

		//The element has been found
		this.elements.splice(index, 1);

		//We've made it all the way down here so the element is removed
		return true;

	},

	render: function(context){

		for(var i = 0; i < this.elements.length; i++){

			this.elements[i].render(context);

		}

	}

};
