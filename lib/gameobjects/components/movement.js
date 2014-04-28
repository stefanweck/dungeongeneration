/**
 * Movement Component constructor
 *
 * @class Roguelike.Components.Movement
 * @classdesc A component that tells the behaviour of an entity, is it aggressive, does it try to flee, etc
 */
Roguelike.Components.Movement = function(func) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'movement';

	/**
	 * @property {string} behaviour - A string with the behaviour of the entity that holds this component
	 */
	this.move = func;

};

Roguelike.Components.Movement.prototype = {

	/**
	 * Initialize the game, create all objects
	 * @protected
	 */
	execute: function() {

		this.move();

	}

};
