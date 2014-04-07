/**
 * Sprite Component constructor
 *
 * @class Roguelike.Components.Sprite
 * @classdesc Determines how an entity looks!
 *
 * @param {string} color - The color code of the current entity
 * @param {string} sprite - The string of the sprite that is being used
 */
Roguelike.Components.Sprite = function(color, sprite) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'sprite';

	/**
	 * @property {string} color - The color code of the current entity
	 */
	//TODO: Remove color, replace by only using sprites!
	this.color = color;

	/**
	 * @property {string} color - The color code of the current entity
	 */
	this.sprite = sprite;

};
