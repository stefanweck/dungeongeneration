/*
* Game Constructor
* 
* @class Roguelike.game
* @classdesc The heart of this roguelike game! In here we provide access to
* all the other objects and function, and we handle the startup of the game
* 
*/
Roguelike.Game = function(){

    /*
    * @property {bool} isInitialized - Boolean to see if the game is allready initialized
    */
   this.isInitialized = false;

    /*
    * @property {Roguelike.Map} map - Reference to the current map
    */
    this.map = null;

    /*
    * @property {Roguelike.Renderer} map - Reference to the current map
    */
   this.renderer = null;

};

Roguelike.Game.prototype = {

    /*
    * Initialize the game, create all objects
    * @protected
    *
    * @param {int} tileX - The number of tiles on the X axis
    * @param {int} tileY - The number of tiles on the Y axis
    * @param {int} maxRooms - The maximum number of rooms in a map
    */
    initialize: function(tileX, TilexY, maxRooms){

        //Check if the game is allready initialized
        if(this.isInitialized){
            return;
        }

        //Initialize the map
        this.map = new Roguelike.Map(tileX, TilexY, maxRooms);
        this.map.initialize();

        //Generate rooms for this map
        this.map.roomFactory.generateRooms(this.map);
        this.map.addRooms();

        //Draw the map on canvas
        this.renderer = new Roguelike.Renderer();
        this.renderer.draw(this.map);

    }

};