//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Utils = require('./utils.js'),
	TextLog = require('../ui/textlog.js'),
	Camera = require('./camera.js'),
	Map = require('../tilemap/map.js'),
	PlayerFactory = require('../factories/playerfactory.js'),
	Vector2 = require('../geometry/vector2.js'),
	Container = require('../ui/container.js'),
	InteractionManager = require('../ui/interactionmanager.js'),
	ImageElement = require('../ui/elements/imageelement.js'),
	TextElement = require('../ui/elements/textelement.js'),
	Group = require('../gameobjects/group.js'),
	Combat = require('../gameobjects/systems/combat.js'),
	LightMap = require('../gameobjects/systems/lightmap.js'),
	Movement = require('../gameobjects/systems/movement.js'),
	Open = require('../gameobjects/systems/open.js'),
	PathFinding = require('../gameobjects/systems/pathfinding.js'),
	Render = require('../gameobjects/systems/render.js'),
	MapFactory = require('../tilemap/mapfactory.js'),
	MapDecorator = require('../tilemap/mapdecorator.js'),
	Scheduler = require('../time/scheduler.js'),
	Keyboard = require('../input/keyboard.js');

/**
 * Game Constructor
 *
 * @class Game
 * @classdesc The heart of this roguelike game! In here we provide access to
 * all the other objects and function, and we handle the startup of the game
 *
 * @param {Object} userSettings - The settings that the user provides
 */
var Game = function(userSettings) {

	/**
	 * @property {Boolean} isInitialized - Boolean to see if the game is already initialized
	 */
	this.isInitialized = false;

	/**
	 * @property {Boolean} isActive - Boolean to see if the game is currently active
	 */
	this.isActive = false;

	/**
	 * @property {Map} map - Reference to the current map
	 */
	this.map = null;

	/**
	 * @property {MapFactory} mapFactory - The mapFactory is responsible for creating rooms and corridors on this map
	 */
	this.mapFactory = null;

	/**
	 * @property {MapDecorator} mapDecorator - The mapDecorator is responsible for decorating the map with props and enemies
	 */
	this.mapDecorator = null;

	/**
	 * @property {Keyboard} keyboard - Reference to the keyboard object
	 */
	this.keyboard = null;

	/**
	 * @property {Scheduler} scheduler - Reference to the scheduler object
	 */
	this.scheduler = null;

	/**
	 * @property {Object} staticSystems - An object with all the static systems
	 */
	this.staticSystems = {};

	/**
	 * @property {Array} dynamicSystems - An array with all the current systems that need to be looped
	 */
	this.dynamicSystems = [];

	/**
	 * @property {Camera} camera - Reference to the camera
	 */
	this.camera = null;

	/**
	 * @property {Container} UI - Reference to the global UI container
	 */
	this.UI = null;

	/**
	 * @property {InteractionManager} interactionmanager - Reference to the interactionmanager
	 */
	this.interactionmanager = null;

	/**
	 * @property {TextLog} textLog - Reference to the TextLog object
	 */
	this.textLog = null;

	/**
	 * @property {Entity} player - Reference to the player object
	 */
	this.player = null;

	/**
	 * @property {PIXI.Stage} stage - The Pixi stage object
	 */
	this.stage = null;

	/**
	 * @property {PIXI.CanvasRenderer|PIXI.WebGLRenderer} renderer - The Pixi renderer
	 */
	this.renderer = null;

	/**
	 * @property {Object} settings - The default settings
	 */
	this.settings = {
		canvas: null,
		cameraBounds: false,
		debug: false
	};

	//Extend the default settings with those of the user
	this.settings = Utils.extend(this.settings, userSettings);

	//Initialize itself
	this.initialize();

};

