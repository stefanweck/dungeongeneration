/*! Dungeon Generator - v1.8.0 - 2014-04-22
* https://github.com/stefanweck/dungeongeneration
* Copyright (c) 2014 Stefan Weck */
/**
 * Roguelike javascript game with HTML5's canvas
 *
 * v.1.8.0 - Build on: 21 April 2014
 *
 * Features:
 * - Random Dungeon Generation ( Surprise! )
 * - Corridors between the rooms
 * - Random doors at the end of corridors
 * - A player that can walk through the dungeon
 * - A camera with a viewport
 * - Fog of War!
 * - Field of view for the player
 * - Configurable settings
 * - A component entity system
 * - Turns
 * - Interaction with objects, such as doors
 * - Monsters and enemies!
 * - Path finding
 *
 * What's next?
 *
 * - Different types of rooms
 * - Advanced enemy behaviour
 * - Looting
 * - Treasures
 * - Inventory
 * - User Interface
 * - Text log with actions/events
 * - And more!
 *
 */

/**
 * @namespace Roguelike
 */
var Roguelike = Roguelike || {

	//Details, version etc
	VERSION: '1.8.0',

	//Holder for all the game's available components
	Components: {},

	//Holder for all the game's available systems
	Systems: {}

};

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

		//Decorate the dungeon
		this.map.mapFactory.decorateDungeon();

		//Create the camera object
		this.camera = new Roguelike.Camera(this, {x: 0, y: 0});

		//Create the player entity
		var playerPosition = new Roguelike.Vector2(this.map.entrance.x, this.map.entrance.y);
		this.player = Roguelike.PlayerFactory.newPlayerWarrior(playerPosition);

		//Add the player to the entities list of the current map
		this.map.entities.addEntity(this.player);

		//Let the camera follow the player entity
		this.camera.follow(this.player, this.settings.canvas.width / 2, this.settings.canvas.height / 2);

		//Add all systems to the game
		//First we add the systems that can queue movement on entities
		this.systems.push(new Roguelike.Systems.PathFinding(this));
		this.systems.push(new Roguelike.Systems.Control(this));

		//Movement system checks the queued movement for collision and moves accordingly
		this.systems.push(new Roguelike.Systems.Movement(this));

		//Next up are the systems that handle specific queues like open or combat
		this.systems.push(new Roguelike.Systems.Open(this));
		this.systems.push(new Roguelike.Systems.Combat(this));

		//Last thing on the list are visual systems, these should always be updated last
		this.systems.push(new Roguelike.Systems.LightMap(this));
		this.systems.push(new Roguelike.Systems.Render(this));

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

		//Loop through each system
		for(var s = 0; s < this.systems.length; s++) {

			//Update the current system
			this.systems[s].update();

		}

	}

};

Roguelike.Utils = {

	/**
	 * Function to generate a random number between two values
	 * @public
	 *
	 * @param {number} from - The minimum number
	 * @param {number} to - The maximum number
	 */
	randomNumber: function(from, to) {

		//TODO: Implement seedable random number generator
		return Math.floor(Math.random() * (to - from + 1) + from);

	},

	/**
	 * Function to extend the default options with the users options
	 * @public
	 *
	 * @param {object} a - The original object to extend
	 * @param {object} b - The new settings that override the original object
	 */
	extend: function(a, b) {

		//Check each property
		for(var key in b) {
			if(b.hasOwnProperty(key)) {
				a[key] = b[key];
			}
		}

		//Return the extended object
		return a;

	},

	/**
	 * Function to check if an object is in a list
	 * @public
	 *
	 * @param {object} object - The object to search for
	 * @param {array} list - The list, aka the array
	 */
	//TODO: This function should always have the same return type
	contains: function(object, list) {

		//Loop through the list
		for(var i = 0; i < list.length; i++) {

			//If the current list item equals the object, return the position!
			if(list[i] === object) {
				return i;
			}
		}

		//No results found, the list doesn't contain the object
		return false;

	}

};

Roguelike.Camera = function(game, position) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {object} position - The x and y top left coordinates of this camera, in pixels
	 */
	this.position = position;

	/**
	 * @property {number} viewportWidth - The width of the game's canvas, in pixels
	 */
	this.viewportWidth = game.settings.canvas.width;

	/**
	 * @property {number} viewportHeight - The height of the game's canvas, in pixels
	 */
	this.viewportHeight = game.settings.canvas.height;

	/**
	 * @property {number} minimumDistanceX - The minimal distance from horizontal borders before the camera starts to move, in pixels
	 */
	this.minimumDistanceX = 0;

	/**
	 * @property {number} minimumDistanceY - The minimal distance from vertical borders before the camera starts to move, in pixels
	 */
	this.minimumDistanceY = 0;

	/**
	 * @property {object} followObject - The object that should be followed by the camera
	 */
	this.followObject = null;

	/**
	 * @property {Roguelike.Boundary} viewportBoundary - The boundary that represents the viewport
	 */
	this.viewportBoundary = new Roguelike.Boundary(
		this.position.x * game.settings.tileSize,
		this.position.y * game.settings.tileSize,
		this.viewportWidth,
		this.viewportHeight
	);

	/**
	 * @property {Roguelike.Boundary} mapBoundary - The boundary that represents the viewport
	 */
	this.mapBoundary = new Roguelike.Boundary(
		0,
		0,
		game.settings.tilesX * game.settings.tileSize,
		game.settings.tilesY * game.settings.tileSize
	);

};

Roguelike.Camera.prototype = {

	/**
	 * Function to call when you want to follow a specific entity
	 * @protected
	 *
	 * @param {Roguelike.Entity} followEntity - The entity that should be followed by the camera, this entity is required to have the position component
	 * @param {number} minimumDistanceX - The minimal distance from horizontal borders before the camera starts to move
	 * @param {number} minimumDistanceY - The minimal distance from vertical borders before the camera starts to move
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
			var tileSize = this.game.settings.tileSize;

			//Move the camera horizontal first
			if((this.followObject.position.x * tileSize) - this.position.x + this.minimumDistanceX > this.viewportWidth) {

				//Set the new horizontal position for the camera
				this.position.x = (this.followObject.position.x * tileSize) - (this.viewportWidth - this.minimumDistanceX);

			}else if((this.followObject.position.x * tileSize) - this.minimumDistanceX < this.position.x) {

				//Set the new horizontal position for the camera
				this.position.x = (this.followObject.position.x * tileSize) - this.minimumDistanceX;

			}

			//Then move the camera vertical
			if((this.followObject.position.y * tileSize) - this.position.y + this.minimumDistanceY > this.viewportHeight) {

				//Set the new vertical position for the camera
				this.position.y = (this.followObject.position.y * tileSize) - (this.viewportHeight - this.minimumDistanceY);

			}else if((this.followObject.position.y * tileSize) - this.minimumDistanceY < this.position.y) {

				//Set the new vertical position for the camera
				this.position.y = (this.followObject.position.y * tileSize) - this.minimumDistanceY;

			}

		}

		//Now we update our viewport's boundaries
		this.viewportBoundary.set(this.position.x, this.position.y);

		//We don't want the camera leaving the world's boundaries, for obvious reasons
		if(!this.viewportBoundary.isWithin(this.mapBoundary)) {

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

Roguelike.Vector2 = function(x, y) {

	/**
	 * @property {number} x - The x coordinate of this vector2 object
	 */
	this.x = x;

	/**
	 * @property {number} x - The y coordinate of this vector2 object
	 */
	this.y = y;

};

Roguelike.Vector2.prototype = {

	/**
	 * Add another vector2 object
	 * @protected
	 *
	 * @param {Roguelike.Vector2} other - The y other vector2 object
	 */
	add: function(other) {

		var dx = pos.x - this.x;
		var dy = pos.y - this.y;

		return Math.abs(Math.sqrt((dx * dx) + (dy * dy)));

	},

	/**
	 * Distance to another Vector2 Object
	 * @protected
	 *
	 * @param {object} pos - The position of the other object
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
	 * @param {object} pos - The position of the other object
	 */
	manhattan: function(pos) {

		return(Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y));

	},

	/**
	 * Clone the current Vector2 Object
	 * @protected
	 */
	clone: function() {

		return(new Vector2(this.x, this.y));

	},

	/**
	 * Create a string from this Vector2 Object
	 * @protected
	 */
	toString: function() {

		return("(" + this.x + ", " + this.y + ")");

	}

};

Roguelike.Boundary = function(left, top, width, height) {

	/**
	 * @property {number} left - The left position of this boundary, in pixels
	 */
	this.left = left || 0;

	/**
	 * @property {number} top - The top position of this boundary, in pixels
	 */
	this.top = top || 0;

	/**
	 * @property {number} width - The width of this boundary, in pixels
	 */
	this.width = width || 0;

	/**
	 * @property {number} height - The height of this boundary, in pixels
	 */
	this.height = height || 0;

	/**
	 * @property {number} right - The right position of this boundary, in pixels
	 */
	this.right = (this.left + this.width);

	/**
	 * @property {number} bottom - The bottom position of this boundary, in pixels
	 */
	this.bottom = (this.top + this.height);

};

Roguelike.Boundary.prototype = {

	/**
	 * Function that allows the user to set new values for the boundary
	 * @protected
	 *
	 * @param {number} left - The left position of this boundary, in pixels
	 * @param {number} top - The top position of this boundary, in pixels
	 * @param {number} width - Optional: The width of this boundary, in pixels
	 * @param {number} height - Optional: The height of this boundary, in pixels
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
	 * @param {Roguelike.Boundary} boundary - The boundary to check against
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
	 * @param {Roguelike.Boundary} boundary - The boundary to check against
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

Roguelike.Entity = function() {

	/**
	 * @property {object} components - An object filled with all the components this entity has
	 */
	this.components = {};

	/**
	 * @property {Roguelike.Event} onAddComponent - Event that handles AddComponent event
	 */
	this.onAddComponent = new Roguelike.Event();

	/**
	 * @property {Roguelike.Event} onRemoveComponent - Event that handles RemoveComponent event
	 */
	this.onRemoveComponent = new Roguelike.Event();

};

