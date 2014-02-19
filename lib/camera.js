/*
* Camera constructor
* 
* @class Roguelike.Camera
* @classdesc A Camera that follows an object in the viewport on the canvas
*
* @property {Roguelike.Game} game - Reference to the current game object
* @param {object} position - The x and y coordinate of this Camera, in tiles
*/
Roguelike.Camera = function(game, position){

    /*
    * @property {Roguelike.Game} game - Reference to the current game object
    */
    this.game = game;

    /*
    * @property {object} position - The x and y top left coordinates of this camera, in tiles
    */
    this.position = position;

    /*
    * @property {int} viewportWidth - The width of the game's canvas
    */
    this.viewportWidth = game.settings.canvas.width;

    /*
    * @property {int} viewportHeight - The height of the game's canvas
    */
    this.viewportHeight = game.settings.canvas.height;

    /*
    * @property {object} followObject - The object that should be followed by the camera
    */
   this.followObject = null;

};

Roguelike.Camera.prototype = {

    /*
    * Function to call when you want to follow a specific object
    * @protected
    *
    * @param {object} followObject - The object that should be followed by the camera
    */
    follow: function(followObject){

        //Set the follow object to be the object that's passed along
        this.followObject = followObject;

    }

};