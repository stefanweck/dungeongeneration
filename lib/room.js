/*
* Room constructor
* 
* @class Roguelike.Room
* @classdesc A room object that creates his own layout!
* 
* @param {int} x - The x coordinate of the top left corner of this room
* @param {int} y - The y coordinate of the top left corner of this room
* @param {int} w - The width of this room
* @param {int} h - The heighth of this room
*/
Roguelike.Room = function(x, y, w, h){

    /*
    * @property {int} x1 - The X position of the top left corner of this room
    */
    this.x1 = x;

    /*
    * @property {int} x2 - The X position of the top right corner of this room
    */
    this.x2 = w + x;

    /*
    * @property {int} y1 - The Y position of top left corner of this room
    */
    this.y1 = y;

    /*
    * @property {int} y2 - The Y position of bottom left corner of this room
    */
    this.y2 = y + h;

    /*
    * @property {int} w - The width of this room, defined in tiles
    */
    this.w = w;

    /*
    * @property {int} h - The heigth of this room, defined in tiles
    */
    this.h = h;

    /*
    * @property {array} layout - The array that contains the layout of this room
    */
    this.layout = [];

};

Roguelike.Room.prototype = {

    /*
    * Initialize the layout of the room, filling it with default tiles
    * @protected
    */
    initialize: function(){

        //Loop through every horizontal row
        for(y = 0; y < this.h; y++){

            //Initialize this row
            this.layout[y] = [];

            //Loop through every vertical row
            for(x = 0; x < this.w; x++){

                //Check if the position filled has to be a wall or floor
                if(y === 0 || y === this.h - 1 || x === 0 || x === this.w - 1){
                    this.layout[y][x] = new Roguelike.Tile(1, this);
                }else{
                    this.layout[y][x] = new Roguelike.Tile(2, this);
                }

            }

        }

    },

    /*
    * Generate an exit on a random side of this room
    * @protected
    */
    generateExit: function(){

        //Add an exit on one of the sides of the wall
        //But one tile further into the room, so we don't get weird openings
        //when the generation of a corridor goes the other direction
        switch(Roguelike.Utils.randomNumber(1,4)){

            case(1): //Top
                this.layout[this.h - 2][Roguelike.Utils.randomNumber(1, this.w - 2)].type = 3;
            break;

            case(2): //Bottom
                this.layout[1][Roguelike.Utils.randomNumber(1, this.w - 2)].type = 3;
            break;

            case(3): //Left
                this.layout[Roguelike.Utils.randomNumber(1, this.h - 2)][this.w - 2].type = 3;
            break;

            case(4): //Right
                this.layout[Roguelike.Utils.randomNumber(1, this.h - 2)][1].type = 3;
            break;

        }

    },

    /*
    * Generate an entrance to this dungeon, also the players initial spawn position
    * @protected
    */
    generateDungeonEntrance: function(){

        var positionX = Roguelike.Utils.randomNumber(2, this.w - 3);
        var positionY = Roguelike.Utils.randomNumber(2, this.h - 3);

        //Set a random tile in this room to the dungeon entrance tile
        this.layout[positionY][positionX].type = 4;

    }

};