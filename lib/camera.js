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
    * @property {int} minimumDistanceX - The minimal distance from horizontal borders before the camera starts to move
    */
    this.minimumDistanceX = 0;

    /*
    * @property {int} minimumDistanceY - The minimal distance from vertical borders before the camera starts to move
    */
    this.minimumDistanceY = 0;

    /*
    * @property {object} followObject - The object that should be followed by the camera
    */
    this.followObject = null;

    /*
    * @property {Roguelike.Boundary} viewportBoundary - The boundary that represents the viewport
    */
    this.viewportBoundary = new Roguelike.Boundary(
        this.position.x,
        this.position.y,
        viewportWidth,
        viewportHeight
    );

    /*
    * @property {Roguelike.Boundary} mapBoundary - The boundary that represents the viewport
    */
    this.mapBoundary = new Roguelike.Boundary(
        0,
        0,
        game.settings.tilesX * game.settings.tileSize,
        game.settings.tilesY * game.settings.tileSize
    );

};

Roguelike.Camera.prototype = {

    /*
    * Function to call when you want to follow a specific object
    * @protected
    *
    * @param {object} followObject - The object that should be followed by the camera
    * @param {int} minimumDistanceX - The minimal distance from horizontal borders before the camera starts to move
    * @param {int} minimumDistanceY - The minimal distance from vertical borders before the camera starts to move
    */
    follow: function(followObject, minimumDistanceX, minimumDistanceY){

        //Set the follow object to be the object that's passed along
        //Object needs to have a position variable, containing an
        //X and an Y value, in tiles
        this.followObject = followObject;
        this.minimumDistanceX = minimumDistanceX;
        this.minimumDistanceY = minimumDistanceY;

    },

    /*
    * Function to update the camera to a new position, for example following an object
    * @protected
    */
    update: function(){

        //Check if the camera even has to move
        if(this.followObject !== null){

            //Move the camera horizontal first
            if(this.followObject.x - this.position.x  + this.minimumDistanceX > this.viewportWidth){

                //Set the new horizontal position for the camera
                this.position.x = this.followObject.x - (this.viewportWidth - this.minimumDistanceX);

            }else if(this.followObject.x  - this.minimumDistanceX < this.position.x){

                //Set the new horizontal position for the camera
                this.position.x = this.followObject.x  - this.minimumDistanceX;

            }

            //Then move the camera vertical
            if(this.followObject.y - this.position.y  + this.minimumDistanceY > this.viewportHeight){

                //Set the new vertical position for the camera
                this.position.y = this.followObject.y - (this.viewportHeight - this.minimumDistanceY);

            }else if(this.followObject.y  - this.minimumDistanceY < this.position.y){

                //Set the new vertical position for the camera
                this.position.y = this.followObject.y  - this.minimumDistanceY;

            }

        }

        //Now we update our viewport's boundaries
        this.viewportBoundary.set(this.position.x, this.position.y);

        //We don't want the camera leaving the world's boundaries, for obvious reasons
        if(!this.viewportBoundary.within(this.mapBoundary)){

            //Left
            if(this.viewportBoundary.left < this.mapBoundary.left){
                this.xView = this.mapBoundary.left;
            }

            //Top
            if(this.viewportBoundary.top < this.mapBoundary.top){               
                this.yView = this.mapBoundary.top;
            }

            //Right
            if(this.viewportBoundary.right > this.mapBoundary.right){
                this.xView = this.mapBoundary.right - this.wView;
            }

            //Bottom
            if(this.viewportBoundary.bottom > this.mapBoundary.bottom){                    
                this.yView = this.mapBoundary.bottom - this.hView;
            }

        }

    }

};