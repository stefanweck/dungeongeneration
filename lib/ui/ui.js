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
	 * @param {Roguelike.UI.Element} UIElement - The element that is being added to the UI
	 */
	addElement: function(UIElement) {



	},

	/**
	 * Function to remove an element from the UI
	 * @protected
	 *
	 * @param {Roguelike.UI.Element} UIElement - The element that is being removed from the UI
	 */
	removeElement: function(UIElement) {



	},

	/**
	 * Function to show an element on the UI
	 * @protected
	 *
	 * @param {Roguelike.UI.Element} UIElement - The element that is being shows on the UI
	 */
	showElement: function(UIElement) {



	},

	/**
	 * Function to hide an element on the UI
	 * @protected
	 *
	 * @param {Roguelike.UI.Element} UIElement - The element that is being hidden on the UI
	 */
	hideElement: function(UIElement) {



	}

};
