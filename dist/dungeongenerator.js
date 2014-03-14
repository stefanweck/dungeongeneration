/*! Dungeon Generator - v1.6.0 - 2014-03-14
* https://github.com/stefanweck/dungeongeneration
* Copyright (c) 2014 Stefan Weck */
/**
 * Roguelike javascript game with HTML5's canvas
 *
 * v.1.6.0 - Build on: 22 Feb 2014
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
 *
 * What's next?
 *
 * - Turns
 * - Interaction with objects, such as doors
 * - Different types of rooms
 * - Monsters, enemies
 * - Looting
 * - Treasures
 * - Path finding
 * - And more!
 *
 */

/**
 * @namespace Roguelike
 */
var Roguelike = Roguelike || {

	//Details, version etc
	VERSION: '1.6',

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
	 * @property {Roguelike.Systems.Control} controlSystem - The system object that handles user input and kickstarts the game!
	 */
	this.controlSystem = null;

	/**
	 * @property {Roguelike.Systems.Collision} collisionSystem - The system object that handles collision between entities
	 */
	this.collisionSystem = null;

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

		//Initialize the static systems
		this.controlSystem = new Roguelike.Systems.Control(this);
		this.collisionSystem = new Roguelike.Systems.Collision(this);

		//Add all other systems to the game
		this.systems.push(new Roguelike.Systems.Render(this));

		//Create the player entity
		this.player = new Roguelike.Entity();

		//Give the player a health of 100 points
		this.player.addComponent(new Roguelike.Components.Health(100));

		//The starting position of the player is at the dungeon's entrance
		this.player.addComponent(new Roguelike.Components.Position(this.map.entrance.x, this.map.entrance.y));

		//The player has a sprite ( color for now )
		this.player.addComponent(new Roguelike.Components.Sprite("#FF7300"));

		//The player must be controllable by the keyboard
		this.player.addComponent(new Roguelike.Components.KeyboardControl());

		//Add the player to the entities list of the current map
		this.map.entities.addEntity(this.player);

		//Let the camera follow the player entity
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

Roguelike.Renderer = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {object} canvas - Reference to the canvas object everything is drawn on
	 */
	this.canvas = game.settings.canvas;

	/**
	 * @property {object} canvas - The 2D context of the current canvas object
	 */
	this.context = game.settings.canvas.getContext("2d");

	/**
	 * @property {array} tileColors - Contains all the default colors for the tiles
	 */
	this.tileColors = ['#302222', '#443939', '#6B5B45'];

};

Roguelike.Renderer.prototype = {

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
	 *
	 */
	clear: function() {

		//Clear the entire canvas
		this.context.clearRect(0, 0, this.game.settings.canvas.width, this.game.settings.canvas.height);

	}

};

