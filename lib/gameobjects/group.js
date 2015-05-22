//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Entity = require('../gameobjects/entity.js');

/**
 * Control constructor
 *
 * @class Group
 * @classdesc The object that holds multiple entities and is able to search them
 * Inherits from PIXI.Container
 *
 * @param {Game} game - A reference to the current game object
 */
var Group = function(game) {

	/**
	 * Inherit the constructor from the PIXI.Container object
	 */
	PIXI.Container.call(this);

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Array} entities - Collection of all the entities in this group
	 */
	this.entities = [];

};

//Inherit the prototype from the PIXI.Container
Group.prototype = Object.create(PIXI.Container.prototype);
Group.prototype.constructor = Group;

/**
 * Function to add a new entity to this group
 * @public
 *
 * @param {Entity} entity - A reference to entity being added
 */
Group.prototype.add = function(entity) {

	//Check if the entity is the correct object
	if(!entity instanceof Entity) {
		return;
	}

	//Add the sprite component to the Container
	this.addChild(entity.sprite);

	//If the entity has a position, position the sprite at that position
	if(entity.hasComponent('position')) {

		//Get the position component
		var positionComponent = entity.getComponent('position');

		//Translate to a new position
        //TODO: Don't use magic numbers 16, get the tilesize from the settings
		var newPosition = {
			x: positionComponent.position.x * 16,
			y: positionComponent.position.y * 16
		};

		//Set the position
		entity.sprite.position = new PIXI.Point(newPosition.x, newPosition.y);

	}

	//Add the current entity to the list
	this.entities.push(entity);

};

/**
 * Function to remove an entity from this group
 * @public
 *
 * @param {Entity} entity - A reference to entity being removed
 */
Group.prototype.remove = function(entity) {

	//Check if the entity exists, if not, we don't have to delete it
	var index = this.entities.indexOf(entity);

	//The element doesn't exist in the list
	if(index === -1) {
		return;
	}

	//Remove the sprite component from the the Container
	this.removeChild(entity.sprite);

	//Remove the current entity from the group
	this.entities.splice(index, 1);

};

/**
 * Function to return all entities with certain components
 * @public
 *
 * @return {Array} The array with all matching entities
 */
Group.prototype.get = function() {

	//Initialize the array that is going to be returned
	var entitiesMatch = [];

	//Loop through each entity in this group
	for(var i = 0; i < this.entities.length; i++) {

		//Initialize an empty array
		var isThere = [];

		//Loop through the arguments
		for(var a = 0; a < arguments.length; a++) {

			//If the current entity has the specified component. Push a random
			//value into the isThere array for later checks
			if(this.entities[i].components[arguments[a]]) {

				isThere.push(1);

			}

		}

		//If there are as many matches as supplied arguments, every component
		//is available within this entity
		if(isThere.length === arguments.length) {

			//Push the current entity into the array that is returned
			entitiesMatch.push(this.entities[i]);

		}

	}

	//Return all matching entities
	return entitiesMatch;

};

//Export the Browserify module
module.exports = Group;
