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

};

Roguelike.Player.prototype = {

    /*
    * The function that get's called on a keypress
    * @protected
    */
    move: function(){

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

        //Update the game when the player moves
        this.game.update();

    }

};