Roguelike.Utils = {

	/**
	 * Function to generate a random number between two values
	 * @param {int} from - The minimum number
	 * @param {int} to - The maximum number
	 */
	randomNumber: function(from, to) {

		return Math.floor(Math.random() * (to - from + 1) + from);

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

	},

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
		for(var i = 0; i < this.entities.length; i++){

			//Initialize an empty array
			var isThere = [];

			//Loop through the arguments
			for(var a = 0; a < arguments.length; a++){

				//If the current entity has the specified component. Push a random
				//value into the isThere array for later checks
				if(this.entities[i].components[arguments[a]]){
					isThere.push(1);
				}

			}

			//If there are as many matches as supplied arguments, every component
			//is available within this entity
			if(isThere.length === arguments.length){

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

Roguelike.Components.KeyboardControl = function() {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'keyboardControl';

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
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'renderer';

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

	//Initialize itself
	this.initialize();

};

Roguelike.Systems.Render.prototype = {

	/**
	 * Initialize the system, create all objects and variables
	 * @protected
	 */
	initialize: function() {

		//Get the canvas object from the games settings
		this.canvas = this.game.settings.canvas;

		//Define the context to draw on
		this.context = this.game.settings.canvas.getContext("2d");

	},

	/**
	 * Function that gets called when the game continues one tick
	 * @protected
	 */
	update: function() {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("position", "sprite");

		//Save the context to push a copy of our current drawing state onto our drawing state stack
		this.context.save();

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++){

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

	}

};

Roguelike.Systems.Control = function(game) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'control';

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
	 * Initialize the system, create all objects and variables
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
			_this.moveEntities('up');
		};

		//Attach the function to the keydown event
		this.upKey.onDown.on(38, moveUp, _this);

		//Add down key and tell it to move the entities down when it hits
		this.downKey = this.keyboard.getKey(40);

		//Function to perform
		var moveDown = function() {
			_this.moveEntities('down');
		};

		//Attach the function to the keydown event
		this.downKey.onDown.on(40, moveDown, _this);

		//Add left key and tell it to move the entities left when it hits
		this.leftKey = this.keyboard.getKey(37);

		//Function to perform
		var moveLeft = function() {
			_this.moveEntities('left');
		};

		//Attach the function to the keydown event
		this.leftKey.onDown.on(37, moveLeft, _this);

		//Add right key and tell it to move the entities right when it hits
		this.rightKey = this.keyboard.getKey(39);

		//Function to perform
		var moveRight = function() {
			_this.moveEntities('right');
		};

		//Attach the function to the keydown event
		this.rightKey.onDown.on(39, moveRight, _this);

	},

	/**
	 * Function that gets called when the user pressed one of the arrow keys
	 * @protected
	 *
	 * @param {string} direction - The direction the entities are being moved
	 */
	moveEntities: function(direction) {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("keyboardControl", "position");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++){

			//Move the current entity
			this.moveEntity(direction, entities[i]);

		}

		//All the entities are moved, it's time to update the other game mechanics
		this.game.update();

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

		//Declare the new position variable
		var newPosition = {};

		//Check which controls are being pressed and update the player accordingly
		switch(direction){

			case ('left'):

				newPosition = {x: entityPosition.x - 1, y: entityPosition.y};

				if(this.game.collisionSystem.canMove(entity, newPosition)){

					entityPosition.x -= 1;

				}

			break;

			case ('up'):

				newPosition = {x: entityPosition.x, y: entityPosition.y - 1};

				if(this.game.collisionSystem.canMove(entity, newPosition)){

					entityPosition.y -= 1;

				}

			break;

			case ('right'):

				newPosition = {x: entityPosition.x + 1, y: entityPosition.y};

				if(this.game.collisionSystem.canMove(entity, newPosition)){

					entityPosition.x += 1;

				}

			break;

			case ('down'):

				newPosition = {x: entityPosition.x, y: entityPosition.y + 1};

				if(this.game.collisionSystem.canMove(entity, newPosition)){

					entityPosition.y += 1;

				}

			break;

		}

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
	this.entities = null;

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

Roguelike.Tile.prototype = {

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

		//Generate the corridors for these rooms on the current map object
		this.mapFactory.generateCorridors(this);

	}

};

Roguelike.MapFactory = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

};

