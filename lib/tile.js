/*
* Tile Constructor
* 
* @class Roguelike.Tile
* @classdesc A single tile on the map, contains data about it's location and origin
* 
* @param {int} type - The kind of tile, wall, floor, void etc
* @param {bool} blockLight - Does this tile block light, yes or no
* @param {Roguelike.Room} room - The room that this tile belongs to
*/
Roguelike.Tile = function(type, blockLight, room){

    /*
    * @property {int} The kind of tile, wall, floor, void etc
    */
    this.type = type;

    /*
    * @property {Roguelike.Room} belongsTo - The room that this tile belongs to
    */
    this.belongsTo = room || null;

    /*
    * @property {Roguelike.Object} staticObject - A static object that is on this tile
    */
	this.staticObject = null;

    /*
    * @property {bool} staticObject - A static object that is on this tile
    */
    this.blockLight = blockLight;

    /*
    * @property {int} lightLevel - The brightness of the current tile
    */
    this.lightLevel = 0;

};

Roguelike.Tile.prototype = {

    /*
    * Function that allows the user to set new values for the boundary
    * @protected
    *
    * @param {Roguelike.Object} staticObject - A static object that is on this tile
    */
    set: function(staticObject){

        this.staticObject = staticObject;

    }

};