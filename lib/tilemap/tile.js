//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Tile Constructor
 *
 * @class Tile
 * @classdesc A single tile on the map, contains data about it's location and origin
 *
 * @param {Number} type - The kind of tile, wall, floor, void etc
 * @param {Boolean} blockLight - Does this tile block light, yes or no
 * @param {Room} room - The room that this tile belongs to
 */
var Tile = function(type, blockLight, room) {

	/**
	 * @property {Number} The kind of tile, wall, floor, void etc
	 */
	this.type = type;

	/**
	 * @property {Boolean} staticObject - A static object that is on this tile
	 */
	this.blockLight = blockLight;

	/**
	 * @property {Room} belongsTo - The room that this tile belongs to
	 */
	this.belongsTo = room || null;

	/**
	 * @property {Array} entities - An array that holds all entities on this tile
	 */
	this.entities = [];

	/**
	 * @property {Number} lightLevel - The brightness of the current tile
	 */
	this.lightLevel = 0;

	/**
	 * @property {Boolean} explored - Boolean if a tile has already been explorer by the player
	 */
	this.explored = false;

};

Tile.prototype = {

	/**
	 * Function that adds an entity to a tile
	 * @public
	 *
	 * @param {Entity} entity - The entity being removed from a tile
	 */
	add: function(entity) {

		//Aad the entity to the list
		this.entities.push(entity);

	},

	/**
	 * Function that removes an entity from a tile
	 * @public
	 *
	 * @param {Entity} entity - The entity being removed from a tile
	 *
	 * @return {Boolean} Returns true on success, returns false on failure
	 */
	remove: function(entity) {

		//Get the current position of the entity
		var index = this.entities.indexOf(entity);

		//If the entity exists, remove it
		if(index === -1) {

			//The entity doesn't even exist on this tile
			return false;

		}else{

			//Remove the entity from the tile
			this.entities.splice(index, 1);

			//We have removed the entity
			return true;

		}

	}

};

//Export the Browserify module
module.exports = Tile;
