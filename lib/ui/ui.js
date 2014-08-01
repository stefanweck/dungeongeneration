//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var TextLog = require('../ui/textlog.js'),
	QuickslotBar = require('../ui/quickslotbar.js'),
	SpellBar = require('../ui/spellbar.js');

/**
 * UI constructor
 *
 * @class UI
 * @classdesc The UI object holds all UI elements
 * Inherits from PIXI.DisplayObjectContainer
 *
 * @param {Game} game - Reference to the currently running game
 */
var UI = function(game) {

	/**
	 * Inherit the constructor from the PIXI.DisplayObjectContainer object
	 */
	PIXI.DisplayObjectContainer.call(this);

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Stats} stats - Reference to Stats object
	 */
	this.stats = null;

	/**
	 * @property {TextLog} textlog - Reference to TextLog object
	 */
	this.textLog = null;

	/**
	 * @property {QuickslotBar} quickslotBar - Reference to QuickslotBar object
	 */
	this.quickslotBar = null;

	/**
	 * @property {SpellBar} spellbar - Reference to SpellBar object
	 */
	this.spellbar = null;

	//Initialize itself
	this.initialize();

};

//Inherit the prototype from the PIXI.DisplayObjectContainer
UI.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
UI.prototype.constructor = UI;

/**
 * Initialize the UI elements and add them to this container
 * @protected
 */
UI.prototype.initialize = function() {

	//Create the Stats object
	this.initializeStats();

	//Create the Textlog object
	this.initializeTextLog();

	//Initialize the bar's at the bottom of the UI
	this.initializeBars();

	//Add the container object to the stage
	this.game.stage.addChild(this);

};

/**
 * Initialize the UI Stats object and add it to the DOM
 * @protected
 */
UI.prototype.initializeStats = function() {

	//Create a new stats component that handles measuring the FPS and milliseconds it takes to generate 1 frame
	this.stats = new Stats();

	//Set the correct mode for the stats component
	this.stats.setMode(0); // 0: fps, 1: ms

	//Align the element to the top-right
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.right = '10px';
	this.stats.domElement.style.top = '10px';

	//Append the new stats element to the body
	document.body.appendChild(this.stats.domElement);

};

/**
 * Initialize the UI TextLog object and add a message to it
 * @protected
 */
UI.prototype.initializeTextLog = function() {

	//Create and initialize the TextLog
	this.textLog = new TextLog();
	this.textLog.initialize();

	//Add the starting string to the message variable
	var textLogMessage = "You enter the basement and look around";

	//Add the message to the textlog
	this.textLog.addMessage(textLogMessage);

	//Add the TextLog to the UI container
	this.addChild(this.textLog);

};

/**
 * Initialize the UI QuickslotBar and the SpellBar
 * @protected
 */
UI.prototype.initializeBars = function() {

	//Create and initialize the QuickslotBar
	this.quickslotBar = new QuickslotBar(this.game);
	this.quickslotBar.initialize();

	//Add the QuickslotBar to the UI container
	this.addChild(this.quickslotBar);

	//Create and initialize the SpellBar
	this.spellBar = new SpellBar(this.game);
	this.spellBar.initialize();

	//Add the SpellBar to the UI container
	this.addChild(this.spellBar);

};

//Export the Browserify module
module.exports = UI;
