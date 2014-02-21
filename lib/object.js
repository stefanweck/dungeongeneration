/*
* Object constructor
* 
* @class Roguelike.Object
* @classdesc A Object object that creates his own layout!
*
* @param {object} position - The x and y coordinate of this Object, in tiles
* @param {int} tile - The number on the tileset that this object looks like
*/
Roguelike.Object = function(position, tile){

    /*
    * @property {object} position - The x and y coordinate of this player, in tiles
    */
    this.position = position;

    /*
    * @property {int} tile - The number on the tileset that this object looks like
    */
    this.tile = 0;

};

Roguelike.Object.prototype = {

    

};