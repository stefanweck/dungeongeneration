/*! Dungeon Generator - v1.7.0 - 2014-03-21
* https://github.com/stefanweck/dungeongeneration
* Copyright (c) 2014 Stefan Weck */
/**
 * Roguelike javascript game with HTML5's canvas
 *
 * v.1.7.0 - Build on: 21 March 2014
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
 *
 * What's next?
 *
 * - Different types of rooms
 * - Monsters, enemies
 * - Looting
 * - Treasures
 * - Path finding
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
	VERSION: '1.7.0',

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

		//Create the camera object
		this.camera = new Roguelike.Camera(this, {x: 0, y: 0});

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

		//Add a lightsource to the player
		this.player.addComponent(new Roguelike.Components.LightSource(true, 6));

		//Add the player to the entities list of the current map
		this.map.entities.addEntity(this.player);

		//Let the camera follow the player entity
		this.camera.follow(this.player, this.settings.canvas.width / 2, this.settings.canvas.height / 2);

		//Add all systems to the game
		this.systems.push(new Roguelike.Systems.Collision(this));
		this.systems.push(new Roguelike.Systems.Open(this));
		this.systems.push(new Roguelike.Systems.Control(this));
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

var CustomRandom = function(nseed) {

	var seed = nseed;
	var constant = Math.pow(2, 13) + 1;
	var prime = 1987;
	var maximum = 1000;

	return {
		next: function(min, max) {

			while(seed > constant) seed = seed / prime;

			seed *= constant;
			seed += prime;

			return min && max ? min + seed % maximum / maximum * (max - min) : seed % maximum / maximum;
		}
	}
};

var rng = CustomRandom(42343);
//use '42343' as a seed

/**
 * @class Roguelike.Utils
 * @classdesc In this class are the functions stored that are being
 * used in other functions
 */
Roguelike.Utils = {

	/**
	 * Function to generate a random number between two values
	 * @param {int} from - The minimum number
	 * @param {int} to - The maximum number
	 */
	randomNumber: function(from, to) {

		return Math.floor(rng.next() * (to - from + 1) + from);

	},

	/**
	 * Function to extend the default options with the users options
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
	 * @param {object} object - The object to search for
	 * @param {Array} list - The list, aka the array
	 */
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
	 * @property {int} viewportWidth - The width of the game's canvas, in pixels
	 */
	this.viewportWidth = game.settings.canvas.width;

	/**
	 * @property {int} viewportHeight - The height of the game's canvas, in pixels
	 */
	this.viewportHeight = game.settings.canvas.height;

	/**
	 * @property {int} minimumDistanceX - The minimal distance from horizontal borders before the camera starts to move, in pixels
	 */
	this.minimumDistanceX = 0;

	/**
	 * @property {int} minimumDistanceY - The minimal distance from vertical borders before the camera starts to move, in pixels
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
	 * @param {int} minimumDistanceX - The minimal distance from horizontal borders before the camera starts to move
	 * @param {int} minimumDistanceY - The minimal distance from vertical borders before the camera starts to move
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
			if((this.followObject.x * tileSize) - this.position.x + this.minimumDistanceX > this.viewportWidth) {

				//Set the new horizontal position for the camera
				this.position.x = (this.followObject.x * tileSize) - (this.viewportWidth - this.minimumDistanceX);

			}else if((this.followObject.x * tileSize) - this.minimumDistanceX < this.position.x) {

				//Set the new horizontal position for the camera
				this.position.x = (this.followObject.x * tileSize) - this.minimumDistanceX;

			}

			//Then move the camera vertical
			if((this.followObject.y * tileSize) - this.position.y + this.minimumDistanceY > this.viewportHeight) {

				//Set the new vertical position for the camera
				this.position.y = (this.followObject.y * tileSize) - (this.viewportHeight - this.minimumDistanceY);

			}else if((this.followObject.y * tileSize) - this.minimumDistanceY < this.position.y) {

				//Set the new vertical position for the camera
				this.position.y = (this.followObject.y * tileSize) - this.minimumDistanceY;

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
	 * @property {int} x - The x coordinate of this vector2 object
	 */
	this.x = x;

	/**
	 * @property {int} x - The y coordinate of this vector2 object
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
	 * @property {int} left - The left position of this boundary, in pixels
	 */
	this.left = left || 0;

	/**
	 * @property {int} top - The top position of this boundary, in pixels
	 */
	this.top = top || 0;

	/**
	 * @property {int} width - The width of this boundary, in pixels
	 */
	this.width = width || 0;

	/**
	 * @property {int} height - The height of this boundary, in pixels
	 */
	this.height = height || 0;

	/**
	 * @property {int} right - The right position of this boundary, in pixels
	 */
	this.right = (this.left + this.width);

	/**
	 * @property {int} bottom - The bottom position of this boundary, in pixels
	 */
	this.bottom = (this.top + this.height);

};

