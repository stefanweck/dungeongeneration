/**
 * Movement Component constructor
 *
 * @class Roguelike.Components.Movement
 * @classdesc A component that tells the behaviour of an entity, is it aggressive, does it try to flee,
 *
 * @param {Roguelike.Game} game - Reference to the currently running game
 * @param {Roguelike.Entity} entity - Reference to the entity that has this component
 * @param {Function} func - The move functionality that is defined in moveBehaviours.js
 */
Roguelike.Components.Movement = function(game, entity, func) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'movement';

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Roguelike.Entity} entity - Reference to the entity that has this component
	 */
	this.entity = entity;

	/**
	 * @property {Function} func - The move functionality that is defined in moveBehaviours.js
	 */
	this.move = func;

};

Roguelike.Components.Movement.prototype = {

	/**
	 * Initialize the game, create all objects
	 * @protected
	 */
	execute: function() {

		//Execute the move behaviour applied to this component
		this.move(this.game, this.entity);

	}

};
