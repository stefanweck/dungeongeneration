(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Boundary = require('../geometry/boundary.js');

/**
 * Camera constructor
 *
 * @class Camera
 * @classdesc A Camera that follows an object in the viewport on the canvas
 *
 * @param {Game} game - Reference to the current game object
 * @param {Object} position - The x and y coordinate of this Camera, in pixels
 */
var Camera = function(game, position) {

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Object} position - The x and y top left coordinates of this camera, in pixels
	 */
	this.position = position;

	/**
	 * @property {Number} viewportWidth - The width of the game's canvas, in pixels
	 */
	this.viewportWidth = game.settings.canvas.width;

	/**
	 * @property {Number} viewportHeight - The height of the game's canvas, in pixels
	 */
	this.viewportHeight = game.settings.canvas.height;

	/**
	 * @property {Number} minimumDistanceX - The minimal distance from horizontal borders before the camera starts to move, in pixels
	 */
	this.minimumDistanceX = 0;

	/**
	 * @property {Number} minimumDistanceY - The minimal distance from vertical borders before the camera starts to move, in pixels
	 */
	this.minimumDistanceY = 0;

	/**
	 * @property {Object} followObject - The object that should be followed by the camera
	 */
	this.followObject = null;

	/**
	 * @property {Boundary} viewportBoundary - The boundary that represents the viewport
	 */
	this.viewportBoundary = new Boundary(
		this.position.x * game.map.settings.tileSize,
		this.position.y * game.map.settings.tileSize,
		this.viewportWidth,
		this.viewportHeight
	);

	/**
	 * @property {Boundary} mapBoundary - The boundary that represents the viewport
	 */
	this.mapBoundary = new Boundary(
		0,
		0,
		game.map.settings.tilesX * game.map.settings.tileSize,
		game.map.settings.tilesY * game.map.settings.tileSize
	);

};

Camera.prototype = {

	/**
	 * Function to call when you want to follow a specific entity
	 * @protected
	 *
	 * @param {Entity} followEntity - The entity that should be followed by the camera, this entity is required to have the position component
	 * @param {Number} minimumDistanceX - The minimal distance from horizontal borders before the camera starts to move
	 * @param {Number} minimumDistanceY - The minimal distance from vertical borders before the camera starts to move
	 */
	follow: function(followEntity, minimumDistanceX, minimumDistanceY) {

		//Set the follow object to be the object that's passed along
		//Object needs to have a position component, containing an
		//X and an Y value, in tiles
		this.followObject = followEntity.components.position;

		//Set the minimum distance from the borders of the map
		this.minimumDistanceX = minimumDistanceX;
		this.minimumDistanceY = minimumDistanceY;

	},

	/**
	 * Function to update the camera to a new position, for example following an object
	 * @protected
	 */
	update: function() {

		//Check if the camera even has to move
		if(this.followObject !== null) {

			//Define the variables needed for moving the camera
			var tileSize = this.game.map.settings.tileSize;

			//Move the camera horizontal first
			//We Math.floor the final position so the position is always a rounded number. This prevents the pixel scaling from trying to enlarge half pixels and thus providing weird graphics.
			if((this.followObject.position.x * tileSize) - this.position.x + this.minimumDistanceX > this.viewportWidth) {

				//Set the new horizontal position for the camera
				this.position.x = Math.floor((this.followObject.position.x * tileSize) - (this.viewportWidth - this.minimumDistanceX));

			}else if((this.followObject.position.x * tileSize) - this.minimumDistanceX < this.position.x) {

				//Set the new horizontal position for the camera
				this.position.x = Math.floor((this.followObject.position.x * tileSize) - this.minimumDistanceX);

			}

			//Then move the camera vertical
			//We Math.floor the final position so the position is always a rounded number. This prevents the pixel scaling from trying to enlarge half pixels and thus providing weird graphics.
			if((this.followObject.position.y * tileSize) - this.position.y + this.minimumDistanceY > this.viewportHeight) {

				//Set the new vertical position for the camera
				this.position.y = Math.floor((this.followObject.position.y * tileSize) - (this.viewportHeight - this.minimumDistanceY));

			}else if((this.followObject.position.y * tileSize) - this.minimumDistanceY < this.position.y) {

				//Set the new vertical position for the camera
				this.position.y = Math.floor((this.followObject.position.y * tileSize) - this.minimumDistanceY);

			}

		}

		//Now we update our viewport's boundaries
		this.viewportBoundary.set(this.position.x, this.position.y);

		//Check if we don't want the camera leaving the world's boundaries, and if it's needed to correct that
		if(this.game.settings.cameraBounds && !this.viewportBoundary.isWithin(this.mapBoundary)) {

			//Left
			if(this.viewportBoundary.left < this.mapBoundary.left) {
				this.position.x = this.mapBoundary.left;
			}

			//Top
			if(this.viewportBoundary.top < this.mapBoundary.top) {
				this.position.y = this.mapBoundary.top;
			}

			//Right
			if(this.viewportBoundary.right > this.mapBoundary.right) {
				this.position.x = this.mapBoundary.right - this.viewportWidth;
			}

			//Bottom
			if(this.viewportBoundary.bottom > this.mapBoundary.bottom) {
				this.position.y = this.mapBoundary.bottom - this.viewportHeight;
			}

		}

	}

};

//Export the Browserify module
module.exports = Camera;

},{"../geometry/boundary.js":8}],2:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Utils = require('./utils.js'),
    TextLog = require('./textlog.js'),
    Camera = require('./camera.js'),
    Map = require('../tilemap/map.js'),
    Vector2 = require('../geometry/vector2.js'),
    Group = require('../gameobjects/group.js'),
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
	 * @property {Roguelike.Systems} staticSystems - An object with all the static systems
	 */
	this.staticSystems = {};

	/**
	 * @property {Roguelike.Systems} dynamicSystems - An array with all the current systems that need to be looped
	 */
	this.dynamicSystems = [];

	/**
	 * @property {Camera} camera - Reference to the camera
	 */
	this.camera = null;

	/**
	 * @property {Roguelike.UI.Container} UI - Reference to the global UI container
	 */
	this.UI = null;

	/**
	 * @property {TextLog} textLog - Reference to the TextLog object
	 */
	this.textLog = null;

	/**
	 * @property {Entity} player - Reference to the player object
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
			"right":68,
			"up":87,
			"down":83
		};

		//Create the player entity
		this.player = PlayerFactory.newPlayerWarrior(this, playerPosition, playerControls);

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

		//Create a new text log
		this.textLog = new TextLog();

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
		this.UI = new Roguelike.UI.Container(
			new Vector2(0, 0)
		);

		var textLog = new Roguelike.UI.Element.TextLog(
			new Vector2(15, 15),
			this
		);

		this.UI.addElement(textLog);

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

//Export the Browserify module
module.exports = Game;

},{"../gameobjects/group.js":7,"../geometry/vector2.js":9,"../input/keyboard.js":13,"../tilemap/map.js":15,"../tilemap/mapdecorator.js":16,"../tilemap/mapfactory.js":17,"../time/scheduler.js":21,"./camera.js":1,"./textlog.js":3,"./utils.js":4}],3:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * TextLog constructor
 *
 * @class TextLog
 * @classdesc The TextLog holds and stores all messages that entities send to it
 */
var TextLog = function() {

	/**
	 * @property {Array} messages - An array filled with all text log messages
	 */
	this.messages = [];

};

TextLog.prototype = {

	/**
	 * Function to add a new message to the text log
	 * @protected
	 *
	 * @param {String} message - The message that has to be stored
	 */
	addMessage: function(message) {

		//Add the new message
		this.messages.push(message);

	},

	/**
	 * Function that returns all messages
	 * @protected
	 *
	 * @return {Array} The array with all messages
	 */
	getMessages: function() {

		//Return all messages
		return this.messages;

	}

};

//Export the Browserify module
module.exports = TextLog;

},{}],4:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var MersenneTwister = require('../libraries/mersennetwister.js');

/**
 * Static Utilities Class
 *
 * @class Utils
 * @classdesc In this class are the functions stored that are being
 * used in other functions
 */
var Utils = {

	mersenneTwister: new MersenneTwister(404),

	/**
	 * Function to generate a random number between two values
	 * @public
	 *
	 * @param {Number} from - The minimum number
	 * @param {Number} to - The maximum number
	 *
	 * @return {Number} A random number between the two supplied values
	 */
	randomNumber: function(from, to) {

		return Math.floor(this.mersenneTwister.random() * (to - from + 1) + from);

	},

	/**
	 * Function to extend the default options with the users options
	 * @public
	 *
	 * @param {Object} a - The original object to extend
	 * @param {Object} b - The new settings that override the original object
	 *
	 * @return {Object} The extended object
	 */
	extend: function(a, b) {

		//Loop through each key
		for(var key in b) {

			//If the new settings have the key we are looping through
			if(b.hasOwnProperty(key)) {

				//Extend the original object with the new values
				a[key] = b[key];

			}

		}

		//Return the extended object
		return a;

	}

};

//Export the Browserify module
module.exports = Utils;

},{"../libraries/mersennetwister.js":14}],5:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Entity = require('../gameobjects/entity.js');

/**
 * @class PropFactory
 * @classdesc A factory that returns pre made props with
 * a set of components. Props are like decorations but can be touched: boxes, boulders, and doors.
 */
