//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Event = require('./event.js');

/**
 * Key constructor
 *
 * @class Key
 * @classdesc An object that handles a single key on a keyboard
 *
 * @param {Number} keycode - The keycode of this specific key
 */
var Key = function(keycode) {

	/**
	 * @property {Number} keyCode - The keycode of this specific key
	 */
	this.keyCode = keycode;

	/**
	 * @property {Boolean} isDown - Boolean to see if the key is down
	 */
	this.isDown = false;

	/**
	 * @property {Boolean} isUp - Boolean to see if the key is up
	 */
	this.isUp = false;

	/**
	 * @property {Number} lastDown - Timestamp of the last key press
	 */
	this.lastDown = 0;

	/**
	 * @property {Number} lastUp - Timestamp of the last key release
	 */
	this.lastUp = 0;

	/**
	 * @property {Number} delay - Delay between two events on keydown
	 */
	this.delay = 50;

	/**
	 * @property {Event} onDown - Event that handles onDown event
	 */
	this.onDown = new Event();

	/**
	 * @property {Event} onUp - Event that handles onUp event
	 */
	this.onUp = new Event();

};

Key.prototype = {

	/**
	 * Function that handles keydown events
	 * @public
	 *
	 * @param {Object} event - The event object
	 */
	processKeyDown: function(event) {


		//If the key is allready down, the user is holding it
		if(this.isDown) {

			//Check if the onDown event should be triggered again
			if(event.timeStamp > this.lastDown + this.delay) {
				this.onDown.trigger(this.keyCode);
				this.lastDown = event.timeStamp;
			}

		}else{

			//Update this keys properties
			this.isDown = true;
			this.isUp = false;
			this.lastDown = event.timeStamp;

			//Trigger the event with this keycode
			this.onDown.trigger(this.keyCode);

		}

	},

	/**
	 * Function that handles keyup events
	 * @public
	 *
	 * @param {Object} event - The event object
	 */
	processKeyUp: function(event) {

		//Update this keys properties
		this.isDown = false;
		this.isUp = true;
		this.lastUp = event.timeStamp;

		//Trigger the event with this keycode
		this.onUp.trigger(this.keyCode);

	}

};

//Export the Browserify module
module.exports = Key;
