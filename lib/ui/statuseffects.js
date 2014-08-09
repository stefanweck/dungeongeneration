//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Vector2 = require('../geometry/vector2.js');

/**
 * StatusEffects constructor
 *
 * @class StatusEffects
 * @classdesc The TextLog holds and stores all messages that entities send to it
 * Inherits from PIXI.DisplayObjectContainer
 */
var StatusEffects = function() {

	/**
	 * Inherit the constructor from the PIXI.DisplayObjectContainer object
	 */
	PIXI.DisplayObjectContainer.call(this);

	/**
	 * @property {Number} maxEffects - The max amount of effects displayed
	 */
	this.maxEffects = 5;

	/**
	 * @property {Entity} target - The entity object that should be checked
	 */
	this.target = null;

};

//Inherit the prototype from the PIXI.DisplayObjectContainer
StatusEffects.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
StatusEffects.prototype.constructor = StatusEffects;

/**
 * Initialize the status effects UI element and create the PIXI objects for later use
 * @protected
 */
StatusEffects.prototype.initialize = function() {

	//Calculate the base position of the status effect container
	var basePosition = new Vector2(15, 200);

	//Create all objects for the status effects
	for(var i = 0; i < this.maxEffects; i++) {

		//Create a new container that will hold the sprite and the text of turns left
		var effectContainer = new PIXI.DisplayObjectContainer();

		//Create the texture from a frame
		var texture = PIXI.Texture.fromFrame("status_empty.png");

		//Calculate the new position of the status effect
		var statusEffectPosition = new Vector2(0, i * (texture.height + 5));
		var newPosition = statusEffectPosition.combine(basePosition);

		//Create a new Sprite using the texture
		var statusEffect = new PIXI.Sprite(texture);

		//Set the new position to the status effect
		statusEffect.position.x = newPosition.x;
		statusEffect.position.y = newPosition.y;

		//Add the status effect object to it's container
		effectContainer.addChild(statusEffect);

		//Create a new empty PIXI.Text object and style it
		var textObject = new PIXI.Text(
			"0",
			{
				font: "bold 12px Courier New",
				fill: "#ffffff",
				align: "left"
			}
		);

		//Calculate the new text position
		var textPosition = newPosition.combine(new Vector2(texture.width - 15, texture.height - 20));

		//Set the correct position for this text object
		textObject.position.x = textPosition.x;
		textObject.position.y = textPosition.y;

		//Add the text object to it's container
		effectContainer.addChild(textObject);

		//Set the status effect to invisible, it only needs to be visible when used
		effectContainer.visible = false;

		//Add the status effect container object to the container
		this.addChild(effectContainer);

	}

};

/**
 * Update the status effect UI element, change the sprites and visibility according to the status effects on the target
 * @protected
 */
StatusEffects.prototype.update = function() {

	//Loop as many times as there can be effects displayed on the UI
	for(var i = 0; i < this.maxEffects; i++){

		//Get the corresponding status effect container
		var effectContainer = this.getChildAt(i);

		//If the status effect doesn't exist, hide the UI element of it
		if(typeof this.target.statusEffects[i] === "undefined"){

			//Make the container invisible
			effectContainer.visible = false;

			//Don't continue because the status effect is invisible
			return;

		}

		//Get the status effect and text object from the status effect container
		var statusEffect = effectContainer.getChildAt(0);
		var textObject = effectContainer.getChildAt(1);

		//Get the new texture and set it to the status effect object
		var texture = PIXI.Texture.fromFrame("status_"+this.target.statusEffects[i].name+".png");
		statusEffect.setTexture(texture);

		//Change the text in the text object to the new turns left number
		textObject.setText(this.target.statusEffects[i].turnsLeft);

		//Make the container visible again
		effectContainer.visible = true;

	}

};

/**
 * Set a target for the status effect UI element
 * @protected
 */
StatusEffects.prototype.setTarget = function(target) {

	this.target = target;

};

//Export the Browserify module
module.exports = StatusEffects;