Roguelike.Boundary.prototype = {

	/**
	 * Function that allows the user to set new values for the boundary
	 * @protected
	 *
	 * @param {int} left - The left position of this boundary, in pixels
	 * @param {int} top - The top position of this boundary, in pixels
	 * @param {int} width - Optional: The width of this boundary, in pixels
	 * @param {int} height - Optional: The height of this boundary, in pixels
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

Roguelike.Components.Sprite = function(color) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'sprite';

	/**
	 * @property {string} color - The color code of the current entity
	 */
	this.color = color;

};

Roguelike.Components.Health = function(maxHealth) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'health';

	/**
	 * @property {int} health - The starting, and maximum health of the entity
	 */
	this.health = this.maxHealth = maxHealth;

};

Roguelike.Components.Health.prototype = {

	/**
	 * Check whether the entity is dead
	 * @protected
	 */
	isDead: function() {

		return this.health <= 0;

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
	 * @property {int} radius - The radius of the light, how far does it shine it's magical light!
	 */
	this.radius = radius;

};

Roguelike.Components.Collide = function(collide) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'collide';

	/**
	 * @property {Roguelike.Event} events - Event holder
	 */
	this.collide = collide;

};

Roguelike.Components.KeyboardControl = function() {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'keyboardControl';

	/**
	 * @property {array} actions - The next actions to perform on this object
	 */
	this.actions = [];

};

