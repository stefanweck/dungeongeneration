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
	 * @property {Roguelike.Entity} player - Reference to the player object
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

		//Initialize the map
		this.map = new Roguelike.Map(this);
		this.map.initialize();

		//Add a new entity group to the map
		this.map.entities = new Roguelike.Group(this);

		//Generate rooms for this map
		this.map.mapFactory.generateRooms();
		this.map.addRooms();

		//Generate the corridors on this map
		this.map.mapFactory.generateCorridors();

		//Generate doors on this map
		this.map.mapFactory.generateDoors();

		//Add all objects to the map
		this.map.mapFactory.placeEntranceExitObjects();

		//Create the camera object
		this.camera = new Roguelike.Camera(this, {x: 0, y: 0});

		//Add a lightsource at the player's position
		this.lightSource = new Roguelike.LightSource(
			this,
			{
				radius: 8,
				gradient: true
			}
		);

		//Create the player entity
		this.player = new Roguelike.Entity();

		//Give the player a health of 100 points
		this.player.addComponent(new Roguelike.Components.Health(100));

		//The starting position of the player is at the dungeon's entrance
		this.player.addComponent(new Roguelike.Components.Position(this.map.entrance.x, this.map.entrance.y));

		//The player has a sprite ( color for now )
		this.player.addComponent(new Roguelike.Components.Sprite("#FF7300"));

		//The player must be controllable by the keyboards arrow keys
		this.player.addComponent(new Roguelike.Components.KeyboardControl());

		//Add the player to the entities list of the current map
		this.map.entities.addEntity(this.player);

		//Add all systems to the game
		this.systems.push(new Roguelike.Systems.Collision(this));
		this.systems.push(new Roguelike.Systems.Open(this));
		this.systems.push(new Roguelike.Systems.Control(this));
		this.systems.push(new Roguelike.Systems.Render(this));

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

		//Get the players position
		var playerPosition = this.player.getComponent("position");

		//Update the lightsource
		var newLight = this.lightSource.update(playerPosition.x, playerPosition.y);

		//Update the tiles on the map with the new light levels
		for(var i = 0; i < newLight.length; i++) {
			this.map.tiles[newLight[i].y][newLight[i].x].lightLevel = newLight[i].lightLevel;
			this.map.tiles[newLight[i].y][newLight[i].x].explored = true;
		}

		//Update the camera
		this.camera.update();

		//Render the changes
		this.renderer.clear();
		this.renderer.drawMap();

		//Update each system
		for(var s = 0; s < this.systems.length; s++){
			this.systems[s].update();
		}

		this.renderer.drawLightMap();

	}

};