var PropFactory = {

	/**
	 * Function that returns a new entrance to the map
	 * @public
	 *
	 * @param {Game} game - Reference to the currently running game
	 * @param {Vector2} position - The position object of this entity
	 *
	 * @return {Entity} An prop entity
	 */
	newEntrance: function(game, position) {

		//Create the entity
		var entity = new Entity(game, "Entrance");

		//The starting position of the entity
		entity.addComponent(new Position(position));

		//The entity has a sprite ( color for now )
		entity.addComponent(new Roguelike.Components.Sprite("tileset", 3, 1));

		//Return the entity
		return entity;

	},

	/**
	 * Function that returns a new exit to the map
	 * @public
	 *
	 * @param {Game} game - Reference to the currently running game
	 * @param {Vector2} position - The position object of this entity
	 *
	 * @return {Entity} An prop entity
	 */
	newExit: function(game, position) {

		//Create the entity
		var entity = new Entity(game, "Exit");

		//The starting position of the entity
		entity.addComponent(new Position(position));

		//The entity has a sprite ( color for now )
		entity.addComponent(new Roguelike.Components.Sprite("tileset", 3, 0));

		//Return the entity
		return entity;

	},

	/**
	 * Function that returns a new door
	 * @public
	 *
	 * @param {Game} game - Reference to the currently running game
	 * @param {Vector2} position - The position object of this entity
	 *
	 * @return {Entity} An prop entity
	 */
	newDoor: function(game, position) {

		//Create the entity
		var entity = new Entity(game, "Wooden Door");

		//The starting position of the entity
		entity.addComponent(new Position(position));

		//The entity has a sprite ( color for now )
		entity.addComponent(new Roguelike.Components.Sprite("tileset", 2, 2));

		//This entity can be opened up by another entity
		entity.addComponent(new Roguelike.Components.CanOpen(game, entity));

		//You can collide with this entity
		entity.addComponent(new Roguelike.Components.Collide(true));

		//Add a tooltip to this entity
		entity.addComponent(new Roguelike.Components.Tooltip(
			game.settings.canvas,
			entity.name,
			"Closed",
			""
		));

		//Return the entity
		return entity;

	}

};

//Export the Browserify module
module.exports = PropFactory;

},{"../gameobjects/entity.js":6}],6:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Entity constructor
 *
 * @class Entity
 * @classdesc A single entity in the game world
 *
 * @param {Game} game - Reference to the currently running game
 * @param {String} name - The name of this entity
 * @param {Number} speed - The speed of this entity
 */
var Entity = function(game, name, speed) {

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {String} name - The name of this entity
	 */
	this.name = name;

	/**
	 * @property {Number} speed - The speed of this entity
	 */
	this.speed = speed || 1000;

	/**
	 * @property {Object} components - An object filled with all the components this entity has
	 */
	this.components = {};

};

Entity.prototype = {

	/**
	 * Function that gets called when this entity is in a scheduler and it
	 * is his turn
	 * @protected
	 */
	act: function() {

		//If this is a player, lock the scheduler
		if(this.hasComponent("keyboardControl")) {

			this.game.scheduler.lock();

		}else{

			//Get the components
			var movementComponent = this.getComponent("movement");

			//Execute movement component behaviour
			movementComponent.execute();

		}

	},

	/**
	 * A function that returns the speed of this entity
	 * @protected
	 *
	 * @return {Number} The speed of this entity
	 */
	getSpeed: function() {

		return this.speed;

	},

	/**
	 * Check whether this entity has a certain component
	 * @protected
	 *
	 * @param {String} name - The name of the component
	 *
	 * @return {Boolean} True when the entity has the component, false when it doesn't have the component
	 */
	hasComponent: function(name) {

		return (this.components[name] !== undefined);

	},

	/**
	 * Get a certain component on this entity
	 * @protected
	 *
	 * @param {String} name - The name of the component
	 *
	 * @return {Roguelike.Components} The component that this entity has
	 */
	getComponent: function(name) {

		return this.components[name];

	},

	/**
	 * Add an existing component to this entity
	 * @protected
	 *
	 * @param {Roguelike.Components} component - The component that is getting added to this entity
	 */
	addComponent: function(component) {

		//Add the component
		this.components[component.name] = component;

	},

	/**
	 * Remove a component from this entity
	 * @protected
	 *
	 * @param {Roguelike.Components} component - The component that is getting removed from this entity
	 */
	removeComponent: function(component) {

		//Add the component
		this.components[component.name] = undefined;

	}

};

//Export the Browserify module
module.exports = Entity;

},{}],7:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Control constructor
 *
 * @class Group
 * @classdesc The object that holds multiple entities and is able to search them
 *
 * @param {Game} game - A reference to the current game object
 */
var Group = function(game) {

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Array} entities - Collection of all the entities in this group
	 */
	this.entities = [];

};

Group.prototype = {

	/**
	 * Function to add a new entity to this group
	 * @protected
	 *
	 * @param {Entity} entity - A reference to entity being added
	 */
	addEntity: function(entity) {

		//Check if the entity is the correct object
		if(!entity instanceof Entity) {

			return;

		}

		//Add the current entity to the list
		this.entities.push(entity);

	},

	/**
	 * Function to remove an entity from this group
	 * @protected
	 *
	 * @param {Entity} entity - A reference to entity being removed
	 */
	removeEntity: function(entity) {

		//Check if the entity exists, if not, we don't have to delete it
		var index = this.entities.indexOf(entity);

		//The element doesn't exist in the list
		if(index === -1) {

			return;

		}

		//Remove the current entity from the group
		this.entities.splice(index, 1);

	},

	/**
	 * Function to return all entities with certain components
	 * @protected
	 *
	 * @return {Array} The array with all matching entities
	 */
	getEntities: function() {

		//Initialize the array that is going to be returned
		var entitiesMatch = [];

		//Loop through each entity in this group
		for(var i = 0; i < this.entities.length; i++) {

			//Initialize an empty array
			var isThere = [];

			//Loop through the arguments
			for(var a = 0; a < arguments.length; a++) {

				//If the current entity has the specified component. Push a random
				//value into the isThere array for later checks
				if(this.entities[i].components[arguments[a]]) {

					isThere.push(1);

				}

			}

			//If there are as many matches as supplied arguments, every component
			//is available within this entity
			if(isThere.length === arguments.length) {

				//Push the current entity into the array that is returned
				entitiesMatch.push(this.entities[i]);

			}

		}

		//Return all matching entities
		return entitiesMatch;

	}

};

//Export the Browserify module
module.exports = Group;

},{}],8:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Boundary constructor
 *
 * @class Boundary
 * @classdesc A rectangle that represents the whole map or the viewport of the camera
 *
 * @param {Number} left - The left position of this boundary, in pixels
 * @param {Number} top - The top position of this boundary, in pixels
 * @param {Number} width - The width of this boundary, in pixels
 * @param {Number} height - The height of this boundary, in pixels
 */
var Boundary = function(left, top, width, height) {

	/**
	 * @property {Number} left - The left position of this boundary, in pixels
	 */
	this.left = left || 0;

	/**
	 * @property {Number} top - The top position of this boundary, in pixels
	 */
	this.top = top || 0;

	/**
	 * @property {Number} width - The width of this boundary, in pixels
	 */
	this.width = width || 0;

	/**
	 * @property {Number} height - The height of this boundary, in pixels
	 */
	this.height = height || 0;

	/**
	 * @property {Number} right - The right position of this boundary, in pixels
	 */
	this.right = (this.left + this.width);

	/**
	 * @property {Number} bottom - The bottom position of this boundary, in pixels
	 */
	this.bottom = (this.top + this.height);

};

Boundary.prototype = {

	/**
	 * Function that allows the user to set new values for the boundary
	 * @protected
	 *
	 * @param {Number} left - The left position of this boundary, in pixels
	 * @param {Number} top - The top position of this boundary, in pixels
	 * @param {Number} width - Optional: The width of this boundary, in pixels
	 * @param {Number} height - Optional: The height of this boundary, in pixels
	 */
	set: function(left, top, width, height) {

		this.left = left;
		this.top = top;
		this.width = width || this.width;
		this.height = height || this.height;
		this.right = (this.left + this.width);
		this.bottom = (this.top + this.height);

	},

	/**
	 * Function to check if one boundary is still inside another boundary
	 * @protected
	 *
	 * @param {Boundary} boundary - The boundary to check against
	 *
	 * @return {Boolean} Returns true if the boundary is within this boundary, returns false if it isn't
	 */
	isWithin: function(boundary) {

		return(
			boundary.left <= this.left &&
				boundary.right >= this.right &&
				boundary.top <= this.top &&
				boundary.bottom >= this.bottom
			);

	},

	/**
	 * Function to check if one boundary overlaps another boundary
	 * @protected
	 *
	 * @param {Boundary} boundary - The boundary to check against
	 *
	 * @return {Number} Returns true if the boundary is overlapping this boundary, returns false if it isn't
	 */
	isOverlapping: function(boundary) {

		return(
			this.left < boundary.right &&
				boundary.left < this.right &&
				this.top < boundary.bottom &&
				boundary.top < this.bottom
			);

	}

};

//Export the Browserify module
module.exports = Boundary;

},{}],9:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Vector2 constructor
 *
 * @class Vector2
 * @classdesc An Vector2 Object, used by the lightsource class
 *
 * @param {Number} x - The x coordinate of this vector2 object
 * @param {Number} y - The y coordinate of this vector2 object
 */
var Vector2 = function(x, y) {

	/**
	 * @property {Number} x - The x coordinate of this vector2 object
	 */
	this.x = x;

	/**
	 * @property {Number} x - The y coordinate of this vector2 object
	 */
	this.y = y;

};

Vector2.prototype = {

	/**
	 * Add another Vector2 object to this Vector2 object
	 * @protected
	 *
	 * @param {Vector2} other - The other Vector2 object
	 *
	 * @return {Vector2} The combined Vector2 object
	 */
	combine: function(other) {

		//Return the Vector2 object
		return new Vector2(this.x + other.x, this.y + other.y);

	},

	/**
	 * Add another Vector2 object
	 * @protected
	 *
	 * @param {Vector2} other - The other Vector2 object
	 *
	 * @return {Number} The value of both added Vector2 objects
	 */
	add: function(other) {

		var dx = other.x - this.x;
		var dy = other.y - this.y;

		return Math.abs(Math.sqrt((dx * dx) + (dy * dy)));

	},

	/**
	 * Distance to another Vector2 object
	 * @protected
	 *
	 * @param {Object} pos - The position of the other Vector2 object
	 *
	 * @return {Number} The distance to the other Vector2 object
	 */
	distance: function(pos) {

		var dx = pos.x - this.x;
		var dy = pos.y - this.y;

		return Math.abs(Math.sqrt((dx * dx) + (dy * dy)));

	},

	/**
	 * Manhattan distance to another object
	 * @protected
	 *
	 * @param {Object} pos - The position of the other Vector2 object
	 *
	 * @return {Number} The manhattan distance to the other Vector2 object
	 */
	manhattan: function(pos) {

		return(Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y));

	},

	/**
	 * Clone the current Vector2 object
	 * @protected
	 *
	 * @return {Vector2} The cloned Vector2 object
	 */
	clone: function() {

		return(new Vector2(this.x, this.y));

	},

	/**
	 * Create a string from this Vector2 object
	 * @protected
	 *
	 * @return {String} The Vector2 object as a string
	 */
	toString: function() {

		return("(" + this.x + ", " + this.y + ")");

	}

};