Roguelike.MapFactory.prototype = {

	/**
	 * Generate a random amount of rooms and add them to the room list
	 * @protected
	 */
	generateRooms: function() {

		//Maximum number of tries before stopping the placement of more rooms
		var maxTries = this.game.map.maxRooms + 10;
		var tries = 0;

		//Create rooms and add them to the list
		while(this.game.map.rooms.length < this.game.map.maxRooms) {

			//Check if the limit has been reached, this prevents the while loop from crashing your page
			//We assume there is no space left on the map and break the loop
			if(tries >= maxTries) {
				break;
			}

			//Generate random values ( in tiles )
			var w = Roguelike.Utils.randomNumber(
				this.game.map.minRoomWidth,
				this.game.map.maxRoomWidth
			);
			var h = Roguelike.Utils.randomNumber(
				this.game.map.minRoomHeight,
				this.game.map.maxRoomHeight
			);
			var x = Roguelike.Utils.randomNumber(
				1,
				this.game.map.tilesX - w - 1
			);
			var y = Roguelike.Utils.randomNumber(
				1,
				this.game.map.tilesY - h - 1
			);

			//Create a new room with these values
			var room = new Roguelike.Room(x, y, w, h);

			//We tryed to create a room at a certain position
			tries++;

			//Check if this room intersects with the other rooms, if not, add it to the list
			if(!this.game.map.roomIntersectsWith(room)) {

				//The room doesn't intersect, initialize the room layout
				room.initialize();
				room.generateExit();

				//If this is the first room, add an entrance to the dungeon
				if(this.game.map.rooms.length === 0) {
					room.generateDungeonEntrance(this.game.map);
				}

				//Add the room to the room list
				this.game.map.rooms.push(room);

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

		//Put the map in a variable for better readability
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

		//Exit positions are stored in layout, so upperleft is 0,0. 
		//We need the map's position, so we'll add the top left coords of the room
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
			for(i = secondExit.x; i >= firstExit.x; i--) {
				this.generateHorizontalCorridor(i, secondExit.y);
			}

		}else{

			//Corridor going right
			for(i = secondExit.x; i <= firstExit.x; i++) {
				this.generateHorizontalCorridor(i, secondExit.y);
			}
		}

		//Vertical Corridors
		if((secondExit.y - firstExit.y) > 0) {

			//If the corridor is going up
			for(i = secondExit.y; i >= firstExit.y; i--) {
				this.generateVerticalCorridor(firstExit.x, i);
			}

		}else{

			//If the corridor is going down
			for(i = secondExit.y; i <= firstExit.y; i++) {
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

		//Check if if there is a wall where we place this corridor, and have a random chance to spawn a door
		var currentTileType = this.game.map.tiles[y][x].type;
		var aboveTileType = this.game.map.tiles[y + 1][x].type;
		var belowTileType = this.game.map.tiles[y - 1][x].type;
		var randomChance = Roguelike.Utils.randomNumber(1, 100);

		if(currentTileType === 1 && aboveTileType === 1 && belowTileType === 1 && randomChance > 60) {

			//Create the door object
			var doorEntity = new Roguelike.Entity();
			doorEntity.addComponent(new Roguelike.Components.Position(x, y));
			doorEntity.addComponent(new Roguelike.Components.Sprite("#FFD900"));

			//Add tis entity to the map
			this.game.map.entities.addEntity(doorEntity);

			//Add this static object to the tile object
			this.game.map.tiles[y][x].staticObject = doorEntity;
			this.game.map.tiles[y][x].blockLight = true;

		}

		//Place a floor tile
		if(this.game.map.tiles[y + 1][x].staticObject !== null) {
			this.game.map.tiles[y][x].type = 1;
		}else if(this.game.map.tiles[y - 1][x].staticObject !== null) {
			this.game.map.tiles[y][x].type = 1;
		}else{
			this.game.map.tiles[y][x].type = 2;

			//Only set block light to false if there isn't a door at this position
			if(this.game.map.tiles[y][x].staticObject === null) {
				this.game.map.tiles[y][x].blockLight = false;
			}
		}

		//Generate walls below this hallway
		if(this.game.map.tiles[y + 1][x].type === 0) {
			this.game.map.tiles[y + 1][x].type = 1;
		}

		//Generate walls above this hallway
		if(this.game.map.tiles[y - 1][x].type === 0) {
			this.game.map.tiles[y - 1][x].type = 1;
		}

	},

	/**
	 * Generate a vertical corridor tile, and also place walls
	 * @protected
	 *
	 * @param {int} prevx - The horizontal position of the tile that has to become a corridor
	 * @param {int} y - The vertical position of the tile that has to become a corridor
	 */
	generateVerticalCorridor: function(prevx, y) {

		//If there is a door on our path, we simply remove it! Bye!
		//TODO: Check if the object is indeed a door, not only an object
		if(this.game.map.tiles[y][prevx].staticObject !== null) {

			//Get the position of the door
			var index = this.game.map.objects.indexOf(this.game.map.tiles[y][prevx].staticObject);

			//Remove the object from the tile and the array
			this.game.map.objects.splice(index, 1);
			this.game.map.tiles[y][prevx].staticObject = null;

		}

		//Set the current tile to floor
		this.game.map.tiles[y][prevx].type = 2;
		this.game.map.tiles[y][prevx].blockLight = false;

		//Generate walls right from this hallway
		if(this.game.map.tiles[y][prevx + 1].type === 0) {
			this.game.map.tiles[y][prevx + 1].type = 1;
		}
		//Generate walls left from this hallway
		if(this.game.map.tiles[y][prevx - 1].type === 0) {
			this.game.map.tiles[y][prevx - 1].type = 1;
		}

	},

	/**
	 * Place the entrance and exit objects on the map
	 * @protected
	 */
	placeEntranceExitObjects: function() {

		//Get the position of the dungeon entrance
		var entrancePosition = this.game.map.entrance;

		//Create the entrance entity
		var entranceEntity = new Roguelike.Entity();
		entranceEntity.addComponent(new Roguelike.Components.Position(entrancePosition.x, entrancePosition.y));
		entranceEntity.addComponent(new Roguelike.Components.Sprite("#BD2D2D"));

		//Add this entity to the map
		this.game.map.entities.addEntity(entranceEntity);

		//TODO: Make exit object

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
		for(y = 0; y < this.h; y++) {

			//Initialize this row
			this.layout[y] = [];

			//Loop through every vertical row
			for(x = 0; x < this.w; x++) {

				//Check if the position filled has to be a wall or floor
				if(y === 0 || y === this.h - 1 || x === 0 || x === this.w - 1) {
					this.layout[y][x] = new Roguelike.Tile(1, true, this);
				}else{
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
	 * Generate an entrance to this dungeon, also the players initial spawn position
	 * @protected
	 *
	 * @param {Roguelike.Map} map - The map on which this dungeon entrance is going to spawn
	 */
	generateDungeonEntrance: function(map) {

		//Get random positions within the room
		var positionX = Roguelike.Utils.randomNumber(2, this.w - 3);
		var positionY = Roguelike.Utils.randomNumber(2, this.h - 3);

		//Store the entrance location on the map
		map.entrance = {
			x: this.x1 + positionX,
			y: this.y1 + positionY
		};

	}

};

Roguelike.LightSource = function(game, options) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {bool} gradient - Should the lightmap be drawn with a gradient
	 */
	this.gradient = options.gradient;

	/**
	 * @property {object} mapSize - The size of the current map
	 */
	this.mapSize = {x: game.map.tilesX, y: game.map.tilesY};

	/**
	 * @property {object} tiles - Object that is being used to store tile data before returning it
	 */
	this.tiles = [];

	/**
	 * @property {object} position - The current position of the light source
	 */
	this.position = new Roguelike.Vector2(-1, -1);

	/**
	 * @property {int} radius - The radius of the light, how far does it shine it's magical light!
	 */
	this.radius = options.radius;

	/**
	 * @property {object} oldRadius
	 */
	this.oldRadius = options.radius;

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

Roguelike.LightSource.prototype = {

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
	 * Calculates an octant. Called by the this.calculate when calculating lighting
	 * @protected
	 */
	calculateOctant: function(cx, cy, row, start, end, radius, xx, xy, yx, yy, id) {
		this.tiles.push({
			x: cx,
			y: cy,
			lightLevel: 0
		});

		var new_start = 0;

		if(start < end) return;

		var radius_squared = radius * radius;

		for(var i = row; i < radius + 1; i++) {
			var dx = -i - 1;
			var dy = -i;

			var blocked = false;

			while(dx <= 0) {

				dx += 1;

				var X = cx + dx * xx + dy * xy;
				var Y = cy + dx * yx + dy * yy;

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
							var pos2 = this.position;
							var d = (pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.y - pos2.y) * (pos1.y - pos2.y);

							this.tiles.push({
								x: X,
								y: Y,
								lightLevel: (this.gradient === false) ? 1 : (1 - (d / (this.radius * this.radius)))
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
							if(this.doesTileBlock(X, Y) && i < radius) {
								blocked = true;
								this.calculateOctant(cx, cy, i + 1, start, l_slope, this.radius, xx, xy, yx, yy, id + 1);

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
	 */
	calculate: function() {
		for(var i = 0; i < 8; i++) {
			this.calculateOctant(this.position.x, this.position.y, 1, 1.0, 0.0, this.radius,
				this.mult[0][i], this.mult[1][i], this.mult[2][i], this.mult[3][i], 0);
		}

		//Push this tile and it's light level's in the tiles array
		this.tiles.push({
			x: this.position.x,
			y: this.position.y,
			lightLevel: 1
		});

		//Return the tiles
		return this.tiles;
	},

	/**
	 * Update the position of the lightsource and calculate light again
	 * @protected
	 *
	 * @param {int} x - The X position of the lightsource
	 * @param {int} y - The Y position of the lightsource
	 */
	update: function(x, y) {
		this.position = new Roguelike.Vector2(x, y);
		return this.clear().concat(this.calculate());
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
		maxRooms: 10, //The maximum number of rooms on this map
		minRoomWidth: 6, //The minimum width of a single room
		maxRoomWidth: 12, //The maximum width of a single room
		minRoomHeight: 6, //The minimum height of a single room
		maxRoomHeight: 12, //The maximum height of a single room
		debug: false //Boolean to enable or disable the debugger
	};

	//Create a new game
	var game = new Roguelike.Game(options);

}
