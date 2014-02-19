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
    this.position = position;

    /*
    * @property {int} speed - The speed of the player
    */
    this.speed = 200;

};

Roguelike.Player.prototype = {

    /*
    * The function that get's called every game loop
    * @protected
    *
    * @param {int} step - The time between frames, in seconds
    */
    update: function(step){

        //Check which controls are being pressed and update the player accordingly
        if(game.controls.left){
            this.position.x -= this.game.settings.tileSize;
        }
        if(game.controls.up){
            this.position.y -= this.game.settings.tileSize;
        }
        if(game.controls.right){
            this.position.x += this.game.settings.tileSize;
        }
        if(game.controls.down){
            this.position.y += this.game.settings.tileSize;
        }

    }

};