Roguelike.Entity.prototype = {

	/**
	 * Check whether this entity has a certain component
	 * @protected
	 *
	 * @param {string} name - The name of the component
	 */
	hasComponent: function(name) {

		return (this.components[name] !== undefined);

	},

	/**
	 * Get a certain component on this entity
	 * @protected
	 *
	 * @param {string} name - The name of the component
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

		//Trigger the AddComponent event
		this.onAddComponent.trigger(component);

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

		//Trigger the RemoveComponent event
		this.onRemoveComponent.trigger(component);

	}

};

Roguelike.Group = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {array} entities - Collection of all the entities in this group
	 */
	this.entities = [];

};

Roguelike.Group.prototype = {

	/**
	 * Function to add a new entity to this group
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - A reference to entity being added
	 */
	addEntity: function(entity) {

		//Check if the entity is the correct object
		if(!entity instanceof Roguelike.Entity) {
			return;
		}

		//Add the current entity to the list
		this.entities.push(entity);

	},

	/**
	 * Function to remove an entity from this group
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - A reference to entity being removed
	 */
	removeEntity: function(entity) {

		//Check if the entity exists, if not, we don't have to delete it
		var position = Roguelike.Utils.contains(entity, this.entities);

		//The element doesn't exist in the list
		if(position === false) {
			return;
		}

		//Remove the current entity from the group
		this.entities.splice(position, 1);

	},

	/**
	 * Function to return all entities with certain components
	 * @protected
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

Roguelike.Components.Sprite = function(sprite, row, tile) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'sprite';

	/**
	 * @property {string} sprite - The sprite image of this entity
	 */
	this.sprite = sprite;

	/**
	 * @property {number} row - The row that the sprite is on, on the tileset
	 */
	this.row = row;

	/**
	 * @property {number} tile - The specific tile that the sprite is on, on the tileset
	 */
	this.tile = tile;

};

Roguelike.Components.Health = function(maxHealth) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'health';

	/**
	 * @property {number} health - The starting, and maximum health of the entity
	 */
	this.health = this.maxHealth = maxHealth;

};

Roguelike.Components.Health.prototype = {

	/**
	 * Check whether the entity is dead
	 * @protected
	 */
	isDead: function() {

		//Return true or false based on the entities health
		return this.health <= 0;

	},

	/**
	 * Function to take damage
	 * @protected
	 */
	takeDamage: function(damage) {

		//Subtract the damage from the health of this entity
		this.health -= damage;

	}

};

Roguelike.Components.CanOpen = function() {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'canOpen';

	/**
	 * @property {Roguelike.Event} events - Event holder
	 */
	this.events = new Roguelike.Event();

	/**
	 * @property {string} state - The state of this door, closed opened etc
	 */
	this.state = 'closed';

	/**
	 * @property {array} actions - The next actions to perform on this object
	 */
	this.actions = [];

	//Initialize the component
	this.initialize();

};

Roguelike.Components.CanOpen.prototype = {

	/**
	 * The 'constructor' for this component
	 * Adds the bump into function to the event list
	 * @protected
	 */
	initialize: function() {

		//Attach the bumpInto function to the bumpInto event
		this.events.on('bumpInto', this.bumpInto, this);

	},

	/**
	 * Function to perform when something collides with this entity
	 * @protected
	 */
	bumpInto: function() {

		//If the door is closed, add an open action to the actions stack
		if(this.state === 'closed') {

			//The Open System will handle opening this door
			this.actions.push("open");

		}

	}

};

Roguelike.Components.LightSource = function(gradient, radius) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'lightSource';

	/**
	 * @property {bool} gradient - Should the lightmap be drawn with a gradient
	 */
	this.gradient = gradient;

	/**
	 * @property {number} radius - The radius of the light, how far does it shine it's magical light!
	 */
	this.radius = radius;

};

Roguelike.Components.Collide = function(collide) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'collide';

	/**
	 * @property {bool} collide - True or false depending on if it should collide with other entities
	 */
	this.collide = collide;

};

Roguelike.Components.KeyboardControl = function() {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'keyboardControl';

};

Roguelike.Components.Position = function(position) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'position';

	/**
	 * @property {Roguelike.Vector2} position - The position object of this entity
	 */
	this.position = position;

	/**
	 * @property {array} actions - The next actions to perform on this object
	 */
	this.actions = [];

};

Roguelike.Components.Weapon = function(damage) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'weapon';

	/**
	 * @property {number} damage - The damage that this weapon does
	 */
	this.damage = damage;

};

Roguelike.Components.CanFight = function() {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'canFight';

	/**
	 * @property {Roguelike.Event} events - Event holder
	 */
	this.events = new Roguelike.Event();

	/**
	 * @property {array} actions - A stack with the next actions to perform on this object
	 */
	this.actions = [];

	//Initialize the component
	this.initialize();

};

Roguelike.Components.CanFight.prototype = {

	/**
	 * The 'constructor' for this component
	 * Adds the bump into function to the event list
	 * @protected
	 */
	initialize: function() {

		//Attach the bumpInto function to the bumpInto event
		this.events.on('bumpInto', this.bumpInto, this);

	},

	/**
	 * Function to perform when something collides with this entity
	 * @protected
	 */
	bumpInto: function(entity, collisionEntity) {

		//Push the enemy that is going to get attacked into the actions stack
		//The combat system will handle the combat!
		this.actions.push(collisionEntity);

	}

};

Roguelike.Components.Behaviour = function(behaviour) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'behaviour';

	/**
	 * @property {string} behaviour - A string with the behaviour of the entity that holds this component
	 */
	this.behaviour = behaviour;

};

Roguelike.Systems.Render = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {object} canvas - Reference to the canvas object everything is drawn on
	 */
	this.canvas = null;

	/**
	 * @property {object} canvas - The 2D context of the current canvas object
	 */
	this.context = null;

	/**
	 * @property {array} tileColors - Contains all the default colors for the tiles
	 */
	this.tileColors = ['#302222', '#443939', '#6B5B45'];

	//Initialize itself
	this.initialize();

};

Roguelike.Systems.Render.prototype = {

	/**
	 * The 'constructor' for this component
	 * Gets that canvas object and it's 2D context
	 * @protected
	 */
	initialize: function() {

		//Get the canvas object from the games settings
		this.canvas = this.game.settings.canvas;

		//Define the context to draw on
		this.context = this.game.settings.canvas.getContext("2d");

		//Disable image smoothing with some very ugly browser specific code
		//TODO: Check again in 10 years if there are better solutions to this
		this.context.mozImageSmoothingEnabled = false;
		this.context.webkitImageSmoothingEnabled = false;
		this.context.msImageSmoothingEnabled = false;
		this.context.imageSmoothingEnabled = false;

	},

	/**
	 * Draw the current map onto the canvas
	 * @protected
	 */
	drawMap: function() {

		//Define variables
		var map = this.game.map;
		var camera = this.game.camera;

		//TODO: Use a preloader and only get the file once, not every frame
		var tileSet = document.getElementById("tileset");

		//Save the context to push a copy of our current drawing state onto our drawing state stack
		this.context.save();

		//Loop through every horizontal row
		for(var x = 0; x < map.tilesX; x++) {

			//Loop through every vertical row
			for(var y = 0; y < map.tilesY; y++) {

				//Get the type of the current tile
				var tileRow = map.tiles[x][y].tileRow;
				var tileNumber = map.tiles[x][y].tileNumber;

				this.context.drawImage(
					tileSet,
					tileNumber * 16,
					tileRow * 16,
					16,
					16,
					(x * map.tileSize) - camera.position.x,
					(y * map.tileSize) - camera.position.y,
					this.game.map.tileSize,
					this.game.map.tileSize
				);

			}

		}

		//Pop the last saved drawing state off of the drawing state stack
		this.context.restore();

	},

	/**
	 * Function that gets called when the game continues one tick
	 * @protected
	 */
	update: function() {

		//Update the camera
		//TODO: Move this outta here!
		this.game.camera.update();

		//Clear the canvas and draw the map
		this.clear();
		this.drawMap();

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("position", "sprite");

		//Save the context to push a copy of our current drawing state onto our drawing state stack
		this.context.save();

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++) {

			//Get the components from the current entity and store them temporarily in a variable
			var renderComponent = entities[i].getComponent("sprite");
			var positionComponent = entities[i].getComponent("position");

			//TODO: Use a preloader and only get the file once, not every frame T__T
			var img = document.getElementById(renderComponent.sprite);

			this.context.drawImage(
				img,
				renderComponent.tile * 16,
				renderComponent.row * 16,
				16,
				16,
				(positionComponent.position.x * this.game.map.tileSize) - this.game.camera.position.x,
				(positionComponent.position.y * this.game.map.tileSize) - this.game.camera.position.y,
				this.game.map.tileSize,
				this.game.map.tileSize
			);

			if(entities[i].hasComponent("health")) {

				var healthComponent = entities[i].getComponent("health");

				this.context.font = 'bold 12pt arial';
				this.context.fillStyle = 'white';
				this.context.fillText(
					healthComponent.health,
					(positionComponent.position.x * this.game.map.tileSize) - this.game.camera.position.x,
					(positionComponent.position.y * this.game.map.tileSize) - this.game.camera.position.y
				);

			}

		}

		//Pop the last saved drawing state off of the drawing state stack
		this.context.restore();

		//Draw the lightmap
		this.drawLightMap();

	},

	/**
	 * Draw the current lightmap onto the canvas
	 * @protected
	 */
	drawLightMap: function() {

		//Define variables
		var map = this.game.map;
		var camera = this.game.camera;

		//Save the context to push a copy of our current drawing state onto our drawing state stack
		this.context.save();

		//Loop through every horizontal row
		for(var x = 0; x < map.tilesX; x++) {

			//Loop through every vertical row
			for(var y = 0; y < map.tilesY; y++) {

				//Draw the lightmap
				if(map.tiles[x][y].explored === true && 1 - map.tiles[x][y].lightLevel > 0.7) {

					this.context.fillStyle = "rgba(0, 0, 0, 0.7)";

				}else{

					this.context.fillStyle = "rgba(0, 0, 0, " + (1 - map.tiles[x][y].lightLevel) + ")";

				}

				//Create a rectangle!
				this.context.fillRect(
					//Get the current position of the tile, and check where it is in the camera's viewport
					(x * map.tileSize) - camera.position.x,
					(y * map.tileSize) - camera.position.y,
					map.tileSize,
					map.tileSize
				);

			}

		}

		//Pop the last saved drawing state off of the drawing state stack
		this.context.restore();

	},

	/**
	 * Function to clear the canvas
	 * @protected
	 */
	clear: function() {

		//Clear the entire canvas
		this.context.clearRect(0, 0, this.game.settings.canvas.width, this.game.settings.canvas.height);

	}

};

