//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Open System constructor
 *
 * @class Open
 * @classdesc The Open system handles opening entities and making sure the collision is turned of after they are opened
 *
 * @param {Game} game - Reference to the currently running game
 */
var Open = function(game) {

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

};

Open.prototype = {

	/**
	 * Performs the needed operations for this specific system on one entity
	 * @public
	 *
	 * @param {Entity} entity - The entity that is being processed by this system
	 */
	handleSingleEntity: function(entity) {

		//Get the components from the current entity and store them temporarily in a variable
		var canOpenComponent = entity.getComponent("canOpen");
		var positionComponent = entity.getComponent("position");
		var collideComponent = entity.getComponent("collide");
		var tooltipComponent = entity.getComponent("tooltip");

		//Action to open the door
		if(canOpenComponent.state !== "open") {

			//Change the door's state to open
			canOpenComponent.state = "open";

			//Change the texture name
			entity.textureName = entity.textureName.replace("closed", "open");

			//Change the sprite to open
			entity.sprite.texture = PIXI.Texture.fromFrame(entity.textureName);

			//Make sure the collide component doesn't say it collides anymore
			collideComponent.collide = false;

			//Change the tooltip component type text
			tooltipComponent.type = 'Open';

			//Make sure the tile that this openable entity is on doesn't block light anymore
			this.game.map.tiles[positionComponent.position.x][positionComponent.position.y].blockLight = false;

		}

	}

};

//Export the Browserify module
module.exports = Open;

