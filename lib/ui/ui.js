/**
 * UI constructor
 *
 * @class Roguelike.UI
 * @classdesc The object that holds all UI elements, visible or not
 *
 * @param {Roguelike.Game} game - Reference to the current game object
 */
Roguelike.UI = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Array} visibleElements - An array that holds all visible UI elements
	 */
	this.visibleElements = [];

	/**
	 * @property {Array} invisible - An array that holds all invisible UI elements
	 */
	this.invisibleElements = [];

};

Roguelike.UI.prototype = {

	/**
	 * Initialize the UI, add all basic elements
	 * @protected
	 */
	initialize: function() {



	},

	/**
	 * Function to add a new element to the UI
	 * @protected
	 *
	 * @param {Roguelike.UI.Element} element - The element that is being added to the UI
	 * @param {Boolean} visible - True if visible, false it not
	 */
	addElement: function(element, visible) {

		//Check if the element should by visible or not
		if(visible){

			//Add the element to the visibleElements array
			this.visibleElements.push(element);

		}else{

			//Add the element to the visibleElements array
			this.invisibleElements.push(element);

		}

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
		var indexOfVisible = this.visibleElements.indexOf(element);
		var indexOfInvisible = this.invisibleElements.indexOf(element);

		//If the element isn't found, exit as soon as possible
		if(indexOfVisible === -1 && indexOfInvisible === -1){
			return false;
		}

		//Check if the element is in the visibleElements array
		if(indexOfVisible !== -1){

			//The element has been found
			this.visibleElements.splice(indexOfVisible, 1);

		}else if(indexOfInvisible !== -1){

			//The element has been found
			this.invisibleElements.splice(indexOfInvisible, 1);

		}

		//We've made it all the way down here so the element is removed
		return true;

	},

	/**
	 * Function to show an element on the UI
	 * @protected
	 *
	 * @param {Roguelike.UI.Element} element - The element that is being shows on the UI
	 *
	 * @return {Boolean} Returns true when the element is shown, returns false when not
	 */
	showElement: function(element) {

		//Try to find the element in the invisibleElements array
		var index = this.invisibleElements.indexOf(element);

		//If the element isn't found, we exit as soon as possible
		if(index === -1){
			return false;
		}

		//The element has been found, so we remove it!
		this.invisibleElements.splice(index, 1);

		//Add the element to the visibleElements array
		this.visibleElements.push(element);

		//Everything succeeded
		return true;

	},

	/**
	 * Function to hide an element on the UI
	 * @protected
	 *
	 * @param {Roguelike.UI.Element} element - The element that is being hidden on the UI
	 */
	hideElement: function(element) {

		//Try to find the element in the invisibleElements array
		var index = this.visibleElements.indexOf(element);

		//If the element isn't found, we exit as soon as possible
		if(index === -1){
			return false;
		}

		//The element has been found, so we remove it!
		this.visibleElements.splice(index, 1);

		//Add the element to the visibleElements array
		this.invisibleElements.push(element);

		//Everything succeeded
		return true;

	}

};