Roguelike.Systems.Open = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

};

Roguelike.Systems.Open.prototype = {

	/**
	 * Function that gets called when the game continues one tick
	 * @protected
	 */
	update: function() {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("canOpen", "sprite", "position", "collide");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++) {

			//Get the components from the current entity and store them temporarily in a variable
			var canOpenComponent = entities[i].getComponent("canOpen");
			var spriteComponent = entities[i].getComponent("sprite");
			var positionComponent = entities[i].getComponent("position");
			var collideComponent = entities[i].getComponent("collide");

			//Check if any actions need to be performed on this openable entity
			if(canOpenComponent.actions.length !== 0) {

				//Loop through the actions
				for(var a = canOpenComponent.actions.length; a > 0; a--) {

					//Pop the action from the "stack"
					var currentAction = canOpenComponent.actions.pop();

					//Action to open the door
					if(currentAction === "open") {

						//Change the door's state to open
						canOpenComponent.state = "open";

						//Change the sprite to open
						spriteComponent.tile += 1;

						//Make sure the collide component doesn't say it collides anymore
						collideComponent.collide = false;

						//Make sure the tile that this openable entity is on doesn't block light anymore
						this.game.map.tiles[positionComponent.position.x][positionComponent.position.y].blockLight = false;

					}

				}

			}

		}

	}

};

Roguelike.Systems.LightMap = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {object} mapSize - The size of the current map
	 */
	this.mapSize = {x: game.map.tilesX, y: game.map.tilesY};

	/**
	 * @property {object} tiles - Object that is being used to store tile data before returning it
	 */
	this.tiles = [];

	/**
	 * @property {array} mult - Multipliers for transforming coordinates into other octants
	 */
	this.mult = [
		[1, 0, 0, -1, -1, 0, 0, 1],
		[0, 1, -1, 0, 0, -1, 1, 0],
		[0, 1, 1, 0, 0, -1, -1, 0],
		[1, 0, 0, 1, -1, 0, 0, -1]
	];

};

Roguelike.Systems.LightMap.prototype = {

	/**
	 * Function that checks if a tile blocks light or not
	 * @protected
	 *
	 * @param {number} x - The X position of the tile
	 * @param {number} y - The Y position of the tile
	 */
	doesTileBlock: function(x, y) {
		return this.game.map.tiles[x][y].blockLight;
	},

	/**
	 * Function to calculate a new octant
	 * @protected
	 */
	calculateOctant: function(position, row, start, end, lightsource, xx, xy, yx, yy, id) {
		this.tiles.push({
			x: position.x,
			y: position.y,
			lightLevel: 0
		});

		var new_start = 0;

		if(start < end) return;

		var radius_squared = lightsource.radius * lightsource.radius;

		for(var i = row; i < lightsource.radius + 1; i++) {
			var dx = -i - 1;
			var dy = -i;

			var blocked = false;

			while(dx <= 0) {

				dx += 1;

				var X = position.x + dx * xx + dy * xy;
				var Y = position.y + dx * yx + dy * yy;

				if(X < this.mapSize.x && X >= 0 && Y < this.mapSize.y && Y >= 0) {

					var l_slope = (dx - 0.5) / (dy + 0.5);
					var r_slope = (dx + 0.5) / (dy - 0.5);

					if(start < r_slope) {
						continue;
					}else if(end > l_slope) {
						break;
					}else{
						if(dx * dx + dy * dy < radius_squared) {
							var pos1 = new Roguelike.Vector2(X, Y);
							var pos2 = position;
							var d = (pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.y - pos2.y) * (pos1.y - pos2.y);

							this.tiles.push({
								x: X,
								y: Y,
								lightLevel: (lightsource.gradient === false) ? 1 : (1 - (d / (lightsource.radius * lightsource.radius)))
							});
						}

						if(blocked) {
							if(this.doesTileBlock(X, Y)) {
								new_start = r_slope;
								continue;
							}else{
								blocked = false;
								start = new_start;
							}
						}else{
							if(this.doesTileBlock(X, Y) && i < lightsource.radius) {
								blocked = true;
								this.calculateOctant(position, i + 1, start, l_slope, lightsource, xx, xy, yx, yy, id + 1);

								new_start = r_slope;
							}
						}
					}
				}
			}

			if(blocked) break;
		}
	},

	/**
	 * Sets flag lit to false on all tiles within radius of position specified
	 * @protected
	 */
	clear: function() {
		var i = this.tiles.length;
		while(i--) {
			this.tiles[i].lightLevel = 0;
		}

		var o = this.tiles;
		this.tiles = [];
		return o;
	},

	/**
	 * Calculate the new lightning from this lightsource
	 * @protected
	 *
	 * @param {Roguelike.Components.LightSource} lightSource - The lightsource that is being calculated
	 * @param {Roguelike.Components.Position} position - The position of the lightsource
	 */
	calculate: function(lightSource, position) {
		for(var i = 0; i < 8; i++) {
			this.calculateOctant(position, 1, 1.0, 0.0, lightSource,
				this.mult[0][i], this.mult[1][i], this.mult[2][i], this.mult[3][i], 0);
		}

		//Push this tile and it's light level's in the tiles array
		this.tiles.push({
			x: position.x,
			y: position.y,
			lightLevel: 1
		});

		//Return the tiles
		return this.tiles;
	},

	/**
	 * Function that gets called when the game continues one tick
	 * @protected
	 */
	update: function() {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("lightSource", "position");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++) {

			//Get the keyboardControl component
			var lightSourceComponent = entities[i].getComponent("lightSource");
			var positionComponent = entities[i].getComponent("position");

			//Update the lightsource
			var newLight = this.clear().concat(this.calculate(lightSourceComponent, positionComponent.position));

			//Update the tiles on the map with the new light levels
			for(var l = 0; l < newLight.length; l++) {
				this.game.map.tiles[newLight[l].x][newLight[l].y].lightLevel = newLight[l].lightLevel;
				this.game.map.tiles[newLight[l].x][newLight[l].y].explored = true;
			}

		}

	}

};

Roguelike.Systems.Control = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Roguelike.Keyboard} keyboard - Reference to the keyboard object
	 */
	this.keyboard = null;

	/**
	 * @property {Roguelike.Key} upKey - Reference to up key on the keyboard
	 */
	this.upKey = null;

	/**
	 * @property {Roguelike.Key} downKey - Reference to down key on the keyboard
	 */
	this.downKey = null;

	/**
	 * @property {Roguelike.Key} leftKey - Reference to left key on the keyboard
	 */
	this.leftKey = null;

	/**
	 * @property {Roguelike.Key} rightKey - Reference to right key on the keyboard
	 */
	this.rightKey = null;

	//Initialize itself
	this.initialize();

};

Roguelike.Systems.Control.prototype = {

	/**
	 * The 'constructor' for this component
	 * Sets up the right keys and sets functions on them
	 * @protected
	 */
	initialize: function() {

		//Create a new keyboard
		this.keyboard = new Roguelike.Keyboard(this);
		this.keyboard.initialize();

		//Reference to the current system
		var _this = this;

		//Add up key and tell it to move the entities up when it hits
		this.upKey = this.keyboard.getKey(38);

		//Function to perform
		var moveUp = function() {
			_this.keyHandler(38);
		};

		//Attach the function to the keydown event
		this.upKey.onDown.on(38, moveUp, _this);

		//Add down key and tell it to move the entities down when it hits
		this.downKey = this.keyboard.getKey(40);

		//Function to perform
		var moveDown = function() {
			_this.keyHandler(40);
		};

		//Attach the function to the keydown event
		this.downKey.onDown.on(40, moveDown, _this);

		//Add left key and tell it to move the entities left when it hits
		this.leftKey = this.keyboard.getKey(37);

		//Function to perform
		var moveLeft = function() {
			_this.keyHandler(37);
		};

		//Attach the function to the keydown event
		this.leftKey.onDown.on(37, moveLeft, _this);

		//Add right key and tell it to move the entities right when it hits
		this.rightKey = this.keyboard.getKey(39);

		//Function to perform
		var moveRight = function() {
			_this.keyHandler(39);
		};

		//Attach the function to the keydown event
		this.rightKey.onDown.on(39, moveRight, _this);

	},

	/**
	 * Function to queue movement onto entities that have the keyboard control component
	 * @protected
	 *
	 * @param {number} key - The keycode of the move being queued
	 */
	keyHandler: function(key) {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		//TODO: Don't get this entire list three times
		var entities = this.game.map.entities.getEntities("keyboardControl", "position");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++) {

			//Add this direction to it's movement queue
			this.queueMovement(key, entities[i]);

		}

		//All the entities movements are queued, it's time to update the other game mechanics
		this.game.update();

	},

	/**
	 * Function that gets called when the game continues one tick
	 * @protected
	 */
	update: function() {

		//Nothing here, yet..

	},

	/**
	 * The function that gets called when the player moves
	 * @protected
	 *
	 * @param {number} direction - The direction the entities are being moved
	 * @param {Roguelike.Entity} entity - The entity that is being controlled
	 */
	queueMovement: function(direction, entity) {

		//Get the current entities position component
		var positionComponent = entity.getComponent("position");

		//Define variables
		var newPosition;

		//Check which controls are being pressed and update the player accordingly
		switch(direction) {

			case (37): //Left

				newPosition = new Roguelike.Vector2(positionComponent.position.x - 1, positionComponent.position.y);

				break;

			case (38): //Up

				newPosition = new Roguelike.Vector2(positionComponent.position.x, positionComponent.position.y - 1);

				break;

			case (39): //Right

				newPosition = new Roguelike.Vector2(positionComponent.position.x + 1, positionComponent.position.y);

				break;

			case (40): //Down

				newPosition = new Roguelike.Vector2(positionComponent.position.x, positionComponent.position.y + 1);

				break;

		}

		//Push the new position to the queue
		positionComponent.actions.push(newPosition);

	}

};

Roguelike.Systems.Movement = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

};

