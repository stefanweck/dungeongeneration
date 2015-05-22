//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Movement Component constructor
 *
 * @class MovementComponent
 * @classdesc A component that tells the behaviour of an entity, is it aggressive, does it try to flee,
 *
 * @param {Game} game - Reference to the currently running game
 * @param {Entity} entity - Reference to the entity that has this component
 * @param {Function} func - The move functionality that is defined in moveBehaviours.js
 */
var MovementComponent = function(game, entity, func) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'movement';

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Entity} entity - Reference to the entity that has this component
	 */
	this.entity = entity;

	/**
	 * @property {Function} func - The move functionality that is defined in moveBehaviours.js
	 */
	this.move = func;

};

MovementComponent.prototype = {

	/**
	 * Initialize the game, create all objects
	 * @public
	 */
	execute: function() {

		//Execute the move behaviour applied to this component
		this.move(this.game, this.entity);

	}

};

//Export the Browserify module
module.exports = MovementComponent;
