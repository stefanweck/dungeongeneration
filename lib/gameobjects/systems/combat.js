//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Combat System constructor
 *
 * @class Combat
 * @classdesc The system that handles combat
 *
 * @param {Game} game - Reference to the currently running game
 */
var Combat = function(game) {

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

};

Combat.prototype = {

	/**
	 * Performs the needed operations for this specific system on one entity
	 * @protected
	 *
	 * @param {Entity} entity - The entity that is being processed by this system
	 * @param {Entity} enemyEntity - The entity that is being attacked
	 */
	handleSingleEntity: function(entity, enemyEntity) {

		//Get the components from the current entity and store them temporarily in a variable
		var weaponComponent = entity.getComponent("weapon");

		//Check if the enemy even has a health component before we try to hit it
		if(enemyEntity.hasComponent("health")) {

			//Get the current entities components
			var healthComponent = enemyEntity.getComponent("health");

			//The weapon of the current entity should damage to the current enemy
			healthComponent.takeDamage(weaponComponent.damage);

			//Generate the TextLog message
			var textLogMessage = entity.name + " hit " + enemyEntity.name + " for " + weaponComponent.damage + " damage";

			//If the enemy is dead, we have to remove him from the game
			if(healthComponent.isDead()) {

				//Add the current enemy to the remove stack, this way the loop doesn't get interrupted
				this.removeEntity(enemyEntity);

				//Add another string to the message
				textLogMessage += " and killed him with that attack!";

			}

			//Add the text log message to the textlog
			this.game.UI.textLog.addMessage(textLogMessage);

		}

	},

	/**
	 * Remove a dead entity
	 * @protected
	 *
	 * @param {Entity} entity - The entity that is dead
	 */
	removeEntity: function(entity) {

		//Check for the player entity being removed
		if(entity.hasComponent("keyboardControl")) {

			//Lock the scheduler to stop the game
			this.game.scheduler.lock();
			//Make the game inactive
			this.game.isActive = false;

		}

		//Remove the entity from the map's list
		this.game.map.entities.removeEntity(entity);

		//Remove the entity from the scheduler
		this.game.scheduler.remove(entity);

		//Get the components of this entity
		var positionComponent = entity.getComponent("position");

		//Get the tile that the entity ws standing on
		var currentTile = this.game.map.tiles[positionComponent.position.x][positionComponent.position.y];

		//Remove the entity from the tile it was standing on
		currentTile.removeEntity(entity);

	}

};

//Export the Browserify module
module.exports = Combat;
