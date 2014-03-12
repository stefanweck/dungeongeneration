/**
 * Position Component constructor
 *
 * @class Roguelike.Components.Position
 * @classdesc The position component holds x and y position of the entity
 *
 * @param {int} x - The horizontal position of the entity
 * @param {int} y - The vertical position of the entity
 */
Roguelike.Components.Position = function(x, y) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'position';

	/**
	 * @property {int} x - The horizontal position of the entity
	 */
	this.x = x;

	/**
	 * @property {int} y - The vertical position of the entity
	 */
	this.y = y;

};
