//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Entity = require('../gameobjects/entity.js'),
	Position = require('../gameobjects/components/position.js'),
	CanOpen = require('../gameobjects/components/canopen.js'),
	Collide = require('../gameobjects/components/collide.js'),
	Tooltip = require('../gameobjects/components/tooltip.js');

/**
 * @class PropFactory
 * @classdesc A factory that returns pre made props with
 * a set of components. Props are like decorations but can be touched: boxes, boulders, and doors.
 */
var PropFactory = {

	/**
	 * Function that returns a new entrance to the map
	 * @public
	 *
	 * @param {Game} game - Reference to the currently running game
	 * @param {Vector2} position - The position object of this entity
	 *
	 * @return {Entity} An prop entity
	 */
	newEntrance: function(game, position) {

		//Create the entity
		var entity = new Entity(game, "Entrance", "stairs_down.png");

		//The starting position of the entity
		entity.addComponent(new Position(position));

		//Return the entity
		return entity;

	},

	/**
	 * Function that returns a new exit to the map
	 * @public
	 *
	 * @param {Game} game - Reference to the currently running game
	 * @param {Vector2} position - The position object of this entity
	 *
	 * @return {Entity} An prop entity
	 */
	newExit: function(game, position) {

		//Create the entity
		var entity = new Entity(game, "Exit", "stairs_up.png");

		//The starting position of the entity
		entity.addComponent(new Position(position));

		//Return the entity
		return entity;

	},

	/**
	 * Function that returns a new door
	 * @public
	 *
	 * @param {Game} game - Reference to the currently running game
	 * @param {Vector2} position - The position object of this entity
	 *
	 * @return {Entity} An prop entity
	 */
	newDoor: function(game, position) {

		//Create the entity
		var entity = new Entity(game, "Wooden Door", "door_horizontal_closed.png");

		//The starting position of the entity
		entity.addComponent(new Position(position));

		//This entity can be opened up by another entity
		entity.addComponent(new CanOpen(game, entity));

		//You can collide with this entity
		entity.addComponent(new Collide(true));

		//Add a tooltip to this entity
		entity.addComponent(new Tooltip(
			entity.name,
			"Closed",
			""
		));

		//Return the entity
		return entity;

	}

};

//Export the Browserify module
module.exports = PropFactory;
