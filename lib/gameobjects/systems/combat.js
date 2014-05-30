/**
 * Combat System constructor
 *
 * @class Roguelike.Systems.Combat
 * @classdesc The system that handles combat
 *
 * @param {Roguelike.Game} game - Reference to the currently running game
 */
Roguelike.Systems.Combat = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

};

Roguelike.Systems.Combat.prototype = {

	/**
	 * Performs the needed operations for this specific system on one entity
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is being processed by this system
	 * @param {Roguelike.Entity} enemyEntity - The entity that is being attacked
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

			//If the enemy is dead, we have to remove him from the game
			if(healthComponent.isDead()) {

				//Add the current enemy to the remove stack, this way the loop doesn't get interrupted
				this.removeEntity(enemyEntity);

			}

		}

	},

	/**
	 * Remove a dead entity
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is dead
	 */
	removeEntity: function(entity) {

		//TODO: Don't make the player invincible
		if(entity.hasComponent("keyboardControl")) {

			return;

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
