//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Vector2 = require('../geometry/vector2.js');

/**
 * SpellBar constructor
 *
 * @class SpellBar
 * @classdesc The Spell Bar holds all spells and manages the rendering of this UI element
 * Inherits from PIXI.DisplayObjectContainer
 *
 * @param {Game} game - Reference to the currently running game
 */
var SpellBar = function(game) {

	/**
	 * Inherit the constructor from the PIXI.DisplayObjectContainer object
	 */
	PIXI.DisplayObjectContainer.call(this);

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Number} maxSpellslots - The maximum amount of spell slots displayed in this bar
	 */
	this.maxSpellslots = 9;

};

//Inherit the prototype from the PIXI.DisplayObjectContainer
SpellBar.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
SpellBar.prototype.constructor = SpellBar;

/**
 * Initialize the QuickslotBar and create PIXI objects for later use
 * @protected
 */
SpellBar.prototype.initialize = function(){

	//Calculate the base position of the quickslot container
	//TODO: Store the canvas width and height in the game object and use it here
	var basePosition = new Vector2((window.innerWidth / 2) + 21, window.innerHeight / 2 - 57);

	//Create all text objects for the textlog
	for(var i = 0; i < this.maxSpellslots; i++) {

		//Calculate the new position of the quickslot
		var quickslotPosition = new Vector2(i * 44, 0);
		var newPosition = quickslotPosition.combine(basePosition);

		//Create the texture from an image path
		var texture = PIXI.Texture.fromImage("assets/tilesets/itemslot.png");

		//Create a new Sprite using the texture
		var quickslot = new PIXI.Sprite(texture);

		//Set the new position to the quickslot
		quickslot.position.x = newPosition.x;
		quickslot.position.y = newPosition.y;

		//Scale the image up 3 times
		quickslot.scale = new PIXI.Point(3,3);

		//Add the Quickslot object to the container
		this.addChild(quickslot);

		//Create a new empty PIXI.Text object and style it
		var textObject = new PIXI.Text(""+(i + 1), { font: "10px Courier New", fill: "#606060", align: "left"});

		//Calculate the new text position
		var textPosition = newPosition.combine(new Vector2(30, 30));

		//Set the correct position for this text object
		textObject.position.x = textPosition.x;
		textObject.position.y = textPosition.y;

		//Add the new PIXI.Text object
		this.addChild(textObject);

	}

	//Add the container object to the stage
	this.game.stage.addChild(this);

};

//Export the Browserify module
module.exports = SpellBar;