//Export the Browserify module
module.exports = Vector2;

},{}],10:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Game = require('./core/game.js');

//The initialize Module
var Intialize = function initializeCanvas() {

	//Initialize the canvas
	var canvas = document.getElementById("canvas");

	//Make the canvas go fullscreen
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	var options = {
		canvas: canvas, //The canvas object on which our dungeon is placed on
		cameraBounds: false,
		debug: false //Boolean to enable or disable the debugger
	};

	//Create a new game
	var game = new Game(options);

};

// shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();

//Initialize when fully loaded
window.addEventListener("load", Intialize);

//Export the Browserify module
module.exports = Intialize;

},{"./core/game.js":2}],11:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Event constructor
 *
 * Inspired by the great tutorial at:
 * https://corcoran.io/2013/06/01/building-a-minimal-javascript-event-system/
 *
 * @class Event
 * @classdesc An object that can announce and listen for events
 *
 */
var Event = function() {

	/**
	 * @property {Object} events - An associative array with all the current events
	 */
	this.events = {};

};

Event.prototype = {

	/**
	 * Function that handles keydown events
	 * @protected
	 *
	 * @param {String} type - The type of event that can be triggered
	 * @param {Function} callback - The function that has to be performed as a callback
	 * @param {Object} context - The object that should be accessible when the event is called
	 */
	on: function(type, callback, context) {

		//If this.events doesn't have the event property, create an empty array
		if(!this.events.hasOwnProperty(type)) {
			this.events[type] = [];
		}

		//Insert the callback into the current event
		this.events[type].push([callback, context]);

	},

	/**
	 * Function that is called when an event is triggered
	 * @protected
	 *
	 * @param {String} type - The type of event that is triggered
	 */
	trigger: function(type) {

		//Because we don't know how many arguments are being send to
		//the callbacks, let's get them all except the first one ( the tail )
		var tail = Array.prototype.slice.call(arguments, 1);

		//Get all the callbacks for the current event
		var callbacks = this.events[type];

		//Check if there are callbacks defined for this key, if not, stop!
		if(callbacks !== undefined) {

			//Loop through the callbacks and run each callback
			for(var i = 0; i < callbacks.length; i++) {

				//Get the current callback function
				var callback = callbacks[i][0];
				var context;

				//Get the current context object, if it exists
				if(callbacks[i][1] === undefined) {

					//If the context is not defined, the scope is going to be this ( Event object )
					context = this;

				}else{

					//Get the context object
					context = callbacks[i][1];

				}

				//Run the current callback and send the tail along with it
				//The apply() method calls a function with a given this value and arguments provided as an array
				callback.apply(context, tail);

			}

		}

	}

};

//Export the Browserify module
module.exports = Event;

},{}],12:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Event = require('./event.js');

/**
 * Key constructor
 *
 * @class Key
 * @classdesc An object that handles a single key on a keyboard
 *
 * @param {Number} keycode - The keycode of this specific key
 */
var Key = function(keycode) {

	/**
	 * @property {Number} keyCode - The keycode of this specific key
	 */
	this.keyCode = keycode;

	/**
	 * @property {Boolean} isDown - Boolean to see if the key is down
	 */
	this.isDown = false;

	/**
	 * @property {Boolean} isUp - Boolean to see if the key is up
	 */
	this.isUp = false;

	/**
	 * @property {Number} lastDown - Timestamp of the last key press
	 */
	this.lastDown = 0;

	/**
	 * @property {Number} lastUp - Timestamp of the last key release
	 */
	this.lastUp = 0;

	/**
	 * @property {Number} delay - Delay between two events on keydown
	 */
	this.delay = 50;

	/**
	 * @property {Event} onDown - Event that handles onDown event
	 */
	this.onDown = new Event();

	/**
	 * @property {Event} onUp - Event that handles onUp event
	 */
	this.onUp = new Event();

};

Key.prototype = {

	/**
	 * Function that handles keydown events
	 * @protected
	 *
	 * @param {Object} event - The event object
	 */
	processKeyDown: function(event) {


		//If the key is allready down, the user is holding it
		if(this.isDown) {

			//Check if the onDown event should be triggered again
			if(event.timeStamp > this.lastDown + this.delay) {
				this.onDown.trigger(this.keyCode);
				this.lastDown = event.timeStamp;
			}

		}else{

			//Update this keys properties
			this.isDown = true;
			this.isUp = false;
			this.lastDown = event.timeStamp;

			//Trigger the event with this keycode
			this.onDown.trigger(this.keyCode);

		}

	},

	/**
	 * Function that handles keyup events
	 * @protected
	 *
	 * @param {Object} event - The event object
	 */
	processKeyUp: function(event) {

		//Update this keys properties
		this.isDown = false;
		this.isUp = true;
		this.lastUp = event.timeStamp;

		//Trigger the event with this keycode
		this.onUp.trigger(this.keyCode);

	}

};

//Export the Browserify module
module.exports = Key;

},{"./event.js":11}],13:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Key = require('./key.js');

/**
 * Keyboard constructor
 *
 * @class Keyboard
 * @classdesc An object that handles a single key on a keyboard
 */
var Keyboard = function() {

	/**
	 * @property {Object} keys - Object that holds all keys
	 */
	this.keys = {};

	//Initialize itself
	this.initialize();

};

Keyboard.prototype = {

	/**
	 * Function to initialize the keyboard and therefore user input
	 * @protected
	 */
	initialize: function() {

		//The onKeyDown event of the document is the following function:
		this._onKeyDown = function(event) {
			return this.processKeyDown(event);
		};

		//The onKeyUp event of the document is the following function:
		this._onKeyUp = function(event) {
			return this.processKeyUp(event);
		};

		//Add the event listeners to the window
		window.addEventListener('keydown', this._onKeyDown.bind(this), false);
		window.addEventListener('keyup', this._onKeyUp.bind(this), false);

	},

	/**
	 * Function to get a specific key from the keyboard
	 * and add it if it does't exist yet
	 * @protected
	 *
	 * @param {Number} keycode - The keycode of the key being added
	 *
	 * @return {Key} The Key object
	 */
	getKey: function(keycode) {

		//Check if the key allready exists
		if(this.keys[keycode] === undefined) {

			//Add a brand new key to the keyboards key list
			this.keys[keycode] = new Key(keycode);

		}

		//Return the key so we can use it in other functions
		return this.keys[keycode];

	},

	/**
	 * Function that handles keydown events
	 * @protected
	 *
	 * @param {Object} event - The event object
	 */
	processKeyDown: function(event) {

		//Only continue if the key being pressed is assigned to the keyboard
		if(this.keys[event.keyCode] !== undefined) {

			//Prevent the default action of the key
			event.preventDefault();

			//Call the callback's defined on this key
			this.keys[event.keyCode].processKeyDown(event);

		}

	},

	/**
	 * Function that handles keydown events
	 * @protected
	 *
	 * @param {Object} event - The event object
	 */
	processKeyUp: function(event) {

		//Only continue if the key being pressed is assigned to the keyboard
		if(this.keys[event.keyCode] !== undefined) {

			//Call the callback's defined on this key
			this.keys[event.keyCode].processKeyUp(event);

		}

	}

};

//Export the Browserify module
module.exports = Keyboard;


},{"./key.js":12}],14:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/*
 I've wrapped Makoto Matsumoto and Takuji Nishimura's code in a namespace
 so it's better encapsulated. Now you can have multiple random number generators
 and they won't stomp all over eachother's state.

 If you want to use this as a substitute for Math.random(), use the random()
 method like so:

 var m = new MersenneTwister();
 var randomNumber = m.random();

 You can also call the other genrand_{foo}() methods on the instance.

 If you want to use a specific seed in order to get a repeatable random
 sequence, pass an integer into the constructor:

 var m = new MersenneTwister(123);

 and that will always produce the same random sequence.

 Sean McCullough (banksean@gmail.com)
 */

/*
 A C-program for MT19937, with initialization improved 2002/1/26.
 Coded by Takuji Nishimura and Makoto Matsumoto.

 Before using, initialize the state by using init_genrand(seed)
 or init_by_array(init_key, key_length).

 Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:

 1. Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.

 3. The names of its contributors may not be used to endorse or promote
 products derived from this software without specific prior written
 permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


 Any feedback is very welcome.
 http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html
 email: m-mat @ math.sci.hiroshima-u.ac.jp (remove space)
 */

var MersenneTwister = function(seed) {
	if(seed == undefined) {
		seed = new Date().getTime();
	}
	/* Period parameters */
	this.N = 624;
	this.M = 397;
	this.MATRIX_A = 0x9908b0df;
	/* constant vector a */
	this.UPPER_MASK = 0x80000000;
	/* most significant w-r bits */
	this.LOWER_MASK = 0x7fffffff;
	/* least significant r bits */

	this.mt = new Array(this.N);
	/* the array for the state vector */
	this.mti = this.N + 1;
	/* mti==N+1 means mt[N] is not initialized */

	this.init_genrand(seed);
};

/* initializes mt[N] with a seed */
MersenneTwister.prototype.init_genrand = function(s) {
	this.mt[0] = s >>> 0;
	for(this.mti = 1; this.mti < this.N; this.mti++) {
		var s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
		this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253)
			+ this.mti;
		/* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
		/* In the previous versions, MSBs of the seed affect   */
		/* only MSBs of the array mt[].                        */
		/* 2002/01/09 modified by Makoto Matsumoto             */
		this.mt[this.mti] >>>= 0;
		/* for >32 bit machines */
	}
};