Roguelike.Systems.Movement.prototype = {

	/**
	 * Function that gets called when the game continues one tick
	 * @protected
	 */
	update: function() {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("position");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++) {

			//Get the components
			var positionComponent = entities[i].getComponent("position");

			//Loop through the actions
			for(var a = positionComponent.actions.length - 1; a >= 0; a--) {

				//Pop the action from the "stack"
				var newPosition = positionComponent.actions[a];

				//Check if the new position is correct
				if(this.canMove(entities[i], newPosition)) {

					//Get the tile to which the entity is trying to move
					var currentTile = this.game.map.tiles[positionComponent.position.x][positionComponent.position.y];
					var nextTile = this.game.map.tiles[newPosition.x][newPosition.y];

					//Remove the entity from the tile it's currently on
					//TODO: Make a function out of this, because it's also being used in the Combat System
					var currentEntityPosition = currentTile.entities.indexOf(entities[i]);
					currentTile.entities.splice(currentEntityPosition, 1);

					//And add him to the next tile that he is going to be on
					nextTile.entities.push(entities[i]);

					//Pop the new position from the "stack"
					positionComponent.position = newPosition;

				}

				//The new position is either invalid or successful, remove the action from the queue
				positionComponent.actions.splice(a, 1);

			}

		}

	},

	/**
	 * Function that gets called when an entity wants to move
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is being checked against the map
	 * @param {object} newPosition - The new position the entity is trying to move to
	 */
	canMove: function(entity, newPosition) {

		//Get the tile to which the entity is trying to move
		var nextTile = this.game.map.tiles[newPosition.x][newPosition.y];

		//Check for collision on the map, walls etc
		if(nextTile.type !== 2) {
			return false;
		}

		//Check if there is one or more than one entity at the new location
		if(nextTile.entities.length !== 0) {

			//Loop through the entities
			for(var i = 0; i < nextTile.entities.length; i++) {

				//Loop through the components
				for(var key in nextTile.entities[i].components) {

					//Check if the component has an events parameter
					if(typeof nextTile.entities[i].components[key].events !== "undefined") {

						//Trigger the specified event
						nextTile.entities[i].components[key].events.trigger("bumpInto", entity, nextTile.entities[i]);

					}

				}

				//Check if the entity has a collide component
				if(nextTile.entities[i].hasComponent("collide")) {

					//Get the collide component
					var collideComponent = nextTile.entities[i].getComponent("collide");
					if(collideComponent.collide === true) {
						return false;
					}

				}


			}

		}

		//Function made it all the way down here, that means the entity is able to move to the new position
		return true;

	}

};

Roguelike.Systems.Combat = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {array} toRemove - A stack with all the enemies that are going to be removed at the end of the turn
	 */
	this.toRemove = [];

};

Roguelike.Systems.Combat.prototype = {

	/**
	 * Function that gets called when the game continues one tick
	 * @protected
	 */
	update: function() {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("weapon", "canFight");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++) {

			//Get the components from the current entity and store them temporarily in a variable
			var canFightComponent = entities[i].getComponent("canFight");
			var weaponComponent = entities[i].getComponent("weapon");

			//Check if any actions need to be performed on this entity
			if(canFightComponent.actions.length !== 0) {

				//Loop through the actions
				for(var a = canFightComponent.actions.length; a > 0; a--) {

					//Pop the action from the "stack"
					var currentEnemy = canFightComponent.actions.pop();

					//Check if the enemy even has a health component before we try to hit it
					if(currentEnemy.hasComponent("health")) {

						//Get the current entities components
						var healthComponent = currentEnemy.getComponent("health");

						//The weapon of the current entity should damage to the current enemy
						healthComponent.takeDamage(weaponComponent.damage);

						//If the enemy is dead, we have to remove him from the game
						if(healthComponent.isDead()) {

							//Add the current enemy to the remove stack, this way the loop doesn't get interrupted
							this.toRemove.push(currentEnemy);

						}

					}

				}

			}

		}

		//Loop through the enemies that are dead and need to be removed
		for(var entity; entity = this.toRemove.pop();) {

			//Remove the entity from the map's list
			this.game.map.entities.removeEntity(entity);

			//Get the components of this enity
			var positionComponent = entity.getComponent("position");

			//Get the tile that the entity ws standing on
			var currentTile = this.game.map.tiles[positionComponent.position.x][positionComponent.position.y];

			//Remove the entity from the tile it was standing on
			//TODO: Use Roguelike.Utils function for this
			var currentEntityPosition = currentTile.entities.indexOf(entity);
			currentTile.entities.splice(currentEntityPosition, 1);

		}

	}

};

Roguelike.Systems.PathFinding = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {EasyStar} easyStar - Reference to the EasyStar library
	 */
	this.easystar = null;

	//Initialize itself
	this.initialize();

};

Roguelike.Systems.PathFinding.prototype = {

	/**
	 * Initialize the game, create all objects
	 * @protected
	 */
	initialize: function() {

		//Create a new instance of the EasyStar library
		this.easystar = new EasyStar.js();

		//Implement the grid in EasyStar
		this.easystar.setGrid(this.game.map.typeList());

		//Disable diagonals
		this.easystar.disableDiagonals();

		//Set the acceptable tiles to walk on
		this.easystar.setAcceptableTiles([2]);


	},

	/**
	 * Function that gets called when the game continues one tick
	 * @protected
	 */
	update: function() {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("behaviour", "position");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++) {

			//Get the components from the current entity and store them temporarily in a variable
			var behaviourComponent = entities[i].getComponent("behaviour");
			var positionComponent = entities[i].getComponent("position");

			//Check the behaviour of the entity
			switch(behaviourComponent.behaviour) {

				case("attack"):

					//Get the player
					var player = this.game.player;
					var playerPositionComponent = player.getComponent("position");

					//Initialize variables
					var nextPosition;

					//If the entity is withing 10 tiles of the player, walk to the player
					if(positionComponent.position.manhattan(playerPositionComponent.position) < 10) {

						//Let EasyStar calculate a path towards the player find a path
						this.easystar.findPath(positionComponent.position.x, positionComponent.position.y, playerPositionComponent.position.x, playerPositionComponent.position.y, function(path) {

							//TODO: Make sure enemies don't kill eachother, they have to find another route or collaborate
							if(path === null || path.length === 0) {
								console.log("no path found");
							}else{
								nextPosition = new Roguelike.Vector2(path[1].x, path[1].y);
								positionComponent.actions.push(nextPosition);
							}

						});

						//TODO: Find out is this is still needed, i dont think so.
						this.easystar.calculate();


					}

					break;

			}

		}

	}

};


Roguelike.PlayerFactory = {

	/**
	 * Function that returns a new warrior
	 * @public
	 *
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 */
	newPlayerWarrior: function(position) {

		//Create the entity
		var entity = new Roguelike.Entity();

		//Give the player a health of 100 points
		entity.addComponent(new Roguelike.Components.Health(100));

		//The starting position of the player is at the dungeon's entrance
		entity.addComponent(new Roguelike.Components.Position(position));

		//The player has a sprite
		entity.addComponent(new Roguelike.Components.Sprite("entities", 0, 0));

		//The player must be controllable by the keyboards arrow keys
		entity.addComponent(new Roguelike.Components.KeyboardControl());

		//Add a lightsource to the player
		entity.addComponent(new Roguelike.Components.LightSource(true, 6));

		//You can collide with this entity
		entity.addComponent(new Roguelike.Components.Collide(true));

		//The entity has a weapon
		//TODO: Change this to a loadout. Something that says: Hey you are wearing this and this and this
		entity.addComponent(new Roguelike.Components.Weapon(5));

		//This entity is capable of fighting
		entity.addComponent(new Roguelike.Components.CanFight());

		//Return the entity
		return entity;

	}

};

Roguelike.EnemyFactory = {

	/**
	 * Function that returns a new skeleton entity
	 * @public
	 *
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 */
	newSkeleton: function(position) {

		//Create the entity
		var entity = new Roguelike.Entity();

		//Give the entity a health of 100 points
		entity.addComponent(new Roguelike.Components.Health(20));

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position));

		//The entity has a sprite
		entity.addComponent(new Roguelike.Components.Sprite("entities", 0, 2));

		//You can collide with this entity
		entity.addComponent(new Roguelike.Components.Collide(true));

		//The entity has a weapon
		//TODO: Change this to a loadout. Something that says: Hey you are wearing this and this and this
		entity.addComponent(new Roguelike.Components.Weapon(10));

		//This entity is capable of fighting
		entity.addComponent(new Roguelike.Components.CanFight());

		//This entity has a certain behaviour
		entity.addComponent(new Roguelike.Components.Behaviour("attack"));

		//Return the entity
		return entity;

	}

};

Roguelike.PropFactory = {

	/**
	 * Function that returns a new door
	 * @public
	 *
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 */
	newDoor: function(position) {

		//Create the entity
		var entity = new Roguelike.Entity();

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position));

		//The entity has a sprite ( color for now )
		entity.addComponent(new Roguelike.Components.Sprite("tileset", 1, 0));

		//This entity can be opened up by another entity
		entity.addComponent(new Roguelike.Components.CanOpen());

		//You can collide with this entity
		entity.addComponent(new Roguelike.Components.Collide(true));

		//Return the entity
		return entity;

	}

};

Roguelike.DecorationFactory = {

	/**
	 * Function that returns a grass object
	 * @public
	 *
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 */
	newGrass: function(position) {

		//Create the entity
		var entity = new Roguelike.Entity();

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position));

		//The entity has a sprite ( color for now )
		entity.addComponent(new Roguelike.Components.Sprite("decoration", 0, Roguelike.Utils.randomNumber(3, 5)));

		//Return the entity
		return entity;

	}

};

Roguelike.Event = function() {

	/**
	 * @property {object} events - An object with all the current events
	 */
	this.events = {};

};

