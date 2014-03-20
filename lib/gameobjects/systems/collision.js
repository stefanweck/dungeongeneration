/**
 * Collision System constructor
 *
 * @class Roguelike.Systems.Collision
 * @classdesc The collision system is responsible for handling collision between entities
 *
 * @param {int} game - Reference to the currently running game
 */
Roguelike.Systems.Collision = function(game) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'collision';

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

};

Roguelike.Systems.Collision.prototype = {

	/**
	 * Function that gets called when an entity wants to move
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is being checked against the map
	 * @param {object} newPosition - The new position the entity is trying to move to
	 */
	canMove: function(entity, newPosition) {

		//Get the tile to which the entity is trying to move
		var nextTile = this.game.map.tiles[newPosition.y][newPosition.x];

		//Check for collision on the map, walls etc
		if(nextTile.type !== 2){
			return false;
		}

		//Check if there is one or more than one entity at the new location
		if(nextTile.entities.length !== 0){

			//Loop through the entities
			for(var i = 0; i < nextTile.entities.length; i++){

				//Loop through the components
				for (var key in nextTile.entities[i].components) {

					if(typeof nextTile.entities[i].components[key].events !== "undefined"){

						//Trigger the specified event
						nextTile.entities[i].components[key].events.trigger("bumpInto");

					}


				}

			}

		}

		//Function made it all the way down here, that means the entity is able to move to the new position
		return true;

	}

};
