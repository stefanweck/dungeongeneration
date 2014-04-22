/**
 * Sprite Component constructor
 *
 * @class Roguelike.Components.Sprite
 * @classdesc Determines how an entity looks!
 *
 * @param {string} sprite - The string of the sprite that is being used
 * @param {number} row - The row that the sprite is on, on the tileset
 * @param {number} tile - The specific tile that the sprite is on, on the tileset
 */
Roguelike.Components.Sprite = function(sprite, row, tile) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'sprite';

	/**
	 * @property {string} sprite - The sprite image of this entity
	 */
	this.sprite = sprite;

	/**
	 * @property {number} row - The row that the sprite is on, on the tileset
	 */
	this.row = row;

	/**
	 * @property {number} tile - The specific tile that the sprite is on, on the tileset
	 */
	this.tile = tile;

};