Roguelike.Components.Position = function(x, y) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'position';

	/**
	 * @property {int} x - The horizontal position of the entity
	 */
	this.x = x;

	/**
	 * @property {int} y - The vertical position of the entity
	 */
	this.y = y;

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

	},

	/**
	 * Draw the current map onto the canvas
	 * @protected
	 */
	drawMap: function() {

		//Save the context to push a copy of our current drawing state onto our drawing state stack
		this.context.save();

		//Loop through every horizontal row
		for(var y = 0; y < this.game.map.tilesY; y++) {

			//Loop through every vertical row
			for(var x = 0; x < this.game.map.tilesX; x++) {

				//Get the type of the current tile
				var tileType = this.game.map.tiles[y][x].type;

				//Get the corresponding color of this tile from the array of colors
				this.context.fillStyle = this.tileColors[tileType];

				//Get the size of one tile to determine how big each rectangle is
				var tileSize = this.game.map.tileSize;

				//Create a rectangle!
				this.context.fillRect(
					//Get the current position of the tile, and check where it is in the camera's viewport
					(x * tileSize) - this.game.camera.position.x,
					(y * tileSize) - this.game.camera.position.y,
					tileSize,
					tileSize
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

			//The objects color
			this.context.fillStyle = renderComponent.color;

			//Create the object ( just a rectangle for now )!
			this.context.fillRect(
				(positionComponent.x * this.game.map.tileSize) - this.game.camera.position.x,
				(positionComponent.y * this.game.map.tileSize) - this.game.camera.position.y,
				this.game.map.tileSize,
				this.game.map.tileSize
			);

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

		//Save the context to push a copy of our current drawing state onto our drawing state stack
		this.context.save();

		//Loop through every horizontal row
		for(var y = 0; y < this.game.map.tilesY; y++) {

			//Loop through every vertical row
			for(var x = 0; x < this.game.map.tilesX; x++) {

				//Draw the lightmap
				if(this.game.map.tiles[y][x].explored === true && 1 - this.game.map.tiles[y][x].lightLevel > 0.7) {

					this.context.fillStyle = "rgba(0, 0, 0, 0.7)";

				}else{

					this.context.fillStyle = "rgba(0, 0, 0, " + (1 - this.game.map.tiles[y][x].lightLevel) + ")";

				}

				//Get the size of one tile to determine how big each rectangle is
				var tileSize = this.game.map.tileSize;

				//Create a rectangle!
				this.context.fillRect(
					//Get the current position of the tile, and check where it is in the camera's viewport
					(x * tileSize) - this.game.camera.position.x,
					(y * tileSize) - this.game.camera.position.y,
					tileSize,
					tileSize
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
				for(var a = canOpenComponent.actions.length; a >= 0; a--) {

					//Pop the action from the "stack"
					var currentAction = canOpenComponent.actions.pop();

					//Action to open the door
					if(currentAction === "open") {

						//Change the door's state to open
						canOpenComponent.state = "open";

						//Change the sprite to open
						spriteComponent.color = "#ccc";

						//Make sure the collide component doesn't say it collides anymore
						collideComponent.collide = false;

						//Make sure the tile that this openable entity is on doesn't block light anymore
						this.game.map.tiles[positionComponent.y][positionComponent.x].blockLight = false;

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
	 * @param {int} x - The X position of the tile
	 * @param {int} y - The Y position of the tile
	 */
	doesTileBlock: function(x, y) {
		return this.game.map.tiles[y][x].blockLight;
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
			var newLight = this.clear().concat(this.calculate(lightSourceComponent, positionComponent));

			//Update the tiles on the map with the new light levels
			for(var l = 0; l < newLight.length; l++) {
				this.game.map.tiles[newLight[l].y][newLight[l].x].lightLevel = newLight[l].lightLevel;
				this.game.map.tiles[newLight[l].y][newLight[l].x].explored = true;
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
			_this.queueMovement(38);
		};

		//Attach the function to the keydown event
		this.upKey.onDown.on(38, moveUp, _this);

		//Add down key and tell it to move the entities down when it hits
		this.downKey = this.keyboard.getKey(40);

		//Function to perform
		var moveDown = function() {
			_this.queueMovement(40);
		};

		//Attach the function to the keydown event
		this.downKey.onDown.on(40, moveDown, _this);

		//Add left key and tell it to move the entities left when it hits
		this.leftKey = this.keyboard.getKey(37);

		//Function to perform
		var moveLeft = function() {
			_this.queueMovement(37);
		};

		//Attach the function to the keydown event
		this.leftKey.onDown.on(37, moveLeft, _this);

		//Add right key and tell it to move the entities right when it hits
		this.rightKey = this.keyboard.getKey(39);

		//Function to perform
		var moveRight = function() {
			_this.queueMovement(39);
		};

		//Attach the function to the keydown event
		this.rightKey.onDown.on(39, moveRight, _this);

	},

	/**
	 * Function to queue movement onto entities that have the keyboard control component
	 * @protected
	 *
	 * @param {int} key - The keycode of the move being queued
	 */
	queueMovement: function(key) {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("keyboardControl", "position");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++) {

			//Get the keyboardControl component
			var keyboardControlComponent = entities[i].getComponent("keyboardControl");

			//Add this direction to it's movement queue
			keyboardControlComponent.actions.push(key);

		}

		//All the entities movements are queued, it's time to update the other game mechanics
		this.game.update();

	},

	/**
	 * Function that gets called when the game continues one tick
	 * @protected
	 */
	update: function() {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("keyboardControl", "position");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++) {

			//Get the keyboardControl component
			var keyboardControlComponent = entities[i].getComponent("keyboardControl");

			//Loop through the actions
			for(var a = keyboardControlComponent.actions.length - 1; a >= 0; a--) {

				//Pop the action from the "stack"
				var currentAction = keyboardControlComponent.actions.pop();

				//Move the current entity to the current action
				this.moveEntity(currentAction, entities[i]);

			}

		}

	},

	/**
	 * The function that gets called when the player moves
	 * @protected
	 *
	 * @param {string} direction - The direction the entities are being moved
	 * @param {Roguelike.Entity} entity - The entity that is being controlled
	 */
	moveEntity: function(direction, entity) {

		//Get the current entities position component
		var entityPosition = entity.getComponent("position");

		//Check which controls are being pressed and update the player accordingly
		switch(direction) {

			case (37): //Left

				entityPosition.x -= 1;

				break;

			case (38): //Up

				entityPosition.y -= 1;

				break;

			case (39): //Right

				entityPosition.x += 1;

				break;

			case (40): //Down

				entityPosition.y += 1;

				break;

		}

	}

};

Roguelike.Systems.Collision = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

};

Roguelike.Systems.Collision.prototype = {

	/**
	 * Function that gets called when the game continues one tick
	 * @protected
	 */
	update: function() {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("keyboardControl", "position");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++) {

			//Get the keyboardControl component
			var keyboardControlComponent = entities[i].getComponent("keyboardControl");
			var positionComponent = entities[i].getComponent("position");

			//Loop through the actions
			for(var a = keyboardControlComponent.actions.length - 1; a >= 0; a--) {

				//Pop the action from the "stack"
				var currentAction = keyboardControlComponent.actions[a];

				//Define the newposition variable
				var newPosition;

				switch(currentAction) {

					case (37): //Left

						newPosition = {x: positionComponent.x - 1, y: positionComponent.y};

						break;

					case (39): //Right

						newPosition = {x: positionComponent.x + 1, y: positionComponent.y};

						break;

					case (38): //Down

						newPosition = {x: positionComponent.x, y: positionComponent.y - 1};

						break;

					case (40): //Up

						newPosition = {x: positionComponent.x, y: positionComponent.y + 1};

						break;

				}

				//Check if the new position is correct
				if(!this.canMove(entities[i], newPosition)) {

					//The new position is invalid, remove the action from the queue
					keyboardControlComponent.actions.splice(a, 1);

				}

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
		var nextTile = this.game.map.tiles[newPosition.y][newPosition.x];

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
						nextTile.entities[i].components[key].events.trigger("bumpInto");

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
	 * @property {int} keyCode - The keycode of this specific key
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
	 * @property {int} lastDown - Timestamp of the last key press
	 */
	this.lastDown = 0;

	/**
	 * @property {int} lastUp - Timestamp of the last key release
	 */
	this.lastUp = 0;

	/**
	 * @property {int} delay - Delay between two events on keydown
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
	 * @param {int} keycode - The keycode of the key being added
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

Roguelike.Tile = function(type, blockLight, room) {

	/**
	 * @property {int} The kind of tile, wall, floor, void etc
	 */
	this.type = type;

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
	 * @property {int} lightLevel - The brightness of the current tile
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
	 * @property {int} tilesX - The number of horizontal tiles on this map
	 */
	this.tilesX = game.settings.tilesX;

	/**
	 * @property {int} tilesY - The number of vertical tiles on this map
	 */
	this.tilesY = game.settings.tilesY;

	/**
	 * @property {int} maxRooms - The maximum number of rooms allowed on this map
	 */
	this.maxRooms = game.settings.maxRooms;

	/**
	 * @property {array} rooms - An array that holds all room objects
	 */
	this.rooms = [];

	/**
	 * @property {array} corridors - An array that holds all corridor objects
	 */
	this.corridors = [];

	/**
	 * @property {array} tiles - An array that holds all tile objects
	 */
	this.tiles = [];

	/**
	 * @property {array} objects - An array that holds all objects that are on the map
	 */
	this.objects = [];

	/**
	 * @property {int} tileSize - The width and height of a single tile on the map
	 */
	this.tileSize = game.settings.tileSize;

	/**
	 * @property {int} minRoomWidth - The minimum width of a room on this map
	 */
	this.minRoomWidth = game.settings.minRoomWidth;

	/**
	 * @property {int} maxRoomWidth - The maximum width of a room on this map
	 */
	this.maxRoomWidth = game.settings.maxRoomWidth;

	/**
	 * @property {int} minRoomHeight - The minimum heigth of a room on this map
	 */
	this.minRoomHeight = game.settings.minRoomHeight;

	/**
	 * @property {int} maxRoomHeight - The maximum heigth of a room on this map
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
		for(y = 0; y < this.tilesY; y++) {

			//Initialize this row
			this.tiles[y] = [];

			//Loop through every vertical row
			for(x = 0; x < this.tilesX; x++) {

				//Initialize this position by setting it to zero, and blocking light
				this.tiles[y][x] = new Roguelike.Tile(0, true);

			}

		}

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
			for(y = this.rooms[i].y1; y < this.rooms[i].y2; y++) {

				//What is the current Y position in the layout of the current room
				var layoutYPos = this.rooms[i].y2 - y - 1;

				//Loop through every vertical row
				for(x = this.rooms[i].x1; x < this.rooms[i].x2; x++) {

					//What is the current X position in the layout of the current room
					var layoutXPos = this.rooms[i].x2 - x - 1;

					//Get the current tile object
					var currentTile = this.rooms[i].layout[layoutYPos][layoutXPos];

					//Place the tile that is on the layout on this position on the map
					this.tiles[y][x] = currentTile;

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
	 * @param {int} x - The horizontal position of the tile that has to become a corridor
	 * @param {int} y - The vertical position of the tile that has to become a corridor
	 */
	generateHorizontalCorridor: function(x, y) {

		//Define the map variable
		var map = this.game.map;

		//Get the current tile
		var currentTile = map.tiles[y][x];

		//Check the tiles type from the tiles above and below the current tile
		var aboveTile = map.tiles[y + 1][x];
		var belowTile = map.tiles[y - 1][x];

		//If the current tile type is a wall, and the tiles above and below here are also walls
		//this may be a possible door location
		if(currentTile.type === 1 && aboveTile.type === 1 && belowTile.type === 1) {

			//Push the coordinates into the array for later use
			this.possibleDoorLocations.push({x: x, y: y});

		}

		//Set the current tile type to floor
		currentTile.type = 2;
		currentTile.blockLight = false;

		//Generate walls below this hallway
		if(aboveTile.type === 0) {

			aboveTile.type = 1;

		}

		//Generate walls above this hallway
		if(belowTile.type === 0) {

			belowTile.type = 1;

		}

	},

	/**
	 * Generate a vertical corridor tile, and also place walls
	 * @protected
	 *
	 * @param {int} x - The horizontal position of the tile that has to become a corridor
	 * @param {int} y - The vertical position of the tile that has to become a corridor
	 */
	generateVerticalCorridor: function(x, y) {

		//Define the map variable
		var map = this.game.map;

		//Get the current tile
		var currentTile = map.tiles[y][x];

		//Check the tiles type from the tiles above and below the current tile
		var rightTile = map.tiles[y][x + 1];
		var leftTile = map.tiles[y][x - 1];

		//If the current tile type is a wall, and the tiles left and right here are also walls
		//this may be a possible door location
		if(currentTile.type === 1 && rightTile.type === 1 && leftTile.type === 1) {

			//Push the coordinates into the array for later use
			this.possibleDoorLocations.push({x: x, y: y});

		}

		//Set the current tile to floor
		currentTile.type = 2;
		currentTile.blockLight = false;

		//Generate walls right from this hallway
		if(rightTile.type === 0) {

			rightTile.type = 1;

		}

		//Generate walls left from this hallway
		if(leftTile.type === 0) {

			leftTile.type = 1;

		}

		//The following checks prevent corners ending without being attached to another wall
		//Because we don't know which direction the vertical corridor is being placed, we check
		//upperleft, upperright, bottomleft and bottomright
		//TODO: Find a better solution for these checks

		//Also check for the upperright tile to maybe place a wall
		if(map.tiles[y + 1][x + 1].type === 0) {

			map.tiles[y + 1][x + 1].type = 1;

		}

		//Also check for the upperleft tile to maybe place a wall
		if(map.tiles[y - 1][x - 1].type === 0) {

			map.tiles[y - 1][x - 1].type = 1;

		}

		//Also check for the bottomright tile to maybe place a wall
		if(map.tiles[y - 1][x + 1].type === 0) {

			map.tiles[y - 1][x + 1].type = 1;

		}

		//Also check for the bottomleft tile to maybe place a wall
		if(map.tiles[y + 1][x - 1].type === 0) {

			map.tiles[y + 1][x - 1].type = 1;

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
			var tileLeft = this.game.map.tiles[doorLocation.y][doorLocation.x - 1];
			var tileRight = this.game.map.tiles[doorLocation.y][doorLocation.x + 1];
			var tileUp = this.game.map.tiles[doorLocation.y + 1][doorLocation.x];
			var tileDown = this.game.map.tiles[doorLocation.y - 1][doorLocation.x];

			var randomNumber = Roguelike.Utils.randomNumber(0, 100);

			//If the tiles left and right are walls and the tiles above and below are floors
			if(tileLeft.type === 1 && tileRight.type === 1 && tileUp.entities.length === 0 && tileDown.entities.length === 0 && tileUp.type === 2 && tileDown.type === 2 && randomNumber > 80) {

				//Place a door at this location
				this.placeDoor(doorLocation);

				//If the tiles left and right are floors and the tiles above and below are walls
			}else if(tileLeft.type === 2 && tileRight.type === 2 && tileLeft.entities.length === 0 && tileRight.entities.length === 0 && tileUp.type === 1 && tileDown.type === 1 && randomNumber > 60) {

				//Place a door at this location
				this.placeDoor(doorLocation);

			}

		}

	},

	/**
	 * Place the entrance and exit objects on the map
	 * @protected
	 */
	placeDoor: function(position) {

		//Get the tile at the door's position
		var tileAtPosition = this.game.map.tiles[position.y][position.x];

		//Create the door entity
		var doorEntity = new Roguelike.Entity();

		//Add components to the door entity
		doorEntity.addComponent(new Roguelike.Components.Position(position.x, position.y));
		doorEntity.addComponent(new Roguelike.Components.Sprite("#FFD900"));
		doorEntity.addComponent(new Roguelike.Components.CanOpen());
		doorEntity.addComponent(new Roguelike.Components.Collide(true));

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

		//Let the rooms return a random tile
		var entrancePosition = entranceRoom.getRandomPosition();
		var exitPosition = exitRoom.getRandomPosition();

		//Store the entrance and exit positions in the map for later use
		//For example, player spawning
		this.game.map.entrance = entrancePosition;
		this.game.map.exit = exitPosition;

		//Create the entrance entity
		var entranceEntity = new Roguelike.Entity();

		//Add components to the entrance entity
		entranceEntity.addComponent(new Roguelike.Components.Position(entrancePosition.x, entrancePosition.y));
		entranceEntity.addComponent(new Roguelike.Components.Sprite("#BD2D2D"));

		//Create the entrance entity
		var exitEntity = new Roguelike.Entity();

		//Add components to the exit entity
		exitEntity.addComponent(new Roguelike.Components.Position(exitPosition.x, exitPosition.y));
		exitEntity.addComponent(new Roguelike.Components.Sprite("#BD2D2D"));

		//Add this entity to the map
		this.game.map.entities.addEntity(entranceEntity);
		this.game.map.entities.addEntity(exitEntity);


	}

};

Roguelike.Room = function(x, y, w, h) {

	/**
	 * @property {int} x1 - The X position of the top left corner of this room
	 */
	this.x1 = x;

	/**
	 * @property {int} x2 - The X position of the top right corner of this room
	 */
	this.x2 = w + x;

	/**
	 * @property {int} y1 - The Y position of top left corner of this room
	 */
	this.y1 = y;

	/**
	 * @property {int} y2 - The Y position of bottom left corner of this room
	 */
	this.y2 = y + h;

	/**
	 * @property {int} w - The width of this room, defined in tiles
	 */
	this.w = w;

	/**
	 * @property {int} h - The heigth of this room, defined in tiles
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
		for(var y = 0; y < this.h; y++) {

			//Initialize this row
			this.layout[y] = [];

			//Loop through every vertical row
			for(var x = 0; x < this.w; x++) {

				//Check if the position filled has to be a wall or floor
				if(y === 0 || y === this.h - 1 || x === 0 || x === this.w - 1) {

					//Create a new wall tile
					this.layout[y][x] = new Roguelike.Tile(1, true, this);

				}else{

					//Create a new floor tile
					this.layout[y][x] = new Roguelike.Tile(2, false, this);

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

		//Return the position as an object
		return {x: positionX, y: positionY};

	}

};

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
		tileSize: 25, //The width and height of a single tile
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
