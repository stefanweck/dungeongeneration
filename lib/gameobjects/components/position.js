/**
 * Position Component constructor
 *
 * @class Roguelike.Components.Position
 * @classdesc The position component holds x and y position of the entity
 *
 * @param {number} x - The horizontal position of the entity
 * @param {number} y - The vertical position of the entity
 */
Roguelike.Components.Position = function(x, y) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'position';

	/**
	 * @property {number} x - The horizontal position of the entity
	 */
	this.x = x;

	/**
	 * @property {number} y - The vertical position of the entity
	 */
	this.y = y;

};