Roguelike.Event.prototype = {

	/**
	 * Function that handles keydown events
	 * @protected
	 *
	 * @param {object} event - The event object
	 * @param {function} callback - The function that has to be performed as a callback
	 * @param {object} context - The object that should be accessible when the event is called
	 */
	on: function(event, callback, context) {

		//If this.events doesn't have the event property, create an empty array
		if(!this.events.hasOwnProperty(event)) {
			this.events[event] = [];
		}

		//Insert the callback into the current event
		this.events[event].push([callback, context]);

	},

	/**
	 * Function that is called when an event is triggered
	 * @protected
	 *
	 * @param {object} event - The event object
	 */
	trigger: function(event) {

		//Because we don't know how many arguments are being send to
		//the callbacks, let's get them all except the first one ( the tail )
		var tail = Array.prototype.slice.call(arguments, 1);

		//Get all the callbacks for the current event
		var callbacks = this.events[event];

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

Roguelike.Key = function(keycode) {

	/**
	 * @property {number} keyCode - The keycode of this specific key
	 */
	this.keyCode = keycode;

	/**
	 * @property {bool} isDown - Boolean to see if the key is down
	 */
	this.isDown = false;

	/**
	 * @property {bool} isUp - Boolean to see if the key is up
	 */
	this.isUp = false;

	/**
	 * @property {number} lastDown - Timestamp of the last key press
	 */
	this.lastDown = 0;

	/**
	 * @property {number} lastUp - Timestamp of the last key release
	 */
	this.lastUp = 0;

	/**
	 * @property {number} delay - Delay between two events on keydown
	 */
	this.delay = 50;

	/**
	 * @property {Roguelike.Event} onDown - Event that handles onDown event
	 */
	this.onDown = new Roguelike.Event();

	/**
	 * @property {Roguelike.Event} onUp - Event that handles onUp event
	 */
	this.onUp = new Roguelike.Event();

};

Roguelike.Key.prototype = {

	/**
	 * Function that handles keydown events
	 * @protected
	 *
	 * @param {object} event - The event object
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
	 * @param {object} event - The event object
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

Roguelike.Keyboard = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {object} keys - Object that holds all keys
	 */
	this.keys = {};

};

Roguelike.Keyboard.prototype = {

	/**
	 * Function to initialize the keyboard and therefore user input
	 * @protected
	 */
	initialize: function() {

		//Set the scope of this to _this
		var _this = this;

		//The onKeyDown event of the document is the following function:
		this._onKeyDown = function(event) {
			return _this.processKeyDown(event);
		};

		//The onKeyUp event of the document is the following function:
		this._onKeyUp = function(event) {
			return _this.processKeyUp(event);
		};

		//Add the event listeners to the window
		window.addEventListener('keydown', this._onKeyDown, false);
		window.addEventListener('keyup', this._onKeyUp, false);

	},

	/**
	 * Function to get a specific key from the keyboard
	 * and add it if it does't exist yet
	 * @protected
	 *
	 * @param {number} keycode - The keycode of the key being added
	 */
	getKey: function(keycode) {

		//Check if the key allready exists
		if(this.keys[keycode] === undefined) {

			//Add a brand new key to the keyboards key list
			this.keys[keycode] = new Roguelike.Key(keycode);

		}

		//Return the key so we can use it in other functions
		return this.keys[keycode];

	},

	/**
	 * Function that handles keydown events
	 * @protected
	 *
	 * @param {object} event - The event object
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
	 * @param {object} event - The event object
	 */
	processKeyUp: function(event) {

		//Only continue if the key being pressed is assigned to the keyboard
		if(this.keys[event.keyCode] !== undefined) {

			//Call the callback's defined on this key
			this.keys[event.keyCode].processKeyUp(event);

		}

	}

};

Roguelike.Tile = function(type, blockLight, room, tileRow, tileNumber) {

	/**
	 * @property {number} The kind of tile, wall, floor, void etc
	 */
	this.type = type;

	/**
	 * @property {number} The row on the tileset that this current tile is on
	 */
	this.tileRow = tileRow;

	/**
	 * @property {number} The number of tile in the row that this tile is. Starting from 0
	 */
	this.tileNumber = tileNumber;

	/**
	 * @property {Roguelike.Room} belongsTo - The room that this tile belongs to
	 */
	this.belongsTo = room || null;

	/**
	 * @property {array} entities - An array that holds all entities on this tile
	 */
	this.entities = [];

	/**
	 * @property {bool} staticObject - A static object that is on this tile
	 */
	this.blockLight = blockLight;

	/**
	 * @property {number} lightLevel - The brightness of the current tile
	 */
	this.lightLevel = 0;

	/**
	 * @property {bool} explored - Boolean if a tile has already been explorer by the player
	 */
	this.explored = false;

};

Roguelike.Map = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Roguelike.Group} entities - Holds all the entities of this game
	 */
	this.entities = null;

	/**
	 * @property {number} tilesX - The number of horizontal tiles on this map
	 */
	this.tilesX = game.settings.tilesX;

	/**
	 * @property {number} tilesY - The number of vertical tiles on this map
	 */
	this.tilesY = game.settings.tilesY;

	/**
	 * @property {number} maxRooms - The maximum number of rooms allowed on this map
	 */
	this.maxRooms = game.settings.maxRooms;

	/**
	 * @property {array} rooms - An array that holds all room objects
	 */
	this.rooms = [];

	/**
	 * @property {array} tiles - An array that holds all tile objects
	 */
	this.tiles = [];

	/**
	 * @property {array} objects - An array that holds all objects that are on the map
	 */
	this.objects = [];

	/**
	 * @property {number} tileSize - The width and height of a single tile on the map
	 */
	this.tileSize = game.settings.tileSize;

	/**
	 * @property {number} minRoomWidth - The minimum width of a room on this map
	 */
	this.minRoomWidth = game.settings.minRoomWidth;

	/**
	 * @property {number} maxRoomWidth - The maximum width of a room on this map
	 */
	this.maxRoomWidth = game.settings.maxRoomWidth;

	/**
	 * @property {number} minRoomHeight - The minimum heigth of a room on this map
	 */
	this.minRoomHeight = game.settings.minRoomHeight;

	/**
	 * @property {number} maxRoomHeight - The maximum heigth of a room on this map
	 */
	this.maxRoomHeight = game.settings.maxRoomHeight;

	/**
	 * @property {Roguelike.MapFactory} mapFactory - The room factory is responsible for creating rooms and corridors on this map
	 */
	this.mapFactory = null;

	/**
	 * @property {entrance} object - An object that holds the position of the entrance of this map
	 */
	this.entrance = null;

	/**
	 * @property {exit} object - An object that holds the position of the exit of this map
	 */
	this.exit = null;

};

Roguelike.Map.prototype = {

	/**
	 * Initialize the layout of the map, filling it with empty tiles
	 * @protected
	 */
	initialize: function() {

		//Create the map factory
		this.mapFactory = new Roguelike.MapFactory(this.game);

		//Loop through every horizontal row
		for(var x = 0; x < this.tilesX; x++) {

			//Initialize this row
			this.tiles[x] = [];

			//Loop through every vertical row
			for(var y = 0; y < this.tilesY; y++) {

				//Initialize this position by setting it to zero, and blocking light
				this.tiles[x][y] = new Roguelike.Tile(0, true, 0, 0);

			}

		}

	},

	/**
	 * Function that returns an array with only the tiletypes of every position
	 * Used for EasyStar Pathfinding
	 * @protected
	 */
	typeList: function() {

		//Define variables
		var mapTypeList = [];

		//Loop through every horizontal row
		for(var y = 0; y < this.tilesY; y++) {

			//Initialize this row
			mapTypeList.push([]);

			//Loop through every vertical row
			for(var x = 0; x < this.tilesX; x++) {

				//Initialize this position by setting it to zero, and blocking light
				mapTypeList[y][x] = (this.tiles[x][y].type);

			}

		}

		//Return the array with Y X coordinates of every tiletype
		return mapTypeList;

	},

	/**
	 * Check if a single room overlaps a room that is allready on the map
	 * @protected
	 *
	 * @param {Roguelike.Room} room - The room object that has to be checked
	 */
	roomIntersectsWith: function(room) {

		//Loop through every room in the list
		for(var i = 0; i < this.rooms.length; i++) {

			//Check if the room intersects with the current room
			if(room.x1 <= this.rooms[i].x2 && room.x2 >= this.rooms[i].x1 && room.y1 <= this.rooms[i].y2 && room.y2 >= this.rooms[i].y1) {
				return true;
			}

		}
		//If the room doesn't intersect another room, return false
		return false;

	},

	/**
	 * Add all the rooms from the room list to the map, get the tiles from each room's layout
	 * @protected
	 */
	addRooms: function() {

		//Loop through each room in the list
		for(var i = 0; i < this.rooms.length; i++) {

			//Loop through every horizontal row
			for(var x = this.rooms[i].x1; x < this.rooms[i].x2; x++) {

				//What is the current Y position in the layout of the current room
				var layoutXPos = this.rooms[i].x2 - x - 1;

				//Loop through every vertical row
				for(var y = this.rooms[i].y1; y < this.rooms[i].y2; y++) {

					//What is the current X position in the layout of the current room
					var layoutYPos = this.rooms[i].y2 - y - 1;

					//Get the current tile object
					var currentTile = this.rooms[i].layout[layoutXPos][layoutYPos];

					//Place the tile that is on the layout on this position on the map
					this.tiles[x][y] = currentTile;

				}

			}

		}

	}

};

Roguelike.MapFactory = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {array} possibleDoorLocations - Stores all the positions of possible door locations
	 */
	this.possibleDoorLocations = [];

};

