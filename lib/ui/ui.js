//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var TextLog = require('../ui/textlog.js'),
	QuickslotBar = require('../ui/quickslotbar.js'),
	SpellBar = require('../ui/spellbar.js'),
	TooltipElement = require('../ui/tooltipelement.js'),
	StatusEffects = require('../ui/statuseffects.js'),
	Vector2 = require('../geometry/vector2.js');

/**
 * UI constructor
 *
 * @class UI
 * @classdesc The UI object holds all UI elements
 * Inherits from PIXI.Container
 *
 * @param {Game} game - Reference to the currently running game
 */
var UI = function(game) {

	/**
	 * Inherit the constructor from the PIXI.Container object
	 */
	PIXI.Container.call(this);

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

	/**
	 * @property {StatusEffects} statusEffects - Reference to StatusEffects object
	 */
	this.statusEffects = null;

	/**
	 * @property {PIXI.Sprite} mousePointer - Reference to the mouse pointer object
	 */
	this.mousePointer = null;

	/**
	 * @property {PIXI.Container} tooltip - Reference to the tooltip object
	 */
	this.tooltip = null;

	//Initialize itself
	this.initialize();

};

//Inherit the prototype from the PIXI.Container
UI.prototype = Object.create(PIXI.Container.prototype);
UI.prototype.constructor = UI;

/**
 * Initialize the UI elements and add them to this container
 * @private
 */
UI.prototype.initialize = function() {

	//Create the Stats object
	this.initializeStats();

	//Create the Textlog object
	this.initializeTextLog();

	//Initialize the bar's at the bottom of the UI
	this.initializeBars();

	//Initialize the status effects
	this.initializeStatusEffects();

	//Initialize the mouse pointer
	this.initializeMousePointer();

	//Initialize the tooltip
	this.initializeTooltip();

	//Attach a mouse move event to the stage
    this.game.stage.interactive = true;
	this.game.stage.mousemove = this.mouseMove.bind(this);

	//Add the container object to the stage
	this.game.stage.addChild(this);

};

/**
 * Initialize the UI Stats object and add it to the DOM
 * @private
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
 * @private
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
 * @private
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

/**
 * Initialize the UI Status Effects
 * @private
 */
UI.prototype.initializeStatusEffects = function() {

	//Create and initialize the QuickslotBar
	this.statusEffects = new StatusEffects(this.game);
	this.statusEffects.initialize();

	this.statusEffects.setTarget(this.game.player);

	//Add the QuickslotBar to the UI container
	this.addChild(this.statusEffects);

};

/**
 * Initialize the UI Mouse Pointer
 * @private
 */
UI.prototype.initializeMousePointer = function() {

	this.mousePointer = PIXI.Sprite.fromFrame("mousepointer.png");
	this.mousePointer.scale = new PIXI.Point(this.game.settings.zoom, this.game.settings.zoom);

	//Add the SpellBar to the UI container
	this.addChild(this.mousePointer);

};

/**
 * Initialize the UI Tooltip
 * @private
 */
UI.prototype.initializeTooltip = function() {

	//Create a new Tooltip object and initialize it
	this.tooltip = new TooltipElement();
	this.tooltip.initialize();

	//Add the Tooltip to the UI container
	this.addChild(this.tooltip);

};

/**
 * The function that is called everytime the mouse moves
 * @private
 */
//TODO: Clean up this function and split it up
//TODO: Make sure this function also is called when the user moves, this way the tooltip won't weirdly float around on a wrong location
UI.prototype.mouseMove = function(mousedata) {

	//Define variables
	var map = this.game.map;
	var camera = this.game.world.camera;
	var tilesize = (map.settings.tileSize * this.game.settings.zoom);

	//Calculate the offset of the camera, how many pixels are left at the left and top of the screen
	var cameraXOffset = camera.position.x % tilesize;
	var cameraYOffset = camera.position.y % tilesize;

	//Calculate at which tile the mouse is currently pointing relative to the camera
	var tileXRel = Math.floor((mousedata.data.global.x + cameraXOffset) / tilesize);
	var tileYRel = Math.floor((mousedata.data.global.y + cameraYOffset) / tilesize);

	//Calculate at which tile the mouse is currently pointing absolute to the camera
	var tileXAbs = Math.floor((mousedata.data.global.x + camera.position.x) / tilesize);
	var tileYAbs = Math.floor((mousedata.data.global.y + camera.position.y) / tilesize);

	//Create a new Vector2 object of the tile's position
	var tilePosition = new Vector2(tileXAbs, tileYAbs);

	//If the tile that the mouse is pointing at is not within the map, quit here
	if(!map.insideBounds(tilePosition)) {
		this.tooltip.visible = this.mousePointer.visible = false;
		return;
	}

	//Get the tile at the mouse position
	var tile = map.getTileAt(tilePosition);

	//If the tile isn't a floor tile, you can't walk there so why bother showing the mouse pointer
	//Also don't show the mouse pointer if you haven't explored the tile yet
	if(tile.type !== 2 || !tile.explored) {
		this.tooltip.visible = this.mousePointer.visible = false;
		return;
	}

	//The mouse pointer should be visible at this point and should have the right position
	this.mousePointer.visible = true;
	this.mousePointer.position = new PIXI.Point(tileXRel * tilesize - cameraXOffset, tileYRel * tilesize - cameraYOffset);

	//Check if there are entities at the tile
	if(tile.entities.length === 0) {
		this.tooltip.visible = false;
		return;
	}

	//Get the last entity
	var lastEntity = tile.entities[tile.entities.length - 1];

	//Check if the entity even has the tooltip component, if not the tooltip should not be visible
	if(lastEntity.hasComponent("tooltip")) {

		//Get the component
		var tooltipComponent = lastEntity.getComponent("tooltip");

		//Update the text from the Tooltip Element
		this.tooltip.updateText(tooltipComponent.title, tooltipComponent.type, tooltipComponent.description);

		//Change the position to the mouse position
		this.tooltip.position = new PIXI.Point(mousedata.data.global.x, mousedata.data.global.y);

		//Make the tooltip visible again!
		this.tooltip.visible = true;

	}else{

		this.tooltip.visible = false;

	}

};

//Export the Browserify module
module.exports = UI;
