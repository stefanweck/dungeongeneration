/**
 * Keyboard constructor
 *
 * @class Roguelike.Keyboard
 * @classdesc An object that handles a single key on a keyboard
 *
 * @property {Roguelike.Game} game - Reference to the current game object
 */
Roguelike.Keyboard = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {object} keys - Object that holds all keys
	 */
	this.keys = {};

};

Roguelike.Keyboard.prototype = {

	/**
	 * Function to initialize the keyboard and therefore user input
	 * @protected
	 */
	initialize: function() {

		//Set the scope of this to _this
		var _this = this;

		//The onKeyDown event of the document is the following function:
		this._onKeyDown = function(event) {
			return _this.processKeyDown(event);
		};

		//The onKeyUp event of the document is the following function:
		this._onKeyUp = function(event) {
			return _this.processKeyUp(event);
		};

		//Add the event listeners to the window
		window.addEventListener('keydown', this._onKeyDown, false);
		window.addEventListener('keyup', this._onKeyUp, false);

	},

	/**
	 * Function to get a specific key from the keyboard
	 * and add it if it does't exist yet
	 * @protected
	 *
	 * @param {number} keycode - The keycode of the key being added
	 */
	getKey: function(keycode) {

		//Check if the key allready exists
		if(this.keys[keycode] === undefined) {

			//Add a brand new key to the keyboards key list
			this.keys[keycode] = new Roguelike.Key(keycode);

		}

		//Return the key so we can use it in other functions
		return this.keys[keycode];

	},

	/**
	 * Function that handles keydown events
	 * @protected
	 *
	 * @param {object} event - The event object
	 */
	processKeyDown: function(event) {

		//Only continue if the key being pressed is assigned to the keyboard
		if(this.keys[event.keyCode] !== undefined) {

			//Prevent the default action of the key
			event.preventDefault();

			//Call the callback's defined on this key
			this.keys[event.keyCode].processKeyDown(event);

		}

	},

	/**
	 * Function that handles keydown events
	 * @protected
	 *
	 * @param {object} event - The event object
	 */
	processKeyUp: function(event) {

		//Only continue if the key being pressed is assigned to the keyboard
		if(this.keys[event.keyCode] !== undefined) {

			//Call the callback's defined on this key
			this.keys[event.keyCode].processKeyUp(event);

		}

	}

};