Roguelike.MapFactory.prototype = {

	/**
	 * Generate a random amount of rooms and add them to the room list
	 * @protected
	 */
	generateRooms: function() {

		//Define the map variable
		var map = this.game.map;

		//Maximum number of tries before stopping the placement of more rooms
		var maxTries = this.game.map.maxRooms + 10;
		var tries = 0;

		//Create rooms and add them to the list
		while(map.rooms.length < map.maxRooms) {

			//Check if the limit has been reached, this prevents the while loop from crashing your page
			//We assume there is no space left on the map and break the loop
			if(tries >= maxTries) {
				break;
			}

			//Generate random values ( in tiles )
			//Start with generating a random width
			var w = Roguelike.Utils.randomNumber(
				map.minRoomWidth,
				map.maxRoomWidth
			);

			//Generate a random height for the room
			var h = Roguelike.Utils.randomNumber(
				map.minRoomHeight,
				map.maxRoomHeight
			);

			//Generate a random width horizontal position for the room
			var x = Roguelike.Utils.randomNumber(
				1,
				map.tilesX - w - 1
			);

			//Generate a random vertical position for the room
			var y = Roguelike.Utils.randomNumber(
				1,
				map.tilesY - h - 1
			);

			//Create a new room with these values
			var room = new Roguelike.Room(x, y, w, h);

			//We tried to create a room at a certain position
			tries++;

			//Check if this room intersects with the other rooms, if not, add it to the list
			if(!map.roomIntersectsWith(room)) {

				//The room doesn't intersect, initialize the room layout
				room.initialize();
				room.generateExit();

				//Add the room to the room list
				map.rooms.push(room);

				//Reset tries back to zero, giving the next room equal chances of spawning
				tries = 0;

			}

		}

	},

	/**
	 * Generate corridors based on the room's exits
	 * @protected
	 */
	generateCorridors: function() {

		//Define the map variable
		var map = this.game.map;

		//After all the rooms are placed, go and generate the corridors
		//We start at the second room, so we can connect to the first room
		for(var i = 1; i < map.rooms.length; i++) {

			//Generate a corridor from this position to the previous room's exit
			this.generateCorridor(map.rooms[i], map.rooms[i - 1]);

		}

	},

	/**
	 * Check in which direction the corridor has to be generated
	 * @protected
	 *
	 * @param {object} firstRoom - The room from which we are going to generate a path to the second room
	 * @param {object} secondRoom - This room is going to be the endpoint of this corridor
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

		//Horizontal Corridors
		if((secondExit.x - firstExit.x) > 0) {

			//Corridor going left
			for(var i = secondExit.x; i >= firstExit.x; i--) {
				this.generateHorizontalCorridor(i, secondExit.y);
			}

		}else{

			//Corridor going right
			for(var i = secondExit.x; i <= firstExit.x; i++) {
				this.generateHorizontalCorridor(i, secondExit.y);
			}

		}

		//Vertical Corridors
		if((secondExit.y - firstExit.y) > 0) {

			//If the corridor is going up
			for(var i = secondExit.y; i >= firstExit.y; i--) {
				this.generateVerticalCorridor(firstExit.x, i);
			}

		}else{

			//If the corridor is going down
			for(var i = secondExit.y; i <= firstExit.y; i++) {
				this.generateVerticalCorridor(firstExit.x, i);
			}

		}

	},

	/**
	 * Generate a horizontal corridor tile, and also place doors and walls
	 * @protected
	 *
	 * @param {number} x - The horizontal position of the tile that has to become a corridor
	 * @param {number} y - The vertical position of the tile that has to become a corridor
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
	 * @param {number} x - The horizontal position of the tile that has to become a corridor
	 * @param {number} y - The vertical position of the tile that has to become a corridor
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
			this.possibleDoorLocations.push(new Roguelike.Vector2(x, y));

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
	 * Generate some doors and spread them out over the map!
	 * @protected
	 */
	generateDoors: function() {

		//Loop through all possible door locations
		for(var i = 0; i < this.possibleDoorLocations.length; i++) {

			//Store the current location in a local variable
			var doorLocation = this.possibleDoorLocations[i];

			//Get the tile at the location of the possible door location
			var tileLeft = this.game.map.tiles[doorLocation.x - 1][doorLocation.y];
			var tileRight = this.game.map.tiles[doorLocation.x + 1][doorLocation.y];
			var tileUp = this.game.map.tiles[doorLocation.x][doorLocation.y - 1];
			var tileDown = this.game.map.tiles[doorLocation.x][doorLocation.y + 1];

			var randomNumber = Roguelike.Utils.randomNumber(0, 100);

			//If the tiles left and right are walls and the tiles above and below are floors
			if(tileLeft.type === 1 && tileRight.type === 1 && tileUp.entities.length === 0 && tileDown.entities.length === 0 && tileUp.type === 2 && tileDown.type === 2 && randomNumber > 80) {

				//Place a door at this location
				this.placeDoor(doorLocation, false);

				//If the tiles left and right are floors and the tiles above and below are walls
			}else if(tileLeft.type === 2 && tileRight.type === 2 && tileLeft.entities.length === 0 && tileRight.entities.length === 0 && tileUp.type === 1 && tileDown.type === 1 && randomNumber > 60) {

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
		var doorEntity = Roguelike.PropFactory.newDoor(position);

		if(orientation === true) {
			doorEntity.components.sprite.number = 0;
			doorEntity.components.sprite.row = 2;
		}

		//Add the entity to the map
		this.game.map.entities.addEntity(doorEntity);

		//Add the door entity to the entities list on the current tile
		tileAtPosition.entities.push(doorEntity);

		//A door blocks light!
		tileAtPosition.blockLight = true;

	},

	/**
	 * Place the entrance and exit objects on the map
	 * @protected
	 */
	placeEntranceExitObjects: function() {

		//Generate a random number between 0 and the number of rooms - 2
		//Minus two because then we can select the last room in the list as an exit room
		var entranceRoomIndex = Roguelike.Utils.randomNumber(0, this.game.map.rooms.length - 2);
		var exitRoomIndex = this.game.map.rooms.length - 1;

		//Get the rooms from the room list
		var entranceRoom = this.game.map.rooms[entranceRoomIndex];
		var exitRoom = this.game.map.rooms[exitRoomIndex];

		//Let the rooms return a random position
		var entrancePosition = entranceRoom.getRandomPosition();
		var exitPosition = exitRoom.getRandomPosition();

		//Store the entrance and exit positions in the map for later use
		//For example, player spawning
		this.game.map.entrance = entrancePosition;
		this.game.map.exit = exitPosition;

		//TODO: Place these entities in a factory

		//Create the entrance entity
		var entranceEntity = new Roguelike.Entity();

		//Add components to the entrance entity
		entranceEntity.addComponent(new Roguelike.Components.Position(entrancePosition));
		entranceEntity.addComponent(new Roguelike.Components.Sprite("tileset", 3, 1));

		//Create the entrance entity
		var exitEntity = new Roguelike.Entity();

		//Add components to the exit entity
		exitEntity.addComponent(new Roguelike.Components.Position(exitPosition));
		exitEntity.addComponent(new Roguelike.Components.Sprite("tileset", 3, 0));

		//Add this entity to the map
		this.game.map.entities.addEntity(entranceEntity);
		this.game.map.entities.addEntity(exitEntity);


	},

	/**
	 * Changes a tile to a floor
	 * @protected
	 */
	changeTileToFloor: function(tile) {

		tile.type = 2;
		tile.tileRow = 3;
		tile.tileNumber = Roguelike.Utils.randomNumber(2, 5);
		tile.blockLight = false;

	},

	/**
	 * Changes a tile to a wall
	 * @protected
	 */
	changeTileToWall: function(tile) {

		tile.type = 1;
		tile.tileRow = 0;
		tile.tileNumber = Roguelike.Utils.randomNumber(1, 2)
		tile.blockLight = true;

	},

	//TODO: Create a MapDecorator that handles all of this
	decorateDungeon: function() {

		var map = this.game.map;

		//Loop through every horizontal row
		for(var x = 0; x < map.tilesX; x++) {

			//Loop through every vertical row
			for(var y = 0; y < map.tilesY; y++) {

				if(map.tiles[x][y].type === 1) {

					//Get the tile at the location of the possible door location
					//TODO: Write a function somewhere that returns the surrounding tiles
					var tileLeft = this.game.map.tiles[x - 1][y];
					var tileRight = this.game.map.tiles[x + 1][y];
					var tileDown = this.game.map.tiles[x][y + 1];
					var tileUp = this.game.map.tiles[x][y - 1];

					//TODO: Maybe use a more elegant autotiling solution for this
					//Check left type void, right type floor || Check left type void, right type wall, up type void
					if(tileLeft.type === 0 && tileRight.type === 2 || tileLeft.type === 0 && tileRight.type === 1 && tileUp.type === 0) {

						map.tiles[x][y].tileNumber = 3;

						//Check right type void, left type floor || Check right type void, left type wall, up type void
					}else if(tileRight.type === 0 && tileLeft.type === 2 || tileRight.type === 0 && tileLeft.type === 1 && tileUp.type === 0) {

						map.tiles[x][y].tileNumber = 4;

						//Check above for a wall, left for a wall and right for void
					}else if(tileUp.type === 1 && tileLeft.type === 1 && tileRight.type === 0) {

						map.tiles[x][y].tileNumber = 6;

						//Check above for a wall, right for a wall and left for void
					}else if(tileUp.type === 1 && tileRight.type === 1 && tileLeft.type === 0) {

						map.tiles[x][y].tileNumber = 5;

						//Check up for floor, down for wall, left for floor, right for wall
					}else if(tileUp.type === 2 && tileDown.type === 1 && tileLeft.type === 2 && tileRight.type === 1) {

						map.tiles[x][y].tileRow = 1;
						map.tiles[x][y].tileNumber = 3;

						//Check up for floor, down for wall, left for wall, right for floor
					}else if(tileUp.type === 2 && tileDown.type === 1 && tileLeft.type === 1 && tileRight.type === 2) {

						map.tiles[x][y].tileRow = 1;
						map.tiles[x][y].tileNumber = 2;

						//Check if above is floor, right and left are floor and beneath is a wall
					}else if(tileUp.type === 2 && tileDown.type === 1 && tileLeft.type === 2 && tileRight.type === 2) {

						map.tiles[x][y].tileRow = 1;
						map.tiles[x][y].tileNumber = 5;

						//Check if the tiles left and right are floors, and up and down are walls
					}else if(tileUp.type === 1 && tileDown.type === 1 && tileLeft.type === 2 && tileRight.type === 2 || tileUp.type === 1 && tileDown.type === 1 && tileLeft.type === 2 && tileRight.type === 1) {

						map.tiles[x][y].tileRow = 1;
						map.tiles[x][y].tileNumber = 4;

					}

				}

				//If the current tile is a floor tile
				if(map.tiles[x][y].type === 2) {

					//Have a random chance to spawn grass on this tile
					if(Roguelike.Utils.randomNumber(0, 100) >= 80) {

						//Create a new grass entity
						grassEntity = new Roguelike.DecorationFactory.newGrass(
							new Roguelike.Vector2(x, y)
						);

						//Add the entity to the tile on the map
						map.tiles[x][y].entities.push(grassEntity);

						//Add the entity to the map
						map.entities.addEntity(grassEntity);

					}

					//Have a random chance to spawn an enemy on this tile
					if(Roguelike.Utils.randomNumber(0, 100) >= 100) {

						//Create a new skeleton
						enemyEntity = new Roguelike.EnemyFactory.newSkeleton(
							new Roguelike.Vector2(x, y)
						);

						//Add the entity to the tile on the map
						map.tiles[x][y].entities.push(enemyEntity);

						//Add the entity to the map
						map.entities.addEntity(enemyEntity);

					}


				}

			}

		}

	}

};

Roguelike.Room = function(x, y, w, h) {

	/**
	 * @property {number} x1 - The X position of the top left corner of this room
	 */
	this.x1 = x;

	/**
	 * @property {number} x2 - The X position of the top right corner of this room
	 */
	this.x2 = w + x;

	/**
	 * @property {number} y1 - The Y position of top left corner of this room
	 */
	this.y1 = y;

	/**
	 * @property {number} y2 - The Y position of bottom left corner of this room
	 */
	this.y2 = y + h;

	/**
	 * @property {number} w - The width of this room, defined in tiles
	 */
	this.w = w;

	/**
	 * @property {number} h - The height of this room, defined in tiles
	 */
	this.h = h;

	/**
	 * @property {array} layout - The array that contains the layout of this room
	 */
	this.layout = [];

	/**
	 * @property {object} exit - An object that holds the exit coordinates of this room
	 */
	this.exit = null;

};

Roguelike.Room.prototype = {

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
					this.layout[x][y] = new Roguelike.Tile(1, true, this, 0, Roguelike.Utils.randomNumber(1, 2));

				}else{

					//Create a new floor tile
					this.layout[x][y] = new Roguelike.Tile(2, false, this, 3, 2);

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
		switch(Roguelike.Utils.randomNumber(1, 4)) {

			case(1): //Top

				this.exit = {x: Roguelike.Utils.randomNumber(1, this.w - 2), y: this.h - 2};

				break;

			case(2): //Bottom

				this.exit = {x: Roguelike.Utils.randomNumber(1, this.w - 2), y: 1};

				break;

			case(3): //Left

				this.exit = {x: this.w - 2, y: Roguelike.Utils.randomNumber(1, this.h - 2)};

				break;

			case(4): //Right

				this.exit = {x: 1, y: Roguelike.Utils.randomNumber(1, this.h - 2)};

				break;

		}

	},

	/**
	 * Returns a random position that is inside the current room
	 * @protected
	 */
	getRandomPosition: function() {

		//Get random positions within the room
		var positionX = Roguelike.Utils.randomNumber(2, this.w - 3);
		var positionY = Roguelike.Utils.randomNumber(2, this.h - 3);

		//Translate these values to real world coordinates
		positionX += this.x1;
		positionY += this.y1;

		//Return the position as an Vector2 object
		return new Roguelike.Vector2(positionX, positionY);

	}

};

//NameSpace
var EasyStar = EasyStar || {};

/**
 * A simple Node that represents a single tile on the grid.
 * @param {Object} parent The parent node.
 * @param {Number} x The x position on the grid.
 * @param {Number} y The y position on the grid.
 * @param {Number} costSoFar How far this node is in moves*cost from the start.
 * @param {Number} simpleDistanceToTarget Manhatten distance to the end point.
 **/
EasyStar.Node = function(parent, x, y, costSoFar, simpleDistanceToTarget) {
	this.parent = parent;
	this.x = x;
	this.y = y;
	this.costSoFar = costSoFar;
	this.simpleDistanceToTarget = simpleDistanceToTarget;

	/**
	 * @return {Number} Best guess distance of a cost using this node.
	 **/
	this.bestGuessDistance = function() {
		return this.costSoFar + this.simpleDistanceToTarget;
	}
};

//Constants
EasyStar.Node.OPEN_LIST = 0;
EasyStar.Node.CLOSED_LIST = 1;
/**
 * This is an improved Priority Queue data type implementation that can be used to sort any object type.
 * It uses a technique called a binary heap.
 *
 * For more on binary heaps see: http://en.wikipedia.org/wiki/Binary_heap
 *
 * @param {String} criteria The criteria by which to sort the objects.
 * This should be a property of the objects you're sorting.
 *
 * @param {Number} heapType either PriorityQueue.MAX_HEAP or PriorityQueue.MIN_HEAP.
 **/
EasyStar.PriorityQueue = function(criteria, heapType) {
	this.length = 0; //The current length of heap.
	var queue = [];
	var isMax = false;

	//Constructor
	if(heapType == EasyStar.PriorityQueue.MAX_HEAP) {
		isMax = true;
	}else if(heapType == EasyStar.PriorityQueue.MIN_HEAP) {
		isMax = false;
	}else{
		throw heapType + " not supported.";
	}

	/**
	 * Inserts the value into the heap and sorts it.
	 *
	 * @param value The object to insert into the heap.
	 **/
	this.insert = function(value) {
		if(!value.hasOwnProperty(criteria)) {
			throw "Cannot insert " + value + " because it does not have a property by the name of " + criteria + ".";
		}
		queue.push(value);
		this.length++;
		bubbleUp(this.length - 1);
	}

	/**
	 * Peeks at the highest priority element.
	 *
	 * @return the highest priority element
	 **/
	this.getHighestPriorityElement = function() {
		return queue[0];
	}

	/**
	 * Removes and returns the highest priority element from the queue.
	 *
	 * @return the highest priority element
	 **/
	this.shiftHighestPriorityElement = function() {
		if(this.length === 0) {
			throw ("There are no more elements in your priority queue.");
		}else if(this.length === 1) {
			var onlyValue = queue[0];
			queue = [];
			this.length = 0;
			return onlyValue;
		}
		var oldRoot = queue[0];
		var newRoot = queue.pop();
		this.length--;
		queue[0] = newRoot;
		swapUntilQueueIsCorrect(0);
		return oldRoot;
	}

	var bubbleUp = function(index) {
		if(index === 0) {
			return;
		}
		var parent = getParentOf(index);
		if(evaluate(index, parent)) {
			swap(index, parent);
			bubbleUp(parent);
		}else{
			return;
		}
	}

	var swapUntilQueueIsCorrect = function(value) {
		left = getLeftOf(value);
		right = getRightOf(value);
		if(evaluate(left, value)) {
			swap(value, left);
			swapUntilQueueIsCorrect(left);
		}else if(evaluate(right, value)) {
			swap(value, right);
			swapUntilQueueIsCorrect(right);
		}else if(value == 0) {
			return;
		}else{
			swapUntilQueueIsCorrect(0);
		}
	}

	var swap = function(self, target) {
		var placeHolder = queue[self];
		queue[self] = queue[target];
		queue[target] = placeHolder;
	}

	var evaluate = function(self, target) {
		if(queue[target] === undefined || queue[self] === undefined) {
			return false;
		}

		//Check if the criteria should be the result of a function call.
		if(typeof queue[self][criteria] === 'function') {
			selfValue = queue[self][criteria]();
			targetValue = queue[target][criteria]();
		}else{
			selfValue = queue[self][criteria];
			targetValue = queue[target][criteria];
		}

		if(isMax) {
			if(selfValue > targetValue) {
				return true;
			}else{
				return false;
			}
		}else{
			if(selfValue < targetValue) {
				return true;
			}else{
				return false;
			}
		}
	}

	var getParentOf = function(index) {
		return Math.floor(index / 2) - 1;
	}

	var getLeftOf = function(index) {
		return index * 2 + 1;
	}

	var getRightOf = function(index) {
		return index * 2 + 2;
	}
};

//Constants
EasyStar.PriorityQueue.MAX_HEAP = 0;
EasyStar.PriorityQueue.MIN_HEAP = 1;
/**
 * Represents a single instance of EasyStar.
 * A path that is in the queue to eventually be found.
 */
EasyStar.instance = function() {
	this.isDoneCalculating = true;
	this.pointsToAvoid = {};
	this.startX;
	this.callback;
	this.startY;
	this.endX;
	this.endY;
	this.nodeHash = {};
	this.openList;
};
/**
 *     EasyStar.js
 *     github.com/prettymuchbryce/EasyStarJS
 *     Licensed under the MIT license.
 *
 *     Implementation By Bryce Neal (@prettymuchbryce)
 **/
EasyStar.js = function() {
	var STRAIGHT_COST = 10;
	var DIAGONAL_COST = 14;
	var pointsToAvoid = {};
	var collisionGrid;
	var costMap = {};
	var iterationsSoFar;
	var instances = [];
	var iterationsPerCalculation = Number.MAX_VALUE;
	var acceptableTiles;
	var diagonalsEnabled = false;

	/**
	 * Sets the collision grid that EasyStar uses.
	 *
	 * @param {Array|Number} tiles An array of numbers that represent
	 * which tiles in your grid should be considered
	 * acceptable, or "walkable".
	 **/
	this.setAcceptableTiles = function(tiles) {
		if(tiles instanceof Array) {
			//Array
			acceptableTiles = tiles;
		}else if(!isNaN(parseFloat(tiles)) && isFinite(tiles)) {
			//Number
			acceptableTiles = [tiles];
		}
	};

	/**
	 * Enable diagonal pathfinding.
	 */
	this.enableDiagonals = function() {
		diagonalsEnabled = true;
	}

	/**
	 * Disable diagonal pathfinding.
	 */
	this.disableDiagonals = function() {
		diagonalsEnabled = false;
	}

	/**
	 * Sets the collision grid that EasyStar uses.
	 *
	 * @param {Array} grid The collision grid that this EasyStar instance will read from.
	 * This should be a 2D Array of Numbers.
	 **/
	this.setGrid = function(grid) {
		collisionGrid = grid;

		//Setup cost map
		for(var y = 0; y < collisionGrid.length; y++) {
			for(var x = 0; x < collisionGrid[0].length; x++) {
				if(!costMap[collisionGrid[y][x]]) {
					costMap[collisionGrid[y][x]] = 1
				}
			}
		}
	};

	/**
	 * Sets the tile cost for a particular tile type.
	 *
	 * @param {Number} The tile type to set the cost for.
	 * @param {Number} The multiplicative cost associated with the given tile.
	 **/
	this.setTileCost = function(tileType, cost) {
		costMap[tileType] = cost;
	};

	/**
	 * Sets the number of search iterations per calculation.
	 * A lower number provides a slower result, but more practical if you
	 * have a large tile-map and don't want to block your thread while
	 * finding a path.
	 *
	 * @param {Number} iterations The number of searches to prefrom per calculate() call.
	 **/
	this.setIterationsPerCalculation = function(iterations) {
		iterationsPerCalculation = iterations;
	};

	/**
	 * Avoid a particular point on the grid,
	 * regardless of whether or not it is an acceptable tile.
	 *
	 * @param {Number} x The x value of the point to avoid.
	 * @param {Number} y The y value of the point to avoid.
	 **/
	this.avoidAdditionalPoint = function(x, y) {
		pointsToAvoid[x + "_" + y] = 1;
	};

	/**
	 * Stop avoiding a particular point on the grid.
	 *
	 * @param {Number} x The x value of the point to stop avoiding.
	 * @param {Number} y The y value of the point to stop avoiding.
	 **/
	this.stopAvoidingAdditionalPoint = function(x, y) {
		delete pointsToAvoid[x + "_" + y];
	};

	/**
	 * Stop avoiding all additional points on the grid.
	 **/
	this.stopAvoidingAllAdditionalPoints = function() {
		pointsToAvoid = {};
	};

	/**
	 * Find a path.
	 *
	 * @param {Number} startX The X position of the starting point.
	 * @param {Number} startY The Y position of the starting point.
	 * @param {Number} endX The X position of the ending point.
	 * @param {Number} endY The Y position of the ending point.
	 * @param {Function} callback A function that is called when your path
	 * is found, or no path is found.
	 *
	 **/
	this.findPath = function(startX, startY, endX, endY, callback) {
		//No acceptable tiles were set
		if(acceptableTiles === undefined) {
			throw "You can't set a path without first calling setAcceptableTiles() on EasyStar.";
		}
		//No grid was set
		if(collisionGrid === undefined) {
			throw "You can't set a path without first calling setGrid() on EasyStar.";
		}

		//Start or endpoint outside of scope.
		if(startX < 0 || startY < 0 || endX < 0 || endX < 0 ||
			startX > collisionGrid[0].length - 1 || startY > collisionGrid.length - 1 ||
			endX > collisionGrid[0].length - 1 || endY > collisionGrid.length - 1) {
			throw "Your start or end point is outside the scope of your grid.";
		}

		//Start and end are the same tile.
		if(startX === endX && startY === endY) {
			callback([]);
		}

		//End point is not an acceptable tile.
		var endTile = collisionGrid[endY][endX];
		var isAcceptable = false;
		for(var i = 0; i < acceptableTiles.length; i++) {
			if(endTile === acceptableTiles[i]) {
				isAcceptable = true;
				break;
			}
		}

		if(isAcceptable === false) {
			callback(null);
			return;
		}

		//Create the instance
		var instance = new EasyStar.instance();
		instance.openList = new EasyStar.PriorityQueue("bestGuessDistance", EasyStar.PriorityQueue.MIN_HEAP);
		instance.isDoneCalculating = false;
		instance.nodeHash = {};
		instance.startX = startX;
		instance.startY = startY;
		instance.endX = endX;
		instance.endY = endY;
		instance.callback = callback;

		instance.openList.insert(coordinateToNode(instance, instance.startX,
			instance.startY, null, STRAIGHT_COST));

		instances.push(instance);
	};

	/**
	 * This method steps through the A* Algorithm in an attempt to
	 * find your path(s). It will search 4 tiles for every calculation.
	 * You can change the number of calculations done in a call by using
	 * easystar.setIteratonsPerCalculation().
	 **/
	this.calculate = function() {
		if(instances.length === 0 || collisionGrid === undefined || acceptableTiles === undefined) {
			return;
		}
		for(iterationsSoFar = 0; iterationsSoFar < iterationsPerCalculation; iterationsSoFar++) {
			if(instances.length === 0) {
				return;
			}

			//Couldn't find a path.
			if(instances[0].openList.length === 0) {
				instances[0].callback(null);
				instances.shift();
				continue;
			}

			var searchNode = instances[0].openList.shiftHighestPriorityElement();
			searchNode.list = EasyStar.Node.CLOSED_LIST;

			if(searchNode.y > 0) {
				checkAdjacentNode(instances[0], searchNode, 0, -1, STRAIGHT_COST *
					costMap[collisionGrid[searchNode.y - 1][searchNode.x]]);
				if(instances[0].isDoneCalculating === true) {
					instances.shift();
					continue;
				}
			}
			if(searchNode.x < collisionGrid[0].length - 1) {
				checkAdjacentNode(instances[0], searchNode, 1, 0, STRAIGHT_COST *
					costMap[collisionGrid[searchNode.y][searchNode.x + 1]]);
				if(instances[0].isDoneCalculating === true) {
					instances.shift();
					continue;
				}
			}
			if(searchNode.y < collisionGrid.length - 1) {
				checkAdjacentNode(instances[0], searchNode, 0, 1, STRAIGHT_COST *
					costMap[collisionGrid[searchNode.y + 1][searchNode.x]]);
				if(instances[0].isDoneCalculating === true) {
					instances.shift();
					continue;
				}
			}
			if(searchNode.x > 0) {
				checkAdjacentNode(instances[0], searchNode, -1, 0, STRAIGHT_COST *
					costMap[collisionGrid[searchNode.y][searchNode.x - 1]]);
				if(instances[0].isDoneCalculating === true) {
					instances.shift();
					continue;
				}
			}
			if(diagonalsEnabled) {
				if(searchNode.x > 0 && searchNode.y > 0) {
					checkAdjacentNode(instances[0], searchNode, -1, -1, DIAGONAL_COST *
						costMap[collisionGrid[searchNode.y - 1][searchNode.x - 1]]);
					if(instances[0].isDoneCalculating === true) {
						instances.shift();
						continue;
					}
				}
				if(searchNode.x < collisionGrid[0].length - 1 && searchNode.y < collisionGrid.length - 1) {
					checkAdjacentNode(instances[0], searchNode, 1, 1, DIAGONAL_COST *
						costMap[collisionGrid[searchNode.y + 1][searchNode.x + 1]]);
					if(instances[0].isDoneCalculating === true) {
						instances.shift();
						continue;
					}
				}
				if(searchNode.x < collisionGrid[0].length - 1 && searchNode.y > 0) {
					checkAdjacentNode(instances[0], searchNode, 1, -1, DIAGONAL_COST *
						costMap[collisionGrid[searchNode.y - 1][searchNode.x + 1]]);
					if(instances[0].isDoneCalculating === true) {
						instances.shift();
						continue;
					}
				}
				if(searchNode.x > 0 && searchNode.y < collisionGrid.length - 1) {
					checkAdjacentNode(instances[0], searchNode, -1, 1, DIAGONAL_COST *
						costMap[collisionGrid[searchNode.y + 1][searchNode.x - 1]]);
					if(instances[0].isDoneCalculating === true) {
						instances.shift();
						continue;
					}
				}
			}
		}
	};

	//Private methods follow

	var checkAdjacentNode = function(instance, searchNode, x, y, cost) {
		var adjacentCoordinateX = searchNode.x + x;
		var adjacentCoordinateY = searchNode.y + y;

		if(instance.endX === adjacentCoordinateX && instance.endY === adjacentCoordinateY) {
			instance.isDoneCalculating = true;
			var path = [];
			var pathLen = 0;
			path[pathLen] = {x: adjacentCoordinateX, y: adjacentCoordinateY};
			pathLen++;
			path[pathLen] = {x: searchNode.x, y: searchNode.y};
			pathLen++;
			var parent = searchNode.parent;
			while(parent != null) {
				path[pathLen] = {x: parent.x, y: parent.y};
				pathLen++;
				parent = parent.parent;
			}
			path.reverse();
			instance.callback(path);
		}

		if(pointsToAvoid[adjacentCoordinateX + "_" + adjacentCoordinateY] === undefined) {
			for(var i = 0; i < acceptableTiles.length; i++) {
				if(collisionGrid[adjacentCoordinateY][adjacentCoordinateX] === acceptableTiles[i]) {

					var node = coordinateToNode(instance, adjacentCoordinateX,
						adjacentCoordinateY, searchNode, cost);

					if(node.list === undefined) {
						node.list = EasyStar.Node.OPEN_LIST;
						instance.openList.insert(node);
					}else if(node.list === EasyStar.Node.OPEN_LIST) {
						if(searchNode.costSoFar + cost < node.costSoFar) {
							node.costSoFar = searchNode.costSoFar + cost;
							node.parent = searchNode;
						}
					}
					break;
				}
			}

		}
	};

	//Helpers

	var coordinateToNode = function(instance, x, y, parent, cost) {
		if(instance.nodeHash[x + "_" + y] !== undefined) {
			return instance.nodeHash[x + "_" + y];
		}
		var simpleDistanceToTarget = getDistance(x, y, instance.endX, instance.endY);
		if(parent !== null) {
			var costSoFar = parent.costSoFar + cost;
		}else{
			costSoFar = simpleDistanceToTarget;
		}
		var node = new EasyStar.Node(parent, x, y, costSoFar, simpleDistanceToTarget);
		instance.nodeHash[x + "_" + y] = node;
		return node;
	};

	var getDistance = function(x1, x2, y1, y2) {
		return Math.floor(Math.abs(x2 - x1) + Math.abs(y2 - y1));
	};
}
if(typeof define === "function" && define.amd) {
	define("easystar", [], function() {
		return EasyStar;
	});
}

window.onload = function() {

	initializeCanvas();

};

function initializeCanvas() {

	//Initialize the canvas
	var canvas = document.getElementById("canvas");
	canvas.width = 900;
	canvas.height = 600;

	var options = {
		canvas: canvas, //The canvas object on which our dungeon is placed on
		tilesX: 60, //The number of horizontal tiles on this map
		tilesY: 40, //The number of vertical tiles on this map
		tileSize: 48, //The width and height of a single tile
		maxRooms: 15, //The maximum number of rooms on this map
		minRoomWidth: 6, //The minimum width of a single room
		maxRoomWidth: 10, //The maximum width of a single room
		minRoomHeight: 6, //The minimum height of a single room
		maxRoomHeight: 10, //The maximum height of a single room
		debug: false //Boolean to enable or disable the debugger
	};

	//Create a new game
	var game = new Roguelike.Game(options);

}
