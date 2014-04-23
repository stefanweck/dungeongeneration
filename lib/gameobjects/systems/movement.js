/**
 * Movement System constructor
 *
 * @class Roguelike.Systems.Movement
 * @classdesc The movement system is responsible for handling collision between entities and moving them
 *
 * @param {Roguelike.Game} game - Reference to the currently running game
 */
Roguelike.Systems.Movement = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

};

Roguelike.Systems.Movement.prototype = {

	/**
	 * Function that gets called when the game continues one tick
	 * @protected
	 */
	update: function() {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("position");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++) {

			//Perform the needed operations for this specific system on one entity
			this.handleSingleEntity(entities[i]);

		}

	},

	/**
	 * Performs the needed operations for this specific system on one entity
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is being processed by this system
	 */
	handleSingleEntity : function(entity){

		//Get the components
		var positionComponent = entity.getComponent("position");

		//Loop through the actions
		for(var a = positionComponent.actions.length - 1; a >= 0; a--) {

			//Pop the action from the "stack"
			var newPosition = positionComponent.actions[a];

			//Check if the new position is correct
			if(this.canMove(entity, newPosition)) {

				//Get the tile to which the entity is trying to move
				var currentTile = this.game.map.tiles[positionComponent.position.x][positionComponent.position.y];
				var nextTile = this.game.map.tiles[newPosition.x][newPosition.y];

				//Remove the entity from the tile it's currently on
				//TODO: Make a function out of this, because it's also being used in the Combat System
				var currentEntityPosition = currentTile.entities.indexOf(entity);
				currentTile.entities.splice(currentEntityPosition, 1);

				//And add him to the next tile that he is going to be on
				nextTile.entities.push(entity);

				//Pop the new position from the "stack"
				positionComponent.position = newPosition;

			}

			//The new position is either invalid or successful, remove the action from the queue
			positionComponent.actions.splice(a, 1);

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
