/*
* Player constructor
* 
* @class Roguelike.Player
* @classdesc A player object that creates his own layout!
*
* @property {Roguelike.Game} game - Reference to the current game object
* @param {object} position - The x and y coordinate of this player, in tiles
*/
Roguelike.Player = function(game, position){

    /*
    * @property {Roguelike.Game} game - Reference to the current game object
    */
    this.game = game;

    /*
    * @property {object} position - The x and y coordinate of this player, in tiles
    */
    this.position = Object.create(position);

    /*
    * @property {int} speed - The speed of the player, in tiles
    */
    this.speed = 1;

    /*
    * @property {int} lastKey - The last button the player has clicked
    */
    this.lastKey = 0;

};

Roguelike.Player.prototype = {

    /*
    * The function that get's called every game loop
    * @protected
    *
    * @param {int} step - The time between frames, in seconds
    */
    update: function(step){

        //If the last keystroke is the same as the current keystroke, don't do anything
        //This makes sure the player can only move 1 tile at a time
        if(this.lastKey !== this.game.controls.current){

            //If the keystroke has changed, update the last keystroke variable
            this.lastKey = this.game.controls.current;

            //Check which controls are being pressed and update the player accordingly
            if(this.game.controls.left && this.game.map.tiles[this.position.y][this.position.x - this.speed].type === 2){
                this.position.x -= this.speed;
            }else if(this.game.controls.up && this.game.map.tiles[this.position.y - this.speed][this.position.x].type === 2){
                this.position.y -= this.speed;
            }else if(this.game.controls.right && this.game.map.tiles[this.position.y][this.position.x + this.speed].type === 2){
                this.position.x += this.speed;
            }else if(this.game.controls.down && this.game.map.tiles[this.position.y + this.speed][this.position.x].type === 2){
                this.position.y += this.speed;
            }

        }

    }

};