/* initialize by an array with array-length */
/* init_key is the array for initializing keys */
/* key_length is its length */
/* slight change for C++, 2004/2/26 */
MersenneTwister.prototype.init_by_array = function(init_key, key_length) {
	var i, j, k;
	this.init_genrand(19650218);
	i = 1;
	j = 0;
	k = (this.N > key_length ? this.N : key_length);
	for(; k; k--) {
		var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)
		this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525)))
			+ init_key[j] + j;
		/* non linear */
		this.mt[i] >>>= 0;
		/* for WORDSIZE > 32 machines */
		i++;
		j++;
		if(i >= this.N) {
			this.mt[0] = this.mt[this.N - 1];
			i = 1;
		}
		if(j >= key_length) j = 0;
	}
	for(k = this.N - 1; k; k--) {
		var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
		this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941))
			- i;
		/* non linear */
		this.mt[i] >>>= 0;
		/* for WORDSIZE > 32 machines */
		i++;
		if(i >= this.N) {
			this.mt[0] = this.mt[this.N - 1];
			i = 1;
		}
	}

	this.mt[0] = 0x80000000;
	/* MSB is 1; assuring non-zero initial array */
};

/* generates a random number on [0,0xffffffff]-interval */
MersenneTwister.prototype.genrand_int32 = function() {
	var y;
	var mag01 = new Array(0x0, this.MATRIX_A);
	/* mag01[x] = x * MATRIX_A  for x=0,1 */

	if(this.mti >= this.N) { /* generate N words at one time */
		var kk;

		if(this.mti == this.N + 1)   /* if init_genrand() has not been called, */
			this.init_genrand(5489);
		/* a default initial seed is used */

		for(kk = 0; kk < this.N - this.M; kk++) {
			y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
			this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
		}
		for(; kk < this.N - 1; kk++) {
			y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
			this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
		}
		y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
		this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];

		this.mti = 0;
	}

	y = this.mt[this.mti++];

	/* Tempering */
	y ^= (y >>> 11);
	y ^= (y << 7) & 0x9d2c5680;
	y ^= (y << 15) & 0xefc60000;
	y ^= (y >>> 18);

	return y >>> 0;
};

/* generates a random number on [0,0x7fffffff]-interval */
MersenneTwister.prototype.genrand_int31 = function() {
	return (this.genrand_int32() >>> 1);
};

/* generates a random number on [0,1]-real-interval */
MersenneTwister.prototype.genrand_real1 = function() {
	return this.genrand_int32() * (1.0 / 4294967295.0);
	/* divided by 2^32-1 */
};

/* generates a random number on [0,1)-real-interval */
MersenneTwister.prototype.random = function() {
	return this.genrand_int32() * (1.0 / 4294967296.0);
	/* divided by 2^32 */
};

/* generates a random number on (0,1)-real-interval */
MersenneTwister.prototype.genrand_real3 = function() {
	return (this.genrand_int32() + 0.5) * (1.0 / 4294967296.0);
	/* divided by 2^32 */
};

/* generates a random number on [0,1) with 53-bit resolution*/
MersenneTwister.prototype.genrand_res53 = function() {
	var a = this.genrand_int32() >>> 5, b = this.genrand_int32() >>> 6;
	return(a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
};

/* These real versions are due to Isaku Wada, 2002/01/09 added */

//Export the Browserify module
module.exports = MersenneTwister;

},{}],15:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Tile = require('./tile.js');

/**
 * Map constructor
 *
 * @class Map
 * @classdesc The object that holds all the rooms, corridors and tiles
 *
 * @param {Game} game - Reference to the current game object
 */
var Map = function(game) {

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Group} entities - Holds all the entities of this game
	 */
	this.entities = null;

	/**
	 * @property {Object} settings - The empty settings object
	 */
	this.settings = {};

	/**
	 * @property {Array} rooms - An array that holds all room objects
	 */
	this.rooms = [];

	/**
	 * @property {Array} tiles - An array that holds all tile objects
	 */
	this.tiles = [];

	/**
	 * @property {Array} objects - An array that holds all objects that are on the map
	 */
	this.objects = [];

	/**
	 * @property {Vector2} entrance - An object that holds the position of the entrance of this map
	 */
	this.entrance = null;

	/**
	 * @property {Vector2} exit - An object that holds the position of the exit of this map
	 */
	this.exit = null;

	/**
	 * @property {Array} allRooms - An array that holds all the rooms on this map
	 */
	this.allRooms = [];

	/**
	 * @property {Array} mediumRooms - An array that holds all the medium rooms on this map
	 */
	this.mediumRooms = [];

	/**
	 * @property {Array} hardRooms - An array that holds all the hard rooms on this map
	 */
	this.hardRooms = [];

	/**
	 * @property {Array} roomsToExit - An array that holds all the rooms that go from the entrance to the exit on this map
	 */
	this.roomsToExit = [];

	//Initialize itself
	this.initialize();

};

Map.prototype = {

	/**
	 * Initialize the layout of the map, filling it with empty tiles
	 * @protected
	 */
	initialize: function() {

		//TODO: Make this dynamic on the depth of the dungeon, this will allow the generator to make more complicated maps the deeper you go
		//Define settings
		this.settings = {
			tilesX: 60, //The number of horizontal tiles on this map
			tilesY: 40, //The number of vertical tiles on this map
			tileSize: 48, //The width and height of a single tile
			maxRooms: 15, //The maximum number of rooms on this map
			minRoomWidth: 5, //The minimum width of a single room
			maxRoomWidth: 8, //The maximum width of a single room
			minRoomHeight: 5, //The minimum height of a single room
			maxRoomHeight: 8, //The maximum height of a single room
			roomSpacing: 1, //The length of a corridor, 0 for no corridors
			maxMainRooms: 10,
			maxMediumRooms: 15,
			maxHardRooms: 5
		};

		//Loop through every horizontal row
		for(var x = 0; x < this.settings.tilesX; x++) {

			//Initialize this row
			this.tiles[x] = [];

			//Loop through every vertical row
			for(var y = 0; y < this.settings.tilesY; y++) {

				//Initialize this position by setting it to zero, and blocking light
				this.tiles[x][y] = new Tile(0, true, 0, 0);

			}

		}

	},

	/**
	 * Function to get a tile at a position
	 * @protected
	 *
	 * @param {Vector2} position - The position that is being requested
	 *
	 * @return {Tile} The tile object that has been found, empty object otherwise
	 */
	getTileAt: function(position) {

		//Try to get the tile object from the map
		var tile = this.tiles[position.x][position.y];

		//Check if the tile object is something, else return an empty tile object
		if(tile) {

			return tile;

		}else{

			return new Tile();

		}

	},

	/**
	 * Function to check if one position is inside the maps boundary
	 * @protected
	 *
	 * @param {Vector2} position - The position that is being requested
	 *
	 * @return {Boolean} Returns true if the position is within this map, returns false if it isn't
	 */
	insideBounds: function(position) {

		return(
			position.x > 0 &&
				position.x < this.settings.tilesX &&
				position.y > 0 &&
				position.y < this.settings.tilesY
			);

	},

	/**
	 * Function that returns an array with only the tiletypes of every position
	 * Used for EasyStar Pathfinding
	 * @protected
	 *
	 * @return {Array} Array with only the tiletypes of every position on the map
	 */
	typeList: function() {

		//Define variables
		var mapTypeList = [];

		//Loop through every horizontal row
		for(var y = 0; y < this.settings.tilesY; y++) {

			//Initialize this row
			mapTypeList.push([]);

			//Loop through every vertical row
			for(var x = 0; x < this.settings.tilesX; x++) {

				//Initialize this position by setting it to zero, and blocking light
				mapTypeList[y][x] = (this.tiles[x][y].type);

			}

		}

		//Return the array with Y X coordinates of every tiletype
		return mapTypeList;

	},

	/**
	 * Check if a single room overlaps a room that is already on the map and if it's inside the maps boundaries
	 * @protected
	 *
	 * @param {Room} room - The room object that has to be checked
	 *
	 * @return {Boolean} True when the room intersects with an existing room, false when it's not intersecting
	 */
	roomFits: function(room) {

		//Check if the room fits inside the boundaries of this map. If not we can't place it.
		if(room.x1 < 1 || room.x2 > this.settings.tilesX - 1 || room.y1 < 1 || room.y2 > this.settings.tilesY - 1) {

			return false;

		}

		//Loop through every room in the list
		for(var i = 0; i < this.allRooms.length; i++) {

			//Check if the room intersects with the current room
			if(room.x1 <= this.allRooms[i].x2 && room.x2 >= this.allRooms[i].x1 && room.y1 <= this.allRooms[i].y2 && room.y2 >= this.allRooms[i].y1) {

				return false;

			}

		}
		//If the room doesn't intersect another room, return true
		return true;

	}

};

//Export the Browserify module
module.exports = Map;

},{"./tile.js":19}],16:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var PropFactory = require('../factories/propfactory.js');

/**
 * MapDecorator constructor
 *
 * @class MapDecorator
 * @classdesc The object that is responsible for decorating the map
 *
 * @param {Game} game - Reference to the current game object
 */
var MapDecorator = function(game) {

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Array} tileArray - An array that stores which bitwise numbers should get certain tiles from the tileset
	 */
	this.tileArray = [];

	//Initialize itself
	this.initialize();

};

