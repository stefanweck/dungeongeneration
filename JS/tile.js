/*
* Tile Constructor
* 
* @class Roguelike.Tile
* @classdesc A single tile on the map, contains data about it's location and origin
* 
* @param {int} type - The kind of tile, wall, floor, void etc
* @param {object} room - The room that this tile belongs to
*/
Roguelike.Tile = function(type, room){

    /*
    * @property {int} The kind of tile, wall, floor, void etc
    */
    this.type = type;

    /*
    * @property {Roguelike.Room} belongsTo - The room that this tile belongs to
    */
    this.belongsTo = room;

};