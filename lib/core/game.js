/**
 * Game Constructor
 *
 * @class Roguelike.game
 * @classdesc The heart of this roguelike game! In here we provide access to
 * all the other objects and function, and we handle the startup of the game
 *
 * @param {object} userSettings - The settings that the user provides
 */
Roguelike.Game = function(userSettings) {

	/**
	 * @property {bool} isInitialized - Boolean to see if the game is already initialized
	 */
	this.isInitialized = false;

	/**
	 * @property {Roguelike.Map} map - Reference to the current map
	 */
	this.map = null;

	/**
	 * @property {Roguelike.Systems} systems - An array with all the current systems
	 */
	this.systems = [];

	/**
	 * @property {Roguelike.Camera} camera - Reference to the camera
	 */
	this.camera = null;

	/**
	 * @property {Roguelike.Keyboard} keyboard - Reference to the keyboard object
	 */
	this.keyboard = null;

	/**
	 * @property {Roguelike.Player} player - Reference to the player object
	 */
	this.player = null;

	/**
	 * @property {Roguelike.LightSource} lightsource - Reference to lightsource
	 */
	this.lightSource = null;

	/**
	 * @property {Roguelike.Renderer} map - Reference to the current renderer
	 */
	this.renderer = null;

	/**
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

	/**
	 * Initialize the game, create all objects
	 * @protected
	 */
	initialize: function() {

		//Check if the game is already initialized
		if(this.isInitialized) {
			return;
		}

		//Create a new keyboard
		this.keyboard = new Roguelike.Keyboard(this);
		this.keyboard.initialize();

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
				gradient: true
			}
		);

		//Add a new entity group to the game
		this.map.entities = new Roguelike.Group(this);

		//Let the camera follow the player object
		this.camera.follow(this.player, this.settings.canvas.width / 2, this.settings.canvas.height / 2);

		//Draw the map on canvas
		this.renderer = new Roguelike.Renderer(this);

		//Update the game for the first time
		this.update();

		//The game is fully initialized!
		this.isInitialized = true;

	},

	/**
	 * All the functions that need to be executed every time the game updates
	 * Basically the game loop
	 * @protected
	 */
	update: function() {

		//Update each system
		for(var s = 0; s < this.systems.length; s++){
			this.systems[s].update();
		}

		//Update the lightsource
		var newLight = this.lightSource.update(this.player.position.x, this.player.position.y);

		//Update the tiles on the map with the new light levels
		for(var i = 0; i < newLight.length; i++) {
			this.map.tiles[newLight[i].y][newLight[i].x].lightLevel = newLight[i].lightLevel;
			this.map.tiles[newLight[i].y][newLight[i].x].explored = true;
		}

		//Update the camera
		this.camera.update();

		//Render the changes
		this.renderer.update();

	}

};
