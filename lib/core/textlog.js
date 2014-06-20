/**
 * TextLog constructor
 *
 * @class Roguelike.TextLog
 * @classdesc The TextLog holds and stores all messages that entities send to it
 */
Roguelike.TextLog = function() {

	/**
	 * @property {Array} messages - An array filled with all text log messages
	 */
	this.messages = [];

};

Roguelike.TextLog.prototype = {

	/**
	 * Function to add a new message to the text log
	 * @protected
	 *
	 * @param {String} message - The message that has to be stored
	 */
	addMessage: function(message) {

		//Add the new message
		this.messages.push(message);

	},

	/**
	 * Function that returns all messages
	 * @protected
	 *
	 * @return {Array} The array with all messages
	 */
	getMessages: function() {

		//Return all messages
		return this.messages;

	}

};