MapDecorator.prototype = {

	/**
	 * Perform the needed actions before decorating the map
	 * @protected
	 */
	initialize: function() {

		//Filling the tileArray used by the auto tiling in the setTileNumbers function, a more detailed explanation can be found there
		this.tileArray[0] = [255];
		this.tileArray[1] = [238, 239, 254];
		this.tileArray[2] = [125, 204, 253];
		this.tileArray[3] = [76, 92, 220];
		this.tileArray[4] = [123, 187, 251];
		this.tileArray[5] = [122, 152, 186, 192, 200, 216, 218, 234, 250];
		this.tileArray[6] = [25, 89, 57, 121];
		this.tileArray[7] = [24, 72, 80, 88];
		this.tileArray[8] = [134, 166, 230, 231, 247];
		this.tileArray[9] = [32];
		this.tileArray[10] = [17, 33, 49, 196];
		this.tileArray[11] = [16];
		this.tileArray[12] = [35, 51, 163, 179];
		this.tileArray[13] = [34, 162, 130];
		this.tileArray[14] = [64];
		this.tileArray[15] = [128];
		this.tileArray[16] = [120];
		this.tileArray[17] = [178];
		this.tileArray[18] = [194, 226];

	},

	/**
	 * A function that starts the decorating of the map, calling all the necessary functions
	 * @protected
	 */
	decorateMap: function() {

		//Place the entrance and exit on the map
		this.placeEntrance();
		this.placeExit();

		//Let the autotiler work it's magic
		this.setTileNumbers();

		//Place doors on the map
		this.generateDoors();

		//Populate the dungeon with monsters and or friendlies
		this.populateDungeon();

	},

	/**
	 * This function sets the correct tileset row and number for each tile
	 *
	 * The key of the tileArray is representing the tile on the tileset
	 * The values represent the results that can come out of the bitwise calculation of surrounding tiles
	 * Calculating these values is rather easy following this graph:
	 *
	 * 16 - 2 - 32
	 *  8 - x - 2
	 * 64 - 4 - 128
	 *
	 * X is the tile that is currently being checked. For every floor tile that surrounds the current tile
	 * a certain value is added. For example: If there are floor tiles, above, left and bottom left of the current tile
	 * you end up with the number 74. This always describes an unique layout on the map and therefore translates to a certain tile on the tileset.
	 *
	 * @protected
	 */
	setTileNumbers: function() {

		//Get the reference to the map object
		var map = this.game.map;

		//Loop through every horizontal row
		for(var x = 0; x < map.settings.tilesX; x++) {

			//Loop through every vertical row
			for(var y = 0; y < map.settings.tilesY; y++) {

				//If the current tile is a wall, perform the autotiling check
				if(map.tiles[x][y].type === 1) {

					//Get the tile at the location of the possible door location
					//TODO: Write a function on the map that returns the surrounding tiles
					var tileLeft = this.game.map.tiles[x - 1][y];
					var tileRight = this.game.map.tiles[x + 1][y];
					var tileDown = this.game.map.tiles[x][y + 1];
					var tileUp = this.game.map.tiles[x][y - 1];
					var tileUpperLeft = this.game.map.tiles[x - 1][y - 1];
					var tileUpperRight = this.game.map.tiles[x + 1][y - 1];
					var tileLowerLeft = this.game.map.tiles[x - 1][y + 1];
					var tileLowerRight = this.game.map.tiles[x + 1][y + 1];

					//Start out with tile number 0
					var tileNumber = 0;

					//Check every tile and increment a value when it is a floor typed tile
					if(tileUp.type === 2) {
						tileNumber += 1;
					}
					if(tileRight.type === 2) {
						tileNumber += 2;
					}
					if(tileDown.type === 2) {
						tileNumber += 4;
					}
					if(tileLeft.type === 2) {
						tileNumber += 8;
					}
					if(tileUpperLeft.type === 2) {
						tileNumber += 16;
					}
					if(tileUpperRight.type === 2) {
						tileNumber += 32;
					}
					if(tileLowerLeft.type === 2) {
						tileNumber += 64;
					}
					if(tileLowerRight.type === 2) {
						tileNumber += 128;
					}

					//Loop through each tile number and see if any of the values inside them match the current tile value
					for(var index in this.tileArray) {

						//If the value matches, we choose the key number of this array as the corresponding tile on the spritesheet
						if(this.tileArray[index].indexOf(tileNumber) !== -1) {

							//Set the tile number to the corresponding tile
							map.tiles[x][y].tileNumber = index;

							//Chose a random row, 0 or 1. This is to add a little more variety in the tiles
							map.tiles[x][y].tileRow = Utils.randomNumber(0, 1);

							//Break the loop because we have found what we are looking for
							break;

						}

					}

				}

				//If the current tile is a floor tile
				if(map.tiles[x][y].type === 2) {

					//Have a random chance to spawn grass on this tile
					if(Utils.randomNumber(0, 100) >= 80) {

						//Create a new grass entity
						var grassEntity = new DecorationFactory.newGrass(
							this.game,
							new Vector2(x, y)
						);

						//Add the entity to the tile on the map
						map.tiles[x][y].addEntity(grassEntity);

						//Add the entity to the map
						map.entities.addEntity(grassEntity);

					}


				}

			}

		}

	},

	/**
	 * Get the first room on the roomsToExit list and turns it into the entrance room
	 * @protected
	 */
	placeEntrance: function() {

		//Let the first room return a random position
		var entrancePosition = this.game.map.roomsToExit[0].getRandomPosition();

		//Get a new instance of a map entrance
		var entranceEntity = PropFactory.newEntrance(this.game, entrancePosition);

		//Add the entity to the map
		this.game.map.entities.addEntity(entranceEntity);

		//Tell the map where the player should enter the map
		this.game.map.entrance = entrancePosition;

	},

	/**
	 * Get the last room on the roomsToExit list and turns it into the exit room
	 * @protected
	 */
	placeExit: function() {

		//Let the last room return a random position
		var exitPosition = this.game.map.roomsToExit[this.game.map.roomsToExit.length - 1].getRandomPosition();

		//Get a new instance of a map exit
		var exitEntity = PropFactory.newExit(this.game, exitPosition);

		//Add the entity to the map
		this.game.map.entities.addEntity(exitEntity);

		//Tell the map where the player should leave the map
		this.game.map.exit = exitPosition;

	},

	/**
	 * Generate some doors and spread them out over the map!
	 * @protected
	 */
	generateDoors: function() {

		//Loop through all possible door locations
		//TODO: Don't store the possible door locations in the mapfactory, store it in the map that is being created and decorated
		for(var i = 0; i < this.game.mapFactory.possibleDoorLocations.length; i++) {

			//Store the current location in a local variable
			var doorLocation = this.game.mapFactory.possibleDoorLocations[i];

			//Get the tile at the location of the possible door location
			//TODO: Write a function on the map that returns tiles in a certain radius
			var tileLeft = this.game.map.tiles[doorLocation.x - 1][doorLocation.y];
			var tileRight = this.game.map.tiles[doorLocation.x + 1][doorLocation.y];
			var tileUp = this.game.map.tiles[doorLocation.x][doorLocation.y - 1];
			var tileDown = this.game.map.tiles[doorLocation.x][doorLocation.y + 1];

			var randomNumber = Utils.randomNumber(0, 100);

			//If the tiles left and right are walls and the tiles above and below are floors
			if(tileLeft.type === 1 && tileRight.type === 1 && tileUp.entities.length === 0 && tileDown.entities.length === 0 && tileUp.type === 2 && tileDown.type === 2 && randomNumber > 50) {

				//Place a door at this location
				this.placeDoor(doorLocation, false);

				//If the tiles left and right are floors and the tiles above and below are walls
			}else if(tileLeft.type === 2 && tileRight.type === 2 && tileLeft.entities.length === 0 && tileRight.entities.length === 0 && tileUp.type === 1 && tileDown.type === 1 && randomNumber > 50) {

				//Place a door at this location
				this.placeDoor(doorLocation, true);

			}

		}

	},

	/**
	 * Place the entrance and exit objects on the map
	 * @protected
	 */
	placeDoor: function(position, orientation) {

		//Get the tile at the door's position
		var tileAtPosition = this.game.map.tiles[position.x][position.y];

		//Create the door entity
		var doorEntity = PropFactory.newDoor(this.game, position);

		if(orientation === true) {
			doorEntity.components.sprite.tile = 0;
		}

		//Add the entity to the map
		this.game.map.entities.addEntity(doorEntity);

		//Add the door entity to the entities list on the current tile
		tileAtPosition.addEntity(doorEntity);

		//A door blocks light!
		tileAtPosition.blockLight = true;

	},

	/**
	 * Populate the dungeon with enemies and or friendlies
	 * This function is due to some heavy changes
	 * @protected
	 */
	populateDungeon: function() {

		for(var i = 0; i < this.game.map.mediumRooms.length; i++) {

			var room = this.game.map.mediumRooms[i];

			//Loop through every horizontal row
			for(var x = room.x1; x < room.x2; x++) {

				//Loop through every vertical row
				for(var y = room.y1; y < room.y2; y++) {

					//Don't place wall's over existing floor tiles. This solves the problem that some corridors may get shut of
					if(this.game.map.tiles[x][y].type === 2) {

						//Have a random chance to spawn grass on this tile
						if(Utils.randomNumber(0, 100) >= 90) {

							//Create a new grass entity
							var enemyEntity = new EnemyFactory.newSpider(
								this.game,
								new Vector2(x, y)
							);

							//Add the entity to the tile on the map
							this.game.map.tiles[x][y].addEntity(enemyEntity);

							//Add the entity to the map
							this.game.map.entities.addEntity(enemyEntity);

							//Add the entity to the scheduler
							this.game.scheduler.add(enemyEntity, true);

						}

					}

				}

			}

		}

		for(var b = 0; b < this.game.map.hardRooms.length; b++) {

			var hardRoom = this.game.map.hardRooms[b];

			//Loop through every horizontal row
			for(var xPos = hardRoom.x1; xPos < hardRoom.x2; xPos++) {

				//Loop through every vertical row
				for(var yPos = hardRoom.y1; yPos < hardRoom.y2; yPos++) {

					//Don't place wall's over existing floor tiles. This solves the problem that some corridors may get shut of
					if(this.game.map.tiles[xPos][yPos].type === 2) {

						//Have a random chance to spawn grass on this tile
						if(Utils.randomNumber(0, 100) >= 90) {

							//Create a new grass entity
							enemyEntity = new EnemyFactory.newSkeleton(
								this.game,
								new Vector2(xPos, yPos)
							);

							//Add the entity to the tile on the map
							this.game.map.tiles[xPos][yPos].addEntity(enemyEntity);

							//Add the entity to the map
							this.game.map.entities.addEntity(enemyEntity);

							//Add the entity to the scheduler
							this.game.scheduler.add(enemyEntity, true);

						}

					}

				}

			}

		}

	}

};

