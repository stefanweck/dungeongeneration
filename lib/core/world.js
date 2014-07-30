//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Camera = require('./camera.js'),
	Vector2 = require('../geometry/vector2.js');

/**
 * World constructor
 *
 * @class World
 * @classdesc The World object holds all objects that are in the game world, entities, the map etc.
 * They all move according to the camera
 * Inherits from PIXI.DisplayObjectContainer
 *
 * @param {Game} game - Reference to the currently running game
 */
var World = function(game) {

	/**
	 * Inherit the constructor from the PIXI.DisplayObjectContainer object
	 */
	PIXI.DisplayObjectContainer.call(this);

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Camera} camera - Reference to the camera
	 */
	this.camera = null;

	//Initialize itself
	this.initialize();

};

//Inherit the prototype from the PIXI.DisplayObjectContainer
World.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
World.prototype.constructor = World;

/**
 * Initialize the UI elements and add them to this container
 * @protected
 */
World.prototype.initialize = function(){

	//Create the camera object
	this.camera = new Camera(this.game, new Vector2(0,0));

	//Scale the entire world
	this.scale = new PIXI.Point(this.game.settings.zoom,this.game.settings.zoom);

	//Add the container object to the stage
	this.game.stage.addChild(this);

};

//Export the Browserify module
module.exports = World;
