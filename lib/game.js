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
    * @property {Roguelike.Controls} controls - The object that handles user input
    */
    this.controls = null;

    /*
    * @property {Roguelike.Map} map - Reference to the current map
    */
    this.map = null;

    /*
    * @property {Roguelike.Camera} camera - Reference to the camera
    */
    this.camera = null;

    /*
    * @property {Roguelike.Player} player - Reference to the player object
    */
    this.player = null;

    /*
    * @property {Roguelike.LightSource} lightsource - Reference to lightsource
    */
    this.lightSource = null;

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

        //Set this to the currentgame variable, so all the stupid Event Listeners
        //and Intervals know what is going on
        var currentGame = this;

        //Initialize the tracking of the players input
        this.controls = new Roguelike.Controls();

        function keyDownFunction(e){
            currentGame.controls.keyDown(e);
        }
        function keyUpFunction(e){
            currentGame.controls.keyUp(e);
        }
        window.addEventListener('keydown', keyDownFunction, false);
        window.addEventListener('keyup', keyUpFunction, false);

        //Initialize the map
        this.map = new Roguelike.Map(this);
        this.map.initialize();

        //Generate rooms for this map
        this.map.mapFactory.generateRooms();
        this.map.addRooms();

        //Add all objects to the map
        this.map.mapFactory.placeEntranceExitObjects();

        //Create the camera object
        this.camera = new Roguelike.Camera(this, {x: 0, y: 0});

        //Add the player in the mix
        this.player = new Roguelike.Player(this, this.map.entrance);

        //Add a lightsource at the player's position
        this.lightSource = new Roguelike.LightSource(
            this, 
            {
                radius: 8,
                gradient: true,
                getLightLevel: function(x, y){
                    return this.game.map.tiles[y][x].blockLight;
                }
            }
        );

        //Let the camera follow the player object
        this.camera.follow(this.player, this.settings.canvas.width / 2, this.settings.canvas.height / 2);

        //Draw the map on canvas
        this.renderer = new Roguelike.Renderer(this);
        this.renderer.drawMap();
        this.renderer.drawPlayer();

        //Call the gameloop
        updateInterval = setInterval(function(){
            currentGame.update();
        //TODO: Make this configurable, STEP/(INTERVAL/FPS)
        }, 1000/(1000/30));

        //The game is fully initialized!
        this.isInitialized = true;

    },

    /*
    * All the functions that need to be executed everytime the game updates
    * Basically the game loop
    * @protected
    *
    */
    update: function(){

        //Update the player
        this.player.update();

        //Update the lightsource
        var newLight = this.lightSource.update(this.player.position.x, this.player.position.y);

        for(var i = 0; i < newLight.length; i++) {
            this.map.tiles[newLight[i].y][newLight[i].x].lightLevel = newLight[i].lightLevel;
            this.map.tiles[newLight[i].y][newLight[i].x].explored = true;
        }

        //Update the camera
        this.camera.update();

        //Render the changes
        this.renderer.update();

    },

};