//Export the Browserify module
module.exports = MapDecorator;

},{"../factories/propfactory.js":5}],17:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Room = require('./room.js'),
    Vector2 = require('../geometry/vector2.js'),
    Utils = require('../core/utils.js');

/**
 * MapFactory constructor
 *
 * @class MapFactory
 * @classdesc The object that is responsible for generating rooms and corridors
 *
 * @param {Game} game - Reference to the current game object
 */
var MapFactory = function(game) {

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Map} map - Reference to the current map
	 */
	this.map = game.map;

	/**
	 * @property {Array} possibleDoorLocations - Stores all the positions of possible door locations
	 */
	this.possibleDoorLocations = [];

};

MapFactory.prototype = {

	/**
	 * This function calls all the functions in the right order to generate the map
	 * @protected
	 */
	generateRooms: function() {

		//Generate the first room of the map
		this.generateFirstRoom();

		//Generate the path to the exit room
		this.generatePath("path", this.map.roomsToExit, this.map.settings.maxMainRooms);

		//Extend the original path with medium rooms
		this.generatePath("random", this.map.mediumRooms, this.map.settings.maxMediumRooms);

		//Extend the original path with hard rooms
		this.generatePath("randomMedium", this.map.hardRooms, this.map.settings.maxHardRooms);

	},

	/**
	 * Generate the first room of the map
	 * @protected
	 */
	generateFirstRoom: function() {

		//Create a new room that will serve as the entrance room
		var newRoom = this.newRoom();
		newRoom.initialize();

		//Place the room on the map
		this.placeRoom(newRoom);

		//Define the just generated map as the entrance room of the map
		//It is the first room in the path to the exit
		this.map.roomsToExit.push(newRoom);

	},

	/**
	 * Creates a series of rooms towards the final exit room or that extend the normal route
	 * @protected
	 */
	generatePath: function(type, roomList, maxRooms) {

		//Maximum number of tries before stopping the placement of more rooms
		//These tries are increase whenever the generator has to go back one
		//room because it couldn't generate a room in any direction
		var maxTries = 20;
		var tries = 0;

		//Create rooms while we haven't reached the maximum amount of rooms
		while(roomList.length < maxRooms) {

			//If we are already at the maximum amount of tries, break the loop
			if(tries >= maxTries) {
				break;
			}

			//Set all the available directions once
			var directions = ["left", "right", "up", "down"];

			//Define variables
			var index;
			var prevRoom;

			//Get the previous room
			switch(type) {

				//Generate a path of rooms, this means we have to generate a room from the previous room
				case("path"):

					prevRoom = this.map.roomsToExit[this.map.roomsToExit.length - 1];

					break;

				//Extend the already existing path with new rooms
				case("random"):

					index = Utils.randomNumber(0, this.map.allRooms.length - 1);
					prevRoom = this.map.allRooms[index];

					break;

				//Extend the already existing path of medium rooms with rooms
				case("randomMedium"):

					//Get another random room
					index = Utils.randomNumber(0, this.map.mediumRooms.length - 1);
					prevRoom = this.map.mediumRooms[index];

					break;

			}

			//Continue until we break the loop ourselves
			while(true) {

				//If there aren't any directions left to try, we fill the directions
				//array again, but we also go back one room and search again from that room
				if(directions.length === 0) {

					//We tried to generate a room in every possible direction
					//This failed and we are now going back one room
					//This process is only allowed "maxTries" times
					tries++;

					//If we are already at the maximum amount of tries, break the loop
					if(tries >= maxTries) {
						break;
					}

					//Set all the available directions once
					directions = ["left", "right", "up", "down"];

					//Get the previous room
					switch(type) {

						//Generate a normal path of rooms, this means we have to generate a room from the previous room
						case("path"):

							//Remove the room that failed to expand in every direction as a room that leads towards the exit
							var mediumRoom = this.map.roomsToExit.splice(this.map.roomsToExit.length - 1, 1)[0];

							//The current room failed to expand in any direction, this is why we promote it to a
							//medium room. This means the room isn't part of the main route and is 'optional'
							this.map.mediumRooms.push(mediumRoom);

							//Set the previous room to the room before the previous room on the list
							prevRoom = this.map.roomsToExit[this.map.roomsToExit.length - 1];

							break;

						//Extend the already existing path with rooms
						case("random"):

							//Get another random room
							index = Utils.randomNumber(0, this.map.allRooms.length - 1);
							prevRoom = this.map.allRooms[index];

							break;

						//Extend the already existing path of medium rooms with rooms
						case("randomMedium"):

							//Get another random room
							index = Utils.randomNumber(0, this.map.mediumRooms.length - 1);
							prevRoom = this.map.mediumRooms[index];

							break;

					}

				}

				//Pick a random side of the previous room
				var side = Utils.randomNumber(0, directions.length - 1);
				var direction = directions[side];

				//Maximum number of tries before stopping the placement of more rooms
				var maxDirectionTries = 5;
				var directionTries = 0;

				//Create a room next to the previous room
				var newRoom = this.generateRoomNextTo(prevRoom, direction);

				//We try to place a new room for a certain amount of times in the current direction
				while(!this.map.roomFits(newRoom)) {

					//Check if the limit has been reached, this prevents the while loop from crashing your page
					//We assume there is no space left on the map and break the loop
					if(directionTries >= maxDirectionTries) {

						//Remove the direction because we tried the maximum amount of times to place a room there
						directions.splice(side, 1);

						//If we are already at the maximum amount of tries, break the loop
						break;

					}

					//Create a room next to the previous room
					newRoom = this.generateRoomNextTo(prevRoom, direction);

					//We tried to fit the new room but it failed
					directionTries++;

				}

				//We see if the room does fit, if it doesn't then well, that's a shame!
				//Because we aren't putting any more effort into that room.
				if(this.map.roomFits(newRoom)) {

					//The room doesn't intersect and is inside the map boundaries, initialize the room layout
					newRoom.initialize();

					//Place the room on the map
					this.placeRoom(newRoom);

					//Add the room to the room list
					roomList.push(newRoom);

					//Generate an exit on the previous and new room
					prevRoom.generateExit();
					newRoom.generateExit();

					//Generate a corridor between these two exit points
					this.generateCorridor(prevRoom, newRoom);

					//Reset the possible directions
					directions = ["left", "right", "up", "down"];

					//Break the while(true) loop because we have succeeded to place a room on the map
					break;

				}

			}

		}

	},

	/**
	 * Create a new Room object next to the supplied previous room
	 * @protected
	 *
	 * @param {Room} prevRoom - The previous room
	 * @param {String} direction - The direction of expanding the dungeon as seen from a room
	 *
	 * @return {Room} A new Room object
	 */
	generateRoomNextTo: function(prevRoom, direction) {

		//First declare the variables and then give them all the same value
		//This is to prevent variables from going global
		var heigth, width, xPos, yPos;
		heigth = width = xPos = yPos = undefined;

		//Create a new room based on the direction
		switch(direction) {

			case ("up"):

				//Calculate a random height, we need this value here to determine the vertical position of the room
				heigth = Utils.randomNumber(
					this.map.settings.minRoomHeight,
					this.map.settings.maxRoomHeight
				);

				//Calculate the horizontal and vertical position
				xPos = prevRoom.x1 + Utils.randomNumber(-2, 3);
				yPos = prevRoom.y1 - heigth - this.map.settings.roomSpacing;

				break;

			case ("down"):

				//Calculate the horizontal and vertical position
				xPos = prevRoom.x1 + Utils.randomNumber(-2, 3);
				yPos = prevRoom.y2 + this.map.settings.roomSpacing;

				break;

			case ("left"):

				//Calculate a random width, we need this value here to determine the horizontal position of the room
				width = Utils.randomNumber(
					this.map.settings.minRoomWidth,
					this.map.settings.maxRoomWidth
				);

				//Calculate the horizontal and vertical position
				xPos = prevRoom.x1 - width - this.map.settings.roomSpacing;
				yPos = prevRoom.y1 + Utils.randomNumber(-2, 3);

				break;

			case ("right"):

				//Calculate the horizontal and vertical position
				xPos = prevRoom.x2 + this.map.settings.roomSpacing;
				yPos = prevRoom.y1 + Utils.randomNumber(-2, 3);

				break;

		}

		//Return the newly generated room
		return this.newRoom(width, heigth, xPos, yPos);

	},

	/**
	 * Create a new Room object
	 * @protected
	 *
	 * @param {int} width - Optional width of the new room
	 * @param {int} height - Optional height of the new room
	 * @param {int} xPos - Optional horizontal position of the new room
	 * @param {int} yPos - Optional vertical position of the new room
	 *
	 * @return {Room} A new Room object
	 */
	newRoom: function(width, height, xPos, yPos) {

		//We are using shorthand method instead of || because the optional values might
		//be passed but evaluate as false

		//Generate random values ( in tiles )
		//Start with generating a random width
		var w = (typeof width === "undefined") ? Utils.randomNumber(
			this.game.map.settings.minRoomWidth,
			this.game.map.settings.maxRoomWidth
		) : width;

		//Generate a random height for the room
		var h = (typeof height === "undefined") ? Utils.randomNumber(
			this.game.map.settings.minRoomHeight,
			this.game.map.settings.maxRoomHeight
		) : height;

		//Generate a random horizontal position for this room
		var x = (typeof xPos === "undefined") ? Utils.randomNumber(
			1,
			this.game.map.settings.tilesX - w - 1
		) : xPos;

		//Generate a random vertical position for the room
		var y = (typeof yPos === "undefined") ? Utils.randomNumber(
			1,
			this.game.map.settings.tilesY - h - 1
		) : yPos;

		//Create a new room with these values and return it
		return new Room(x, y, w, h);

	},

	/**
	 * Places a room on the map
	 * @protected
	 *
	 * @param {Object} room - The room to place on the map
	 */
	placeRoom: function(room) {

		this.game.map.allRooms.push(room);

		//Loop through every horizontal row
		for(var x = room.x1; x < room.x2; x++) {

			//What is the current Y position in the layout of the current room
			var layoutXPos = room.x2 - x - 1;

			//Loop through every vertical row
			for(var y = room.y1; y < room.y2; y++) {

				//What is the current X position in the layout of the current room
				var layoutYPos = room.y2 - y - 1;

				//Don't place wall's over existing floor tiles. This solves the problem that some corridors may get shut of
				if(this.game.map.tiles[x][y].type !== 2) {

					//Place the tile that is on the layout on this position on the map
					this.game.map.tiles[x][y] = room.layout[layoutXPos][layoutYPos];

				}

			}

		}

	},

	/**
	 * Check in which direction the corridor has to be generated
	 * @protected
	 *
	 * @param {Object} firstRoom - The room from which we are going to generate a path to the second room
	 * @param {Object} secondRoom - This room is going to be the endpoint of this corridor
	 */
	generateCorridor: function(firstRoom, secondRoom) {

		//Exit positions are stored in layout, so upper left is 0,0.
		//We need the map's position, so we'll add the top left coordinates of the room
		var firstExit = {
			x: firstRoom.x1 + firstRoom.exit.x,
			y: firstRoom.y1 + firstRoom.exit.y
		};

		var secondExit = {
			x: secondRoom.x1 + secondRoom.exit.x,
			y: secondRoom.y1 + secondRoom.exit.y
		};

		//Check if we even need to generate a horizontal corridor, or if we are on the same coordinate
		if(secondExit.x !== firstExit.x) {

			//Horizontal Corridors
			if((secondExit.x - firstExit.x) > 0) {

				//Corridor going left
				for(var i = secondExit.x; i >= firstExit.x; i--) {
					this.generateHorizontalCorridor(i, secondExit.y);
				}

			}else{

				//Corridor going right
				for(var b = secondExit.x; b <= firstExit.x; b++) {
					this.generateHorizontalCorridor(b, secondExit.y);
				}

			}

		}

		//Check if we even need to generate a vertical corridor, or if we are on the same coordinate
		if(secondExit.y !== firstExit.y) {

			//Vertical Corridors
			if((secondExit.y - firstExit.y) > 0) {

				//If the corridor is going up
				for(var n = secondExit.y; n >= firstExit.y; n--) {
					this.generateVerticalCorridor(firstExit.x, n);
				}

			}else{

				//If the corridor is going down
				for(var h = secondExit.y; h <= firstExit.y; h++) {
					this.generateVerticalCorridor(firstExit.x, h);
				}

			}

		}

	},

	/**
	 * Generate a horizontal corridor tile, and also place doors and walls
	 * @protected
	 *
	 * @param {Number} x - The horizontal position of the tile that has to become a corridor
	 * @param {Number} y - The vertical position of the tile that has to become a corridor
	 */
	generateHorizontalCorridor: function(x, y) {

		//Define the map variable
		var map = this.game.map;

		//Get the current tile
		var currentTile = map.tiles[x][y];

		//Check the tiles type from the tiles above and below the current tile
		var aboveTile = map.tiles[x][y + 1];
		var belowTile = map.tiles[x][y - 1];

		//If the current tile type is a wall, and the tiles above and below here are also walls
		//this may be a possible door location
		if(currentTile.type === 1 && aboveTile.type === 1 && belowTile.type === 1) {

			//Push the coordinates into the array for later use
			this.possibleDoorLocations.push({x: x, y: y});

		}

		//Set the current tile to floor
		this.changeTileToFloor(currentTile);

		//Generate walls below this hallway
		if(aboveTile.type === 0) {

			//Set the current tile to wall
			this.changeTileToWall(aboveTile);

		}

		//Generate walls above this hallway
		if(belowTile.type === 0) {

			//Set the current tile to wall
			this.changeTileToWall(belowTile);

		}

	},

	/**
	 * Generate a vertical corridor tile, and also place walls
	 * @protected
	 *
	 * @param {Number} x - The horizontal position of the tile that has to become a corridor
	 * @param {Number} y - The vertical position of the tile that has to become a corridor
	 */
	generateVerticalCorridor: function(x, y) {

		//Define the map variable
		var map = this.game.map;

		//Get the current tile
		var currentTile = map.tiles[x][y];

		//Check the tiles type from the tiles above and below the current tile
		var rightTile = map.tiles[x + 1][y];
		var leftTile = map.tiles[x - 1][y];

		//If the current tile type is a wall, and the tiles left and right here are also walls
		//this may be a possible door location
		if(currentTile.type === 1 && rightTile.type === 1 && leftTile.type === 1) {

			//Push the coordinates into the array for later use
			this.possibleDoorLocations.push(new Vector2(x, y));

		}

		//Set the current tile to floor
		this.changeTileToFloor(currentTile);

		//The following checks prevent corners ending without being attached to another wall
		//Because we don't know which direction the vertical corridor is being placed, we check
		//upperleft, upperright, bottomleft and bottomright
		//TODO: Find a better solution for these checks

		//Also check for the upperright tile to maybe place a wall
		if(map.tiles[x + 1][y + 1].type === 0) {

			//Set the current tile to wall
			this.changeTileToWall(map.tiles[x + 1][y + 1]);

		}

		//Also check for the upperleft tile to maybe place a wall
		if(map.tiles[x - 1][y - 1].type === 0) {

			//Set the current tile to wall
			this.changeTileToWall(map.tiles[x - 1][y - 1]);

		}

		//Also check for the bottomright tile to maybe place a wall
		if(map.tiles[x + 1][y - 1].type === 0) {

			//Set the current tile to wall
			this.changeTileToWall(map.tiles[x + 1][y - 1]);

		}

		//Also check for the bottomleft tile to maybe place a wall
		if(map.tiles[x - 1][y + 1].type === 0) {

			//Set the current tile to wall
			this.changeTileToWall(map.tiles[x - 1][y + 1]);

		}

	},

	/**
	 * Changes a tile to a floor
	 * @protected
	 *
	 * @param {Tile} tile - The tile that is being changed
	 */
	changeTileToFloor: function(tile) {

		tile.type = 2;
		tile.tileRow = 3;
		tile.tileNumber = Utils.randomNumber(2, 5);
		tile.blockLight = false;

	},

	/**
	 * Changes a tile to a wall
	 * @protected
	 *
	 * @param {Tile} tile - The tile that is being changed
	 */
	changeTileToWall: function(tile) {

		tile.type = 1;
		tile.tileRow = 0;
		tile.tileNumber = 10;
		tile.blockLight = true;

	}

};

