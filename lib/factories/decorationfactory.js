//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Entity = require('../gameobjects/entity.js'),
	Position = require('../gameobjects/components/position.js'),
	Utils = require('../core/utils.js');

/**
 * @class DecorationFactory
 * @classdesc Decorations are things in the world the player sees but doesn’t interact with: bushes,
 * debris and other visual detail.
 */
var DecorationFactory = {

	/**
	 * Function that returns a grass object
	 * @public
	 *
	 * @param {Game} game - Reference to the currently running game
	 * @param {Vector2} position - The position object of this entity
	 *
	 * @return {Entity} A decoration entity
	 */
	newGrass: function(game, position) {

		//Create the entity
		var entity = new Entity(game, "Grass", "grass_" + Utils.randomNumber(1, 4) + ".png");

		//The starting position of the entity
		entity.addComponent(new Position(position));

		//Return the entity
		return entity;

	}

};

//Export the Browserify module
module.exports = DecorationFactory;
