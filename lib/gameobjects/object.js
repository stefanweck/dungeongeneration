/*
* Object constructor
* 
* @class Roguelike.Object
* @classdesc A Object object that creates his own layout!
*
* @param {object} position - The x and y coordinate of this Object, in tiles
* @param {int} type - The number on the tileset that this object looks like
*/
Roguelike.Object = function(position, type){

    /*
    * @property {object} position - The x and y coordinate of this object, in tiles
    */
    this.position = position;

    /*
    * @property {int} type - The number on the tileset that this object looks like
    */
    this.type = type;

};

Roguelike.Object.prototype = {

    

};