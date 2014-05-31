/**
 * Sprite Component constructor
 *
 * @class Roguelike.Components.Sprite
 * @classdesc Determines how an entity looks!
 *
 * @param {String} sprite - The string of the sprite that is being used
 * @param {Number} row - The row that the sprite is on, on the tileset
 * @param {Number} tile - The specific tile that the sprite is on, on the tileset
 * @param {Object} offset - Optional object that described he horizontal and vertical offset of this sprite
 */
Roguelike.Components.Sprite = function(sprite, row, tile, offset) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'sprite';

	/**
	 * @property {String} sprite - The sprite image of this entity
	 */
	this.sprite = sprite;

	/**
	 * @property {Number} row - The row that the sprite is on, on the tileset
	 */
	this.row = row;

	/**
	 * @property {Number} tile - The specific tile that the sprite is on, on the tileset
	 */
	this.tile = tile;

	/**
	 * @property {Object} offset - The horizontal and vertical offset of this sprite, used for example to render something a little above of below it's position
	 */
	this.offset = offset || {x: 0, y: 0};

	/**
	 * @property {String} direction - The direction this sprite is facing. Left, right, up, down.
	 */
	this.direction = "right";

};

Roguelike.Components.Sprite.prototype = {

	/**
	 * Return the tile that should be rendered, based on the direction
	 * @protected
	 *
	 * @return {Number} Returns the tile number
	 */
	getTileNumber: function() {

		//Switch between all possible directions
		switch(this.direction) {

			default:
			case("right"):

				return this.tile;

				break;

			case("left"):

				return this.tile + 1;

				break;

		}

	}

};

