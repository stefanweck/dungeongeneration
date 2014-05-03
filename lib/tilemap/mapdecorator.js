/**
 * MapDecorator constructor
 *
 * @class Roguelike.MapDecorator
 * @classdesc The object that is responsible for decorating the map
 *
 * @param {Roguelike.Game} game - Reference to the current game object
 */
Roguelike.MapDecorator = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

};

Roguelike.MapDecorator.prototype = {

	/**
	 * This function sets the correct tileset row and number for each tile
	 * @protected
	 */
	setTileNumbers: function() {

		//Do something

	}

};
