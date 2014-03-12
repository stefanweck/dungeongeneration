/**
 * Sprite Component constructor
 *
 * @class Roguelike.Components.Sprite
 * @classdesc Determines how an entity looks!
 *
 * @param {string} color - The color code of the current entity
 */
Roguelike.Components.Sprite = function(color) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'sprite';

	/**
	 * @property {string} color - The color code of the current entity
	 */
	this.color = color;

};
