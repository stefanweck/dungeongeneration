//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Tooltip Element constructor
 *
 * @class TooltipElement
 * @classdesc The Tooltip Element holds and stores all messages that entities send to it
 * Inherits from PIXI.DisplayObjectContainer
 */
var TooltipElement = function() {

	/**
	 * Inherit the constructor from the PIXI.DisplayObjectContainer object
	 */
	PIXI.DisplayObjectContainer.call(this);

	/**
	 * @property {PIXI.Graphics} background - The title of the tooltip
	 */
	this.background = null;

	/**
	 * @property {PIXI.Text} title - The title of the tooltip
	 */
	this.title = null;

	/**
	 * @property {PIXI.Text} type - The type of entity
	 */
	this.type = null;

	/**
	 * @property {PIXI.Text} description - The description of this entity
	 */
	this.description = null;
};

//Inherit the prototype from the PIXI.DisplayObjectContainer
TooltipElement.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
TooltipElement.prototype.constructor = TooltipElement;

/**
 * Initialize the textlog and create the PIXI.Text objects for later use
 * @protected
 */
TooltipElement.prototype.initialize = function() {

	this.background = new PIXI.Graphics();

	this.addChild(this.background);

	//Create all objects for the tooltip
	this.title = new PIXI.Text(
		"",
		{
			font: "bold 12px Courier New",
			fill: "#ffffff",
			wordWrap: true,
			wordWrapWidth: 150
		}
	);

	this.title.position.x = 15;

	this.addChild(this.title);

	//Create all objects for the tooltip
	this.type = new PIXI.Text(
		"",
		{
			font: "12px Courier New",
			fill: "#ffffff",
			wordWrap: true,
			wordWrapWidth: 150
		}
	);

	this.type.position.x = 15;

	this.addChild(this.type);

	//Create all objects for the tooltip
	this.description = new PIXI.Text(
		"",
		{
			font: "12px Courier New",
			fill: "#b4b4b4",
			wordWrap: true,
			wordWrapWidth: 150
		}
	);

	this.description.position.x = 15;

	this.addChild(this.description);

};

/**
 * Calls the render function of each of the containers children
 * @protected
 */
TooltipElement.prototype.updateText = function(title, type, description) {

	this.title.setText(title);
	this.type.setText(type);
	this.description.setText(description);

	var yPos = 15;

	this.title.position.y = yPos;

	if(title !== ""){
		yPos += this.title.height;
	}

	this.type.position.y = yPos;

	if(type !== ""){
		yPos += this.type.height;
	}

	this.description.position.y = yPos;

	if(description !== ""){
		yPos += this.description.height;
	}

	yPos += 15;

	this.background.clear();
	this.background.beginFill(0x000000, 0.5);
	this.background.drawRect(0,0, this.width + 30, yPos);

};

//Export the Browserify module
module.exports = TooltipElement;
