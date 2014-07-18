//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Utils = require('./utils.js'),
	TextLog = require('../ui/textlog.js'),
	QuickslotBar = require('../ui/quickslotbar.js'),
	SpellBar = require('../ui/spellbar.js'),
	Camera = require('./camera.js'),
	Map = require('../tilemap/map.js'),
	PlayerFactory = require('../factories/playerfactory.js'),
	Vector2 = require('../geometry/vector2.js'),
	InteractionManager = require('../ui/interactionmanager.js'),
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
		//Nothing for now
	};

	//Extend the default settings with those of the user
	this.settings = Utils.extend(this.settings, userSettings);

	//Load and then initialize itself
	this.load();

};

Game.prototype = {

	load: function(){

		//Tell PIXI.js to scale the images with Nearest Neighbour and not Linear
		PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;

		//Create an array with all assets that need to be loaded
		var assetsToLoader = ["assets/tilesets/dungeon.json"];

		//Create a new PIXI.AssetLoader object
		var loader = new PIXI.AssetLoader(assetsToLoader);

		//Define the callback when the loader has finished
		loader.onComplete = this.initialize.bind(this);

		//Start loading the assets
		loader.load();

	},

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
		this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);

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

		//Create a new stats component that handles measuring the FPS and milliseconds it takes to generate 1 frame
		this.stats = new Stats();
		this.stats.setMode(0); // 0: fps, 1: ms

		//Align top-left
		this.stats.domElement.style.position = 'absolute';
		this.stats.domElement.style.right = '10px';
		this.stats.domElement.style.top = '10px';

		//Append the new element to the body
		document.body.appendChild(this.stats.domElement );

		//Create a new text log and initialize it, thus adding it to the PIXI stage
		this.textLog = new TextLog(this);
		this.textLog.initialize();

		//Add another string to the message
		var textLogMessage = "You enter the basement and look around";

		//Add the message to the textlog
		this.textLog.addMessage(textLogMessage);

		this.quickslotBar = new QuickslotBar(this);
		this.quickslotBar.initialize();

		this.spellBar = new SpellBar(this);
		this.spellBar.initialize();

	},

	/**
	 * All the functions that need to be executed every time the game updates
	 * Basically the game loop
	 * @protected
	 */
	update: function() {

		//Start measuring the FPS
		this.stats.begin();

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

		//Stop measuring the FPS
		this.stats.end();

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
