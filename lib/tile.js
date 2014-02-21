/*
* Tile Constructor
* 
* @class Roguelike.Tile
* @classdesc A single tile on the map, contains data about it's location and origin
* 
* @param {int} type - The kind of tile, wall, floor, void etc
* @param {Roguelike.Room} room - The room that this tile belongs to
*/
Roguelike.Tile = function(type, room){

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

};

Roguelike.Tile.prototype = {

    /*
    * Function that allows the user to set new values for the boundary
    * @protected
    *
    * @param {int} {Roguelike.Object} staticObject - A static object that is on this tile
    */
    set: function(staticObject){

        this.staticObject = staticObject;

    }

};