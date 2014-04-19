/**
 * Collision System constructor
 *
 * @class Roguelike.Systems.Collision
 * @classdesc The collision system is responsible for handling collision between entities
 *
 * @param {number} game - Reference to the currently running game
 */
Roguelike.Systems.Collision = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

};

Roguelike.Systems.Collision.prototype = {

	/**
	 * Function that gets called when the game continues one tick
	 * @protected
	 */
	update: function() {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("position");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++) {

			//Get the components
			var positionComponent = entities[i].getComponent("position");

			//Loop through the actions
			for(var a = positionComponent.actions.length - 1; a >= 0; a--) {

				//Pop the action from the "stack"
				var newPosition = positionComponent.actions[a];

				//Check if the new position is correct
				if(!this.canMove(entities[i], newPosition)) {

					//The new position is invalid, remove the action from the queue
					positionComponent.actions.splice(a, 1);

				}

			}

		}

	},

	/**
	 * Function that gets called when an entity wants to move
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is being checked against the map
	 * @param {object} newPosition - The new position the entity is trying to move to
	 */
	canMove: function(entity, newPosition) {

		//Get the tile to which the entity is trying to move
		var nextTile = this.game.map.tiles[newPosition.x][newPosition.y];

		//Check for collision on the map, walls etc
		if(nextTile.type !== 2) {
			return false;
		}

		//Check if there is one or more than one entity at the new location
		if(nextTile.entities.length !== 0) {

			//Loop through the entities
			for(var i = 0; i < nextTile.entities.length; i++) {

				//Loop through the components
				for(var key in nextTile.entities[i].components) {

					//Check if the component has an events parameter
					if(typeof nextTile.entities[i].components[key].events !== "undefined") {

						//Trigger the specified event
						nextTile.entities[i].components[key].events.trigger("bumpInto", entity, nextTile.entities[i]);

					}

				}

				//Check if the entity has a collide component
				if(nextTile.entities[i].hasComponent("collide")) {

					//Get the collide component
					var collideComponent = nextTile.entities[i].getComponent("collide");
					if(collideComponent.collide === true) {
						return false;
					}

				}


			}

		}

		//Function made it all the way down here, that means the entity is able to move to the new position
		return true;

	}

};
