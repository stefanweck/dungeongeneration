/**
 * Position Component constructor
 *
 * @class Roguelike.Components.Position
 * @classdesc The position component holds x and y position of the entity
 *
 * @param {Roguelike.Vector2} position - The position object of this entity
 */
Roguelike.Components.Position = function(position) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'position';

	/**
	 * @property {Roguelike.Vector2} position - The position object of this entity
	 */
	this.position = position;

	/**
	 * @property {array} actions - The next actions to perform on this object
	 */
	this.actions = [];

};
