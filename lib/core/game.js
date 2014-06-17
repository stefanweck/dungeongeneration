/**
 * Game Constructor
 *
 * @class Roguelike.game
 * @classdesc The heart of this roguelike game! In here we provide access to
 * all the other objects and function, and we handle the startup of the game
 *
 * @param {Object} userSettings - The settings that the user provides
 */
Roguelike.Game = function(userSettings) {

	/**
	 * @property {Boolean} isInitialized - Boolean to see if the game is already initialized
	 */
	this.isInitialized = false;

	/**
	 * @property {Boolean} isActive - Boolean to see if the game is currently active
	 */
	this.isActive = false;

	/**
	 * @property {Roguelike.Map} map - Reference to the current map
	 */
	this.map = null;

	/**
	 * @property {Roguelike.MapFactory} mapFactory - The mapFactory is responsible for creating rooms and corridors on this map
	 */
	this.mapFactory = null;

	/**
	 * @property {Roguelike.MapDecorator} mapDecorator - The mapDecorator is responsible for decorating the map with props and enemies
	 */
	this.mapDecorator = null;

	/**
	 * @property {Roguelike.Keyboard} keyboard - Reference to the keyboard object
	 */
	this.keyboard = null;

	/**
	 * @property {Roguelike.Scheduler} scheduler - Reference to the scheduler object
	 */
	this.scheduler = null;

	/**
	 * @property {Roguelike.Systems} staticSystems - An object with all the static systems
	 */
	this.staticSystems = {};

	/**
	 * @property {Roguelike.Systems} dynamicSystems - An array with all the current systems that need to be looped
	 */
	this.dynamicSystems = [];

	/**
	 * @property {Roguelike.Camera} camera - Reference to the camera
	 */
	this.camera = null;

	/**
	 * @property {Roguelike.UI.Container} ui - Reference to the global UI container
	 */
	this.ui = null;

	/**
	 * @property {Roguelike.Entity} player - Reference to the player object
	 */
	this.player = null;

	/**
	 * @property {Object} settings - The default settings
	 */
	this.settings = {
		canvas: null,
		cameraBounds: false,
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
		this.keyboard = new Roguelike.Keyboard();

		//Create a new scheduler
		this.scheduler = new Roguelike.Scheduler();

		//Initialize the map
		this.initializeMap();

		//Create the camera object
		this.camera = new Roguelike.Camera(this, {x: 0, y: 0});

		//Get the start position of the player
		var playerPosition = new Roguelike.Vector2(this.map.entrance.x, this.map.entrance.y);

		//Associative array with every control that this entity uses
		var playerControls = {};
		playerControls["left"] = 65;
		playerControls["right"] = 68;
		playerControls["up"] = 87;
		playerControls["down"] = 83;

		//Create the player entity
		this.player = Roguelike.PlayerFactory.newPlayerWarrior(this, playerPosition, playerControls);

		//Initialize the player
		this.initializePlayer();

		//Initialize the movement system
		this.staticSystems.movementSystem = new Roguelike.Systems.Movement(this);

		//Initialize the movement system
		this.staticSystems.pathfindingSystem = new Roguelike.Systems.PathFinding(this);

		//Initialize the combat system
		this.staticSystems.combatSystem = new Roguelike.Systems.Combat(this);

		//Initialize the open system
		this.staticSystems.openSystem = new Roguelike.Systems.Open(this);

		//Add all systems to the game that need to be looped
		this.dynamicSystems.push(new Roguelike.Systems.LightMap(this));
		this.dynamicSystems.push(new Roguelike.Systems.Render(this));

		//Initialize the UI
		this.initializeUI();

		//Update the game for the first time
		this.update();

		//The game is fully initialized!
		this.isInitialized = true;

		//Make the game active for the first time
		this.isActive = true;

	},

	/**
	 * Creates and populates a new map
	 * @protected
	 */
	initializeMap: function() {

		//Initialize the map
		this.map = new Roguelike.Map(this);

		//Create the map factory
		this.mapFactory = new Roguelike.MapFactory(this);

		//Create the map decorator
		this.mapDecorator = new Roguelike.MapDecorator(this);

		//Add a new entity group to the map
		this.map.entities = new Roguelike.Group(this);

		//Generate rooms for this map
		this.mapFactory.generateRooms();

		this.mapDecorator.decorateMap();

	},

	/**
	 * Initializes and adds the player to the game
	 * @protected
	 */
	initializePlayer: function() {

		//Get the start position of the player from the map
		var startPosition = new Roguelike.Vector2(this.map.entrance.x, this.map.entrance.y);

		//Set the player's start position
		var playerPosition = this.player.getComponent("position");
		playerPosition.position = startPosition;

		//Restore the player's health
		var playerHealth = this.player.getComponent("health");
		playerHealth.health = playerHealth.maxHealth;

		//Add the player to the entities list of the current map
		this.map.entities.addEntity(this.player);

		//Get the tile that the player is going to spawn on
		var startingTile = this.map.tiles[startPosition.x][startPosition.y];

		//Add the player to the tile it spawns on
		startingTile.addEntity(this.player);

		//Add the player to the scheduler
		this.scheduler.add(this.player, true);

		//Let the camera follow the player entity
		this.camera.follow(this.player, this.settings.canvas.width / 2, this.settings.canvas.height / 2);

	},

	/**
	 * Creates all UI objects and adds them to the global UI container
	 * @protected
	 */
	initializeUI: function() {

		//Create the global UI container
		this.UI = new Roguelike.UI.Container(
			new Roguelike.Vector2(0, 0)
		);

		//Add an element to the UI
		this.UI.addElement(

			new Roguelike.UI.Element.Image(
				new Roguelike.Vector2(20, 20),
				"tileset"
			)

		);

		//Add an element to the UI
		this.UI.addElement(

			new Roguelike.UI.Element.Text(
				new Roguelike.Vector2(20, 20),
				"tileset"
			)

		);

	},

	/**
	 * All the functions that need to be executed every time the game updates
	 * Basically the game loop
	 * @protected
	 */
	update: function() {

		//If the game is not currently active, restart
		if(this.isInitialized && !this.isActive) {

			this.restart();

		}

		//Request a new animation frame and call the update function again
		requestAnimationFrame(this.update.bind(this));

		//While the scheduler is locked, continue ticking
		while(!this.scheduler.lockCount) {

			//Let the scheduler handle the next entity
			this.scheduler.tick();

		}

		//Loop through each dynamic system
		for(var s = 0; s < this.dynamicSystems.length; s++) {

			//Update the current system
			this.dynamicSystems[s].update();

		}


	},

	/**
	 * Restarts the game with a fresh map and player
	 * @protected
	 */
	restart: function() {

		//Clear events from the scheduler
		this.scheduler.clear();

		//Initialize map and player
		this.initializeMap();
		this.initializePlayer();

		//Initialize the pathfinding system with the new game map
		this.staticSystems.pathfindingSystem.game = this;
		this.staticSystems.pathfindingSystem.initialize();

		//Make game active
		this.isActive = true;

	}

};
