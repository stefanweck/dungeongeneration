/**
 * Open System constructor
 *
 * @class Roguelike.Systems.Open
 * @classdesc The Open system handles opening entities and making sure the collision is turned of after they are opened
 *
 * @param {Roguelike.Game} game - Reference to the currently running game
 */
Roguelike.Systems.Open = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

};

Roguelike.Systems.Open.prototype = {

	/**
	 * Performs the needed operations for this specific system on one entity
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is being processed by this system
	 */
	handleSingleEntity: function(entity) {

		//Get the components from the current entity and store them temporarily in a variable
		var canOpenComponent = entity.getComponent("canOpen");
		var spriteComponent = entity.getComponent("sprite");
		var positionComponent = entity.getComponent("position");
		var collideComponent = entity.getComponent("collide");
		var tooltipComponent = entity.getComponent("tooltip");

		//Action to open the door
		if(canOpenComponent.state !== "open") {

			//Change the door's state to open
			canOpenComponent.state = "open";

			//Change the sprite to open
			spriteComponent.tile += 1;

			//Make sure the collide component doesn't say it collides anymore
			collideComponent.collide = false;

			tooltipComponent.type = ["Open"];

			//Make sure the tile that this openable entity is on doesn't block light anymore
			this.game.map.tiles[positionComponent.position.x][positionComponent.position.y].blockLight = false;

		}

	}

};