Game.prototype = {

	/**
	 * Initialize the game, create all objects
	 * @protected
	 */
	initialize: function() {

		//Check if the game is already initialized
		if(this.isInitialized) {
			return;
		}

		//Create the PIXI stage object
		this.stage = new PIXI.Stage(0x000000);

		//Auto detect the best renderer
		this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight / 2);

		//Add the renderer view element to the DOM
		document.body.appendChild(this.renderer.view);

		//Create a new keyboard
		this.keyboard = new Keyboard();

		//Create a new scheduler
		this.scheduler = new Scheduler();

		//Initialize the map
		this.initializeMap();

		//Create the camera object
		this.camera = new Camera(this, {x: 0, y: 0});

		//Get the start position of the player
		var playerPosition = new Vector2(this.map.entrance.x, this.map.entrance.y);

		//Associative array with every control that this entity uses
		var playerControls = {
			"left": 65,
			"right": 68,
			"up": 87,
			"down": 83
		};

		//Create the player entity
		this.player = PlayerFactory.newPlayerWarrior(this, playerPosition, playerControls);

		//Initialize the player
		this.initializePlayer();

		//Initialize the movement system
		this.staticSystems.movementSystem = new Movement(this);

		//Initialize the movement system
		this.staticSystems.pathfindingSystem = new PathFinding(this);

		//Initialize the combat system
		this.staticSystems.combatSystem = new Combat(this);

		//Initialize the open system
		this.staticSystems.openSystem = new Open(this);

		//Add all systems to the game that need to be looped
		this.dynamicSystems.push(new LightMap(this));
		this.dynamicSystems.push(new Render(this));

		//Create a new text log
		this.textLog = new TextLog(this);
		this.textLog.initialize();

		//Add another string to the message
		var textLogMessage = "You enter the basement and look around";

		//Add the message to the textlog
		this.textLog.add(textLogMessage);

		//Create a new interaction manager
		this.interactionmanager = new InteractionManager(this.settings.canvas);

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
		this.map = new Map(this);

		//Create the map factory
		this.mapFactory = new MapFactory(this);

		//Create the map decorator
		this.mapDecorator = new MapDecorator(this);

		//Add a new entity group to the map
		this.map.entities = new Group(this);

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
		var startPosition = new Vector2(this.map.entrance.x, this.map.entrance.y);

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
		var UI = new Container(
			new Vector2(0, 0),
			null
		);

		//Store the UI in the game object
		this.UI = UI;

		//Create the bottom bar container
		var bottomBar = new Container(
			new Vector2((this.settings.canvas.width / 2) - 418, this.settings.canvas.height - 100),
			UI,
			940,
			100
		);

		//Loop 9 times to create all the left slots
		for(var i = 0; i < 18; i++) {

			//The default distance is 0
			var distance = 0;

			//And we only add it whenever we are starting at the second bar of quick slots
			if(i > 8) {
				distance = 48;
			}

			//Create the item slot container
			var iconSlot = new Container(
				new Vector2(i * 44 + distance, 15),
				bottomBar,
				44,
				44
			);

			//Add the background image
			iconSlot.addElement(
				new ImageElement(
					new Vector2(0, 0),
					iconSlot,
					"itemslot",
					3
				)
			);

			//Create the little text in the corner
			iconSlot.addElement(
				new TextElement(
					new Vector2(28, 28),
					iconSlot,
					i + 1,
					"#606060",
					10
				)
			);

			//Add a function the onHover object from the item slot container
			iconSlot.onClick = function(index) {
				return function() {
					console.log("Quickslot number " + index);
				};
			}(i + 1);

			//Add the slot to the bottom bar
			bottomBar.addElement(iconSlot);

			//Add the iconSlot to the interactive elements list
			this.interactionmanager.elements.push(iconSlot);

		}

		//Add the bottom bar to the UI
		this.UI.addElement(bottomBar);

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

		//Render the stage
		this.renderer.render(this.stage);


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

		//Clear the textlog from the previous game
		this.textLog.clear();

		//Make game active
		this.isActive = true;

	}

};

//Export the Browserify module
module.exports = Game;
