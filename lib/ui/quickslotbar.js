//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * QuickslotBar constructor
 *
 * @class QuickslotBar
 * @classdesc The Quickslot Bar holds all quickslots and manages the rendering of this UI element
 * Inherits from PIXI.DisplayObjectContainer
 *
 * @param {Game} game - Reference to the currently running game
 */
var QuickslotBar = function(game) {

	/**
	 * Inherit the constructor from the PIXI.DisplayObjectContainer object
	 */
	PIXI.DisplayObjectContainer.call(this);

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

};

//Inherit the prototype from the PIXI.DisplayObjectContainer
QuickslotBar.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
QuickslotBar.prototype.constructor = QuickslotBar;

QuickslotBar.prototype.add = function(child){

	this.addChild(child);

};

//Export the Browserify module
module.exports = QuickslotBar;