//Export the Browserify module
module.exports = MapFactory;

},{"../core/utils.js":4,"../geometry/vector2.js":9,"./room.js":18}],18:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Tile = require('./tile.js'),
    Vector2 = require('../geometry/vector2.js'),
    Utils = require('../core/utils.js');

/**
 * Room constructor
 *
 * @class Room
 * @classdesc A room object that creates his own layout!
 *
 * @param {Number} x - The x coordinate of the top left corner of this room
 * @param {Number} y - The y coordinate of the top left corner of this room
 * @param {Number} w - The width of this room
 * @param {Number} h - The height of this room
 */
var Room = function(x, y, w, h) {

	/**
	 * @property {Number} x1 - The X position of the top left corner of this room
	 */
	this.x1 = x;

	/**
	 * @property {Number} x2 - The X position of the top right corner of this room
	 */
	this.x2 = w + x;

	/**
	 * @property {Number} y1 - The Y position of top left corner of this room
	 */
	this.y1 = y;

	/**
	 * @property {Number} y2 - The Y position of bottom left corner of this room
	 */
	this.y2 = y + h;

	/**
	 * @property {Number} w - The width of this room, defined in tiles
	 */
	this.w = w;

	/**
	 * @property {Number} h - The height of this room, defined in tiles
	 */
	this.h = h;

	/**
	 * @property {Array} layout - The array that contains the layout of this room
	 */
	this.layout = [];

	/**
	 * @property {Object} exit - An object that holds the exit coordinates of this room
	 */
	this.exit = null;

};

Room.prototype = {

	/**
	 * Initialize the layout of the room, filling it with default tiles
	 * @protected
	 */
	initialize: function() {

		//Loop through every horizontal row
		for(var x = 0; x < this.w; x++) {

			//Initialize this row
			this.layout[x] = [];

			//Loop through every vertical row
			for(var y = 0; y < this.h; y++) {

				//Check if the position filled has to be a wall or floor
				if(y === 0 || y === this.h - 1 || x === 0 || x === this.w - 1) {

					//Create a new wall tile
					this.layout[x][y] = new Tile(1, true, this, 0, 10);

				}else{

					//Create a new floor tile
					this.layout[x][y] = new Tile(2, false, this, 3, Utils.randomNumber(2, 5));

				}

			}

		}

	},

	/**
	 * Generate an exit on a random side of this room
	 * @protected
	 */
	generateExit: function() {

		//Add an exit on one of the sides of the wall
		//But one tile further into the room, so we don't get weird openings
		//when the generation of a corridor goes the other direction
		switch(Utils.randomNumber(1, 4)) {

			case(1): //Top

				this.exit = {x: Utils.randomNumber(1, this.w - 2), y: this.h - 2};

				break;

			case(2): //Bottom

				this.exit = {x: Utils.randomNumber(1, this.w - 2), y: 1};

				break;

			case(3): //Left

				this.exit = {x: this.w - 2, y: Utils.randomNumber(1, this.h - 2)};

				break;

			case(4): //Right

				this.exit = {x: 1, y: Utils.randomNumber(1, this.h - 2)};

				break;

		}

	},

	/**
	 * Returns a random position that is inside the current room
	 * @protected
	 *
	 * @return {Vector2} Vector2 object of a random position inside the room
	 */
	getRandomPosition: function() {

		//Get random positions within the room
		var positionX = Utils.randomNumber(2, this.w - 3);
		var positionY = Utils.randomNumber(2, this.h - 3);

		//Translate these values to real world coordinates
		positionX += this.x1;
		positionY += this.y1;

		//Return the position as an Vector2 object
		return new Vector2(positionX, positionY);

	}

};

