//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * TextLog constructor
 *
 * @class TextLog
 * @classdesc The TextLog holds and stores all messages that entities send to it
 *
 * @param {Game} game - Reference to the currently running game
 */
var TextLog = function(game) {

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Number} fontSize - The size of the text
	 */
	this.color = "rgba(255, 255, 255, 1)";

	/**
	 * @property {Number} fontSize - The size of the text
	 */
	this.fontSize = 12;

	/**
	 * @property {String} font - The font that the text is being rendered in
	 */
	this.font = "Courier New";

	/**
	 * @property {PIXI.DisplayObjectContainer} container - The PIXI container that will hold all text elements
	 */
	this.container = null;

	/**
	 * @property {Number} maxMessages - The max amount of messages displayed in the text log
	 */
	this.maxMessages = 5;

	/**
	 * @property {Array} messages - An array filled with all text log messages
	 */
	this.messages = [];

};

TextLog.prototype = {

	/**
	 * Initialize the textlog and create the PIXI.Text objects for later use
	 * @protected
	 */
	initialize: function(){

		//Create the container object that will hold all text objects
		this.container = new PIXI.DisplayObjectContainer();

		//Create all text objects for the textlog
		for(var i = 0; i < this.maxMessages; i++) {

			//Create a new empty PIXI.Text object and style it
			var textObject = new PIXI.Text("", { font: this.fontSize + "px " + this.font, fill: this.color, align: "left"});

			//Set the correct position for this text object
			textObject.position.x = 15;
			textObject.position.y = 15 + (25 * i);

			//Add the new PIXI.Text object
			this.container.addChild(textObject);

		}

		//Add the container object to the stage
		this.game.stage.addChild(this.container);

	},

	/**
	 * Calls the render function of each of the containers children
	 * @protected
	 */
	updateText: function() {

		//Grab all messages from the text log
		var messages = this.getMessages();

		//Loop through each element in this container
		for(var i = 0; i < this.maxMessages; i++) {

			//If there isn't another message in the text log, stop here
			if(!messages[messages.length - 1 - i]) {
				break;
			}

			//Set the text from the textlog in the PIXI.js objects
			this.container.children[i].setText(messages[messages.length - 1 - i]);

		}

	},

	/**
	 * Function to add a new message to the text log
	 * @protected
	 *
	 * @param {String} message - The message that has to be stored
	 */
	add: function(message) {

		//Add the new message
		this.messages.push(message);

		//Update the text in each of the PIXI.Text objects that get rendered on screen
		this.updateText();

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

	},

	/**
	 * Clear all messages stored in the textlog
	 * @protected
	 */
	clear: function(){

		//Clear the messages array
		this.messages = [];

		//Loop through each element in the container
		for(var i = 0; i < this.maxMessages; i++) {

			//Set the text to an empty string
			this.container.children[i].setText("");

		}

	}

};

//Export the Browserify module
module.exports = TextLog;
