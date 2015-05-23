//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Vector2 = require('../geometry/vector2.js');

/**
 * SpellBar constructor
 *
 * @class SpellBar
 * @classdesc The Spell Bar holds all spells and manages the rendering of this UI element
 * Inherits from PIXI.Container
 *
 * @param {Game} game - Reference to the currently running game
 */
var SpellBar = function(game) {

	/**
	 * Inherit the constructor from the PIXI.Container object
	 */
	PIXI.Container.call(this);

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Number} maxSpellslots - The maximum amount of spell slots displayed in this bar
	 */
	this.maxSpellslots = 9;

};

//Inherit the prototype from the PIXI.Container
SpellBar.prototype = Object.create(PIXI.Container.prototype);
SpellBar.prototype.constructor = SpellBar;

/**
 * Initialize the QuickslotBar and create PIXI objects for later use
 * @public
 */
SpellBar.prototype.initialize = function() {

	//Calculate the base position of the quickslot container
	var basePosition = new Vector2((this.game.sizeManager.width / 2) + 21, this.game.sizeManager.height - 57);

	//Create all text objects for the textlog
	for(var i = 0; i < this.maxSpellslots; i++) {

		//Calculate the new position of the quickslot
		var quickslotPosition = new Vector2(i * 44, 0);
		var newPosition = quickslotPosition.combine(basePosition);

		//Create the texture from an image path
		var texture = PIXI.Texture.fromFrame("itemslot.png");

		//Create a new Sprite using the texture
		var quickslot = new PIXI.Sprite(texture);

		//Set the new position to the quickslot
		quickslot.position.x = newPosition.x;
		quickslot.position.y = newPosition.y;

		//Scale the image up 3 times
		quickslot.scale = new PIXI.Point(3, 3);

		//Add the Quickslot object to the container
		this.addChild(quickslot);

		//Create a new empty PIXI.Text object and style it
		var textObject = new PIXI.Text("" + (i + 1), { font: "10px Courier New", fill: "#606060", align: "left"});

		//Calculate the new text position
		var textPosition = newPosition.combine(new Vector2(30, 30));

		//Set the correct position for this text object
		textObject.position.x = textPosition.x;
		textObject.position.y = textPosition.y;

		//Add the new PIXI.Text object
		this.addChild(textObject);

	}

};

//Export the Browserify module
module.exports = SpellBar;
