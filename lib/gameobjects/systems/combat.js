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

			//Check if any actions need to be performed on this openable entity
			if(canFightComponent.actions.length !== 0) {

				//Loop through the actions
				for(var a = canFightComponent.actions.length; a > 0; a--) {

					//Pop the action from the "stack"
					var currentEnemy = canFightComponent.actions.pop();

					//Check if the enemy even has a health component before we try to hit it
					if(currentEnemy.hasComponent("health")){

						var healthComponent = currentEnemy.getComponent("health");

						healthComponent.takeDamage(weaponComponent.damage);

						//TODO: Implement behaviour when an enemy dies
						if(healthComponent.isDead){
							//Byebye
						}

					}

				}

			}

		}

	}

};
