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

		//Initialize the map
		this.map = new Roguelike.Map(this);

		//Create the map factory
		this.mapFactory = new Roguelike.MapFactory(this);

		//Create the map factory
		this.mapDecorator = new Roguelike.MapDecorator(this);

		//Add a new entity group to the map
		this.map.entities = new Roguelike.Group(this);

		//Create a new scheduler
		this.scheduler = new Roguelike.Scheduler();

		//Generate rooms for this map
		this.mapFactory.generateRooms();

		this.mapDecorator.decorateMap();

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

		//Add the player to the entities list of the current map
		this.map.entities.addEntity(this.player);

		//Get the tile that the player is going to spawn on
		var startingTile = this.map.tiles[playerPosition.x][playerPosition.y];

		//Add the player to the tile it spawns on
		startingTile.addEntity(this.player);

		//Add the player to the scheduler
		this.scheduler.add(this.player, true);

		//Let the camera follow the player entity
		this.camera.follow(this.player, this.settings.canvas.width / 2, this.settings.canvas.height / 2);

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


	}

};
