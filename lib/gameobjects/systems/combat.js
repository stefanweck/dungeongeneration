/**
 * Combat System constructor
 *
 * @class Roguelike.Systems.Combat
 * @classdesc The system that handles combat
 *
 * @param {number} game - Reference to the currently running game
 */
Roguelike.Systems.Combat = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Array} toRemove - A stack with all the enemies that are going to be removed at the end of the turn
	 */
	this.toRemove = [];

};

Roguelike.Systems.Combat.prototype = {

	/**
	 * Function that gets called when the game continues one tick
	 * @protected
	 */
	update: function() {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("weapon", "canFight");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++) {

			//Get the components from the current entity and store them temporarily in a variable
			var canFightComponent = entities[i].getComponent("canFight");
			var weaponComponent = entities[i].getComponent("weapon");

			//Check if any actions need to be performed on this entity
			if(canFightComponent.actions.length !== 0) {

				//Loop through the actions
				for(var a = canFightComponent.actions.length; a > 0; a--) {

					//Pop the action from the "stack"
					var currentEnemy = canFightComponent.actions.pop();

					//Check if the enemy even has a health component before we try to hit it
					if(currentEnemy.hasComponent("health")){

						//Get the current entities components
						var healthComponent = currentEnemy.getComponent("health");

						//The weapon of the current entity should damage to the current enemy
						healthComponent.takeDamage(weaponComponent.damage);

						//If the enemy is dead, we have to remove him from the game
						if(healthComponent.isDead()){

							//Add the current enemy to the remove stack, this way the loop doesn't get interrupted
							this.toRemove.push(currentEnemy);

						}

					}

				}

			}

		}

		//Loop through the enemies that are dead and need to be removed
		for (var entity; entity = this.toRemove.pop(); ) {

			//Remove the entity from the map's list
			this.game.map.entities.removeEntity(entity);

			//Get the components of this enity
			var positionComponent = entity.getComponent("position");

			//Get the tile that the entity ws standing on
			var currentTile = this.game.map.tiles[positionComponent.position.x][positionComponent.position.y];

			//Remove the entity from the tile it was standing on
			var currentEntityPosition = currentTile.entities.indexOf(entity);
			currentTile.entities.splice(currentEntityPosition, 1);

		}

	}

};
