/*
* Game Constructor
* 
* @class Roguelike.game
* @classdesc The heart of this roguelike game! In here we provide access to
* all the other objects and function, and we handle the startup of the game
*
* @param {object} userSettings - The settings that the user provides
*/
Roguelike.Game = function(userSettings){

    /*
    * @property {bool} isInitialized - Boolean to see if the game is allready initialized
    */
    this.isInitialized = false;

    /*
    * @property {Roguelike.Map} map - Reference to the current map
    */
    this.map = null;

    /*
    * @property {Roguelike.Player} player - Reference to the player object
    */
    this.player = null;

    /*
    * @property {Roguelike.Renderer} map - Reference to the current renderer
    */
    this.renderer = null;

    /*
    * @property {object} settings - The default settings
    */
    this.settings = {
        canvas: null,
        tilesX: 60,
        tilesY: 40,
        tileSize: 20,
        maxRooms: 10,
        minRoomWidth: 6,
        maxRoomWidth: 12,
        minRoomHeight: 6,
        maxRoomHeight: 12,
        debug: false
    };

    //Extend the default settings with those of the user
    this.settings = Roguelike.Utils.extend(this.settings, userSettings);

    //Initialize itself
    this.initialize();

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
    initialize: function(){

        //Check if the game is allready initialized
        if(this.isInitialized){
            return;
        }

        //Check if the debugged has to be initialized
        if(this.settings.debug === true){
            canvas.addEventListener('mousemove', Roguelike.Utils.debugTiles, false);
        }

        //Initialize the map
        this.map = new Roguelike.Map(this);
        this.map.initialize();

        //Generate rooms for this map
        this.map.roomFactory.generateRooms(this);
        this.map.addRooms();

        //Add the player in the mix
        this.player = new Roguelike.Player(this, {x: 10, y: 10});

        //Draw the map on canvas
        this.renderer = new Roguelike.Renderer(this);
        this.renderer.drawMap();
        this.renderer.drawPlayer();

        //The game is fully initialized!
        this.isInitialized = true;

    }

};