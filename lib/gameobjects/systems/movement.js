//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Movement System constructor
 *
 * @class Movement
 * @classdesc The movement system is responsible for handling collision between entities and moving them
 *
 * @param {Game} game - Reference to the currently running game
 */
var Movement = function(game) {

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

};

Movement.prototype = {

	/**
	 * Performs the needed operations for this specific system on one entity
	 * @public
	 *
	 * @param {Entity} entity - The entity that is being processed by this system
	 * @param {Object} newPosition - The new x or y coordinates the entity is trying to move to
	 */
	handleSingleEntity: function(entity, newPosition) {

		//Check if the sprite needs to be flipped
		this.changeDirection(entity, newPosition);

		//Check if the new position is correct
		if(this.canMove(entity, newPosition)) {

			//Get components
			var positionComponent = entity.getComponent("position");

			//Get the tile to which the entity is trying to move
			var currentTile = this.game.map.tiles[positionComponent.position.x][positionComponent.position.y];
			var nextTile = this.game.map.tiles[newPosition.x][newPosition.y];

			//Remove the entity from the tile it's currently on
			currentTile.remove(entity);

			//And add him to the next tile that he is going to be on
			nextTile.add(entity);

			//Update the position of the sprite
			TweenMax.to(entity.sprite.position, 0.5, {
				x : newPosition.x * this.game.map.settings.tileSize,
				y: newPosition.y * this.game.map.settings.tileSize
			});

			//Set the new position in the position component
			positionComponent.position = newPosition;

		}

	},

	/**
	 * Changes the direction of a sprite based on it's new position
	 * This way a sprite can face left or right based on it's movement
	 * @private
	 *
	 * @param {Entity} entity - The entity that is being processed by this system
	 * @param {Object} newPosition - The new x or y coordinates the entity is trying to move to
	 */
	changeDirection: function(entity, newPosition) {

		//Get components
		var positionComponent = entity.getComponent("position");

		//Check if the entity moved left or right
		if(newPosition.x > positionComponent.position.x) {

			entity.textureName = entity.textureName.replace("left", "right");

		}else if(newPosition.x < positionComponent.position.x) {

			entity.textureName = entity.textureName.replace("right", "left");

		}

		//The entity moved right
		entity.sprite.texture = PIXI.Texture.fromFrame(entity.textureName);

	},

	/**
	 * Function that gets called when an entity wants to move
	 * @private
	 *
	 * @param {Entity} entity - The entity that is being checked against the map
	 * @param {Object} newPosition - The new position the entity is trying to move to
	 *
	 * @return {Boolean} True when an entity can move to the new position, false when the entity is obstructed
	 */
	canMove: function(entity, newPosition) {

		//Get the tile to which the entity is trying to move
		var nextTile = this.game.map.getTileAt(newPosition);

		//Check for collision on the map, walls etc
		if(nextTile.type !== 2) {

			return false;

		}

		//Check if there is one or more than one entity at the new location
		if(nextTile.entities.length !== 0) {

			//Define variables
			var canContinue = true;

			//Loop through the entities
			for(var i = 0; i < nextTile.entities.length; i++) {

				//Check if the entity has a collide component
				if(nextTile.entities[i].hasComponent("collide")) {

					//Get the collide component
					var collideComponent = nextTile.entities[i].getComponent("collide");

					//If collide is true, it means we can't walk to the next tile
					if(collideComponent.collide === true) {

						canContinue = false;

					}

				}

				//Loop through the components
				for(var key in nextTile.entities[i].components) {

					//Check if the entity still exists
					if(typeof nextTile.entities[i] === "undefined") {

						//The entity could have died in a previous bumpInto event
						//Thus we should abort the loop of the entity no longer exists
						break;

					}

					//Make sure that obj[key] belongs to the object and was not inherited
					if(nextTile.entities[i].components.hasOwnProperty(key)) {

						//Check if the component has an events parameter
						if(typeof nextTile.entities[i].components[key].events !== "undefined") {

							//Trigger the specified event
							nextTile.entities[i].components[key].events.trigger("bumpInto", entity, nextTile.entities[i]);

						}

					}

				}

			}

			//If there was even one entity that we couldn't collide with on the next tile
			//this will return false
			return canContinue;

		}

		//Function made it all the way down here, that means the entity is able to move to the new position
		return true;

	}

};

//Export the Browserify module
module.exports = Movement;