//Export the Browserify module
module.exports = Room;

},{"../core/utils.js":4,"../geometry/vector2.js":9,"./tile.js":19}],19:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Tile Constructor
 *
 * @class Tile
 * @classdesc A single tile on the map, contains data about it's location and origin
 *
 * @param {Number} type - The kind of tile, wall, floor, void etc
 * @param {Boolean} blockLight - Does this tile block light, yes or no
 * @param {Room} room - The room that this tile belongs to
 * @param {Number} tileRow -The row on the tileset that this current tile is on
 * @param {Number} tileNumber - The number of tile in the row that this tile is. Starting from 0
 */
var Tile = function(type, blockLight, room, tileRow, tileNumber) {

	/**
	 * @property {Number} The kind of tile, wall, floor, void etc
	 */
	this.type = type;

	/**
	 * @property {Number} The row on the tileset that this current tile is on
	 */
	this.tileRow = tileRow;

	/**
	 * @property {Number} The number of tile in the row that this tile is. Starting from 0
	 */
	this.tileNumber = tileNumber;

	/**
	 * @property {Room} belongsTo - The room that this tile belongs to
	 */
	this.belongsTo = room || null;

	/**
	 * @property {Array} entities - An array that holds all entities on this tile
	 */
	this.entities = [];

	/**
	 * @property {Boolean} staticObject - A static object that is on this tile
	 */
	this.blockLight = blockLight;

	/**
	 * @property {Number} lightLevel - The brightness of the current tile
	 */
	this.lightLevel = 0;

	/**
	 * @property {Boolean} explored - Boolean if a tile has already been explorer by the player
	 */
	this.explored = false;

};

Tile.prototype = {

	/**
	 * Function that adds an entity to a tile
	 * @protected
	 *
	 * @param {Entity} entity - The entity being removed from a tile
	 */
	addEntity: function(entity) {

		//Aad the entity to the list
		this.entities.push(entity);

	},

	/**
	 * Function that removes an entity from a tile
	 * @protected
	 *
	 * @param {Entity} entity - The entity being removed from a tile
	 *
	 * @return {Boolean} Returns true on success, returns false on failure
	 */
	removeEntity: function(entity) {

		//Get the current position of the entity
		var index = this.entities.indexOf(entity);

		//If the entity exists, remove it
		if(index === -1) {

			//The entity doesn't even exist on this tile
			return false;

		}else{

			//Remove the entity from the tile
			this.entities.splice(index, 1);

			//We have removed the entity
			return true;

		}

	}

};

//Export the Browserify module
module.exports = Tile;

},{}],20:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * Queue constructor
 *
 * @class Queue
 * @classdesc Stores events and is able to retrieve them based on their time
 */
var Queue = function() {

	/**
	 * @property {Number} time - Every queue starts at time zero
	 */
	this.time = 0;

	/**
	 * @property {Array} events - The array with all the events
	 */
	this.events = [];

	/**
	 * @property {Array} eventTimes - The array with all the times of the events
	 */
	this.eventTimes = [];

};

Queue.prototype = {

	/**
	 * Returns the elapsed time since the beginning of this queue
	 * @protected
	 *
	 * @return {Number} The elapsed time
	 */
	getTime: function() {

		//Return the time as an number
		return this.time;

	},

	/**
	 * Clear all events that are queued
	 * @protected
	 */
	clear: function() {

		this.events = [];
		this.eventTimes = [];

	},

	/**
	 * Function to call when you want to follow a specific entity
	 * @protected
	 *
	 * @param {Entity} event - The event that is being added to the queue
	 * @param {Number} time - The time on which this event should be executed
	 */
	add: function(event, time) {

		//Set the index variable to the total amount of all current events
		var index = this.events.length;

		//Loop through all the current event times
		for(var i = 0; i < this.eventTimes.length; i++) {

			//If the current events time is bigger than the supplied time
			//we have to insert the new event here
			if(this.eventTimes[i] > time) {

				//Set the index variable to this number
				index = i;

				//Stop looping because we have found the insert place
				break;

			}

		}

		//Insert the supplied event in the array
		this.events.splice(index, 0, event);

		//Insert the supplied time in the array
		this.eventTimes.splice(index, 0, time);

	},

	/**
	 * Returns the next entity after removing it from the queue
	 * @protected
	 *
	 * @return {Entity} The next entity from the queue
	 */
	get: function() {

		//If there aren't any events, return null
		if(this.events.length === 0) {

			return null;

		}

		//Get the first eventTime from the array and remove it from the array
		var time = this.eventTimes.splice(0, 1)[0];

		//If the time is greater than zero, advance the time
		if(time > 0) {

			//Advance the time by the time the current event takes
			this.time += time;

			//Loop through all remaining events and decrease their time
			for(var i = 0; i < this.eventTimes.length; i++) {

				//Decrease the future times with the time the current event takes
				this.eventTimes[i] -= time;

			}

		}

		//Return the first event and remove it from the queue
		return this.events.splice(0, 1)[0];

	},

	/**
	 * Remove a specific event from the queue
	 * @protected
	 *
	 * @param {Entity} event - The event that is being added to the queue
	 *
	 * @return {Boolean} True if successfully removed, false if failed
	 */
	remove: function(event) {

		//Get the position of the event supplied
		var index = this.events.indexOf(event);

		//If the supplied event isn't in the queue, return false
		if(index === -1) {

			return false;

		}

		//Remove the event from the queue and the time array
		this.events.splice(index, 1);
		this.eventTimes.splice(index, 1);

		//We successfully removed the event
		return true;

	}

};

//Export the Browserify module
module.exports = Queue;


},{}],21:[function(require,module,exports){
//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Queue = require('./queue.js');

/**
 * Scheduler constructor
 *
 * @class Scheduler
 * @classdesc Is able to keep track of time and manages scheduling events in a queue
 */
var Scheduler = function() {

	/**
	 * @property {Number} time - Every queue starts at time zero
	 */
	this.queue = null;

	/**
	 * @property {Array} events - The array with all the repeated events
	 */
	this.repeat = [];

	/**
	 * @property {Object} current - The current event
	 */
	this.current = null;

	/**
	 * @property {int} lockCount - Recursive lock variable
	 */
	this.lockCount = 0;

	//Initialize itself
	this.initialize();

};

Scheduler.prototype = {

	/**
	 * Initialize the game, create all objects
	 * @protected
	 */
	initialize: function() {

		//Create a new Queue object
		this.queue = new Queue();

	},

	/**
	 * Returns the elapsed time since the beginning of the queue
	 * @protected
	 *
	 * @return {Number} The elapsed time
	 */
	getTime: function() {

		//Return the time as an number
		return this.queue.getTime();

	},

	/**
	 * Schedule a new item
	 * @protected
	 *
	 * @param {Entity} entity - The entity being added
	 * @param {Boolean} repeat - Is this a recurring thing
	 *
	 * @return {Scheduler} The current Scheduler object
	 */
	add: function(entity, repeat) {

		//Add a new item to the queue based on their speed
		this.queue.add(entity, 1 / entity.getSpeed());

		//If this is a recurring event, we add it to the repeat array
		if(repeat) {

			this.repeat.push(entity);

		}

		//Return the scheduler object
		return this;

	},

	/**
	 * Remove an item from the scheduler
	 * @protected
	 *
	 * @param {Entity} entity - The entity being removed
	 *
	 * @return {Boolean} True if successfully removed, false if failed to remove
	 */
	remove: function(entity) {

		//Remove the item from the queue and store the returned bool
		var result = this.queue.remove(entity);

		//Look if the item being removed is a recurring item
		var index = this.repeat.indexOf(entity);

		//If it is, remove it from the repeat array
		if(index !== -1) {

			//Remove the item
			this.repeat.splice(index, 1);

		}

		//If the current item is the item being removed
		//Reset the current item to null
		if(this.current === entity) {

			this.current = null;

		}

		//Return true or false depending on success or not
		return result;

	},

	/**
	 * Clear the scheduler
	 * @protected
	 *
	 * @return {Scheduler} The cleared Scheduler object
	 */
	clear: function() {

		//Clear all the variables used in this scheduler
		this.queue.clear();
		this.repeat = [];
		this.current = null;

		//Return the empty scheduler object
		return this;

	},

	/**
	 * Get the next entity from the queue
	 * @protected
	 *
	 * @return {Entity} The next Entity from the queue
	 */
	next: function() {

		//If there is a current item and it is a repeating item, add it to the queue again
		if(this.current && this.repeat.indexOf(this.current) !== -1) {

			//Add the current item to the queue
			this.queue.add(this.current, 1 / this.current.getSpeed());

		}

		//Get the next item from the queue and set it to the current action
		this.current = this.queue.get();

		//Return the current action
		return this.current;

	},

	/**
	 * Function that is called when the game continues one tick
	 * @protected
	 *
	 * @return {Boolean} True if the entity could act, false if it stopped before that
	 */
	tick: function() {

		//Check if we should continue based on the lock
		if(this.lockCount > 0) {

			return false;

		}

		//Get the next entity
		var entity = this.next();

		//If there isn't a next entity we stop here
		if(entity === null) {

			return false;

		}

		//We can let the entity act
		entity.act();

		//We managed to act, so we return true
		return true;

	},

	/**
	 * Lock the scheduler so it won't continue until it's unlocked
	 *
	 * The lock is recursive, that means it needs to be unlocked as many
	 * times as it has been locked.
	 * @protected
	 */
	lock: function() {

		//Add one to the lockCount
		this.lockCount++;

	},

	/**
	 * Unlock the scheduler, but only if it is locked
	 * @protected
	 */
	unlock: function() {

		//Check if the lockCount is 0
		if(this.lockCount === 0) {

			//Throw an error in the console and return
			console.error("You can't unlock an unlocked scheduler!");
			return;

		}

		//Subtract one from the lockCount
		this.lockCount--;

	}

};

//Export the Browserify module
module.exports = Scheduler;

},{"./queue.js":20}]},{},[10])