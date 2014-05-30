/*! Dungeon Generator - v0.6.3 - 2014-05-30
* https://github.com/stefanweck/dungeongeneration
* Copyright (c) 2014 Stefan Weck */
/**
 * Roguelike javascript game with HTML5's canvas
 *
 * v.0.6.3 - Build on: 26 May 2014
 *
 */

/**
 * @namespace Roguelike
 */
var Roguelike = Roguelike || {

	//Details, version etc
	VERSION: '0.6.3',

	//Holder for all the game's available components
	Components: {},

	//Holder for all the game's available systems
	Systems: {}

};

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

Roguelike.Camera = function(game, position) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
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
	 * @property {Roguelike.Boundary} viewportBoundary - The boundary that represents the viewport
	 */
	this.viewportBoundary = new Roguelike.Boundary(
		this.position.x * game.map.settings.tileSize,
		this.position.y * game.map.settings.tileSize,
		this.viewportWidth,
		this.viewportHeight
	);

	/**
	 * @property {Roguelike.Boundary} mapBoundary - The boundary that represents the viewport
	 */
	this.mapBoundary = new Roguelike.Boundary(
		0,
		0,
		game.map.settings.tilesX * game.map.settings.tileSize,
		game.map.settings.tilesY * game.map.settings.tileSize
	);

};

Roguelike.Camera.prototype = {

	/**
	 * Function to call when you want to follow a specific entity
	 * @protected
	 *
	 * @param {Roguelike.Entity} followEntity - The entity that should be followed by the camera, this entity is required to have the position component
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

Roguelike.Vector2 = function(x, y) {

	/**
	 * @property {Number} x - The x coordinate of this vector2 object
	 */
	this.x = x;

	/**
	 * @property {Number} x - The y coordinate of this vector2 object
	 */
	this.y = y;

};

Roguelike.Vector2.prototype = {

	/**
	 * Add another Vector2 object to this Vector2 object
	 * @protected
	 *
	 * @param {Roguelike.Vector2} other - The other Vector2 object
	 *
	 * @return {Roguelike.Vector2} The combined Vector2 object
	 */
	combine: function(other) {

		//Return the Vector2 object
		return new Roguelike.Vector2(this.x + other.x, this.y + other.y);

	},

	/**
	 * Add another Vector2 object
	 * @protected
	 *
	 * @param {Roguelike.Vector2} other - The other Vector2 object
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
	 * @return {Roguelike.Vector2} The cloned Vector2 object
	 */
	clone: function() {

		return(new Roguelike.Vector2(this.x, this.y));

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

Roguelike.Boundary = function(left, top, width, height) {

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

Roguelike.Boundary.prototype = {

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
	 * @param {Roguelike.Boundary} boundary - The boundary to check against
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
	 * @param {Roguelike.Boundary} boundary - The boundary to check against
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

Roguelike.Entity = function(game, speed) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Number} speed - The speed of this entity
	 */
	this.speed = speed || 1000;

	/**
	 * @property {Object} components - An object filled with all the components this entity has
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
	 * @property {Array} entities - Collection of all the entities in this group
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
		if(position === -1) {

			return;

		}

		//Remove the current entity from the group
		this.entities.splice(position, 1);

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

Roguelike.Components.Sprite = function(sprite, row, tile) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'sprite';

	/**
	 * @property {String} sprite - The sprite image of this entity
	 */
	this.sprite = sprite;

	/**
	 * @property {Number} row - The row that the sprite is on, on the tileset
	 */
	this.row = row;

	/**
	 * @property {Number} tile - The specific tile that the sprite is on, on the tileset
	 */
	this.tile = tile;

};

Roguelike.Components.Health = function(maxHealth) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'health';

	/**
	 * @property {Number} health - The starting, and maximum health of the entity
	 */
	this.health = this.maxHealth = maxHealth;

};

Roguelike.Components.Health.prototype = {

	/**
	 * Returns the percentage of health that is left
	 * @protected
	 *
	 * @return {Number} Percentage rounded to 2 decimals
	 */
	percentage: function() {

		//Return the percentage
		return this.health / this.maxHealth;

	},

	/**
	 * Check if the entity has full health
	 * @protected
	 *
	 * @return {Boolean} True when full health, false when damaged
	 */
	isDamaged: function() {

		//Return true or false based on the entities health
		return this.health < this.maxHealth;

	},

	/**
	 * Check whether the entity is dead
	 * @protected
	 *
	 * @return {Boolean} True when dead, false when alive
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

Roguelike.Components.CanOpen = function(game, entity) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'canOpen';

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Roguelike.Entity} entity - Reference to the entity that has this component
	 */
	this.entity = entity;

	/**
	 * @property {Roguelike.Event} events - Event holder
	 */
	this.events = new Roguelike.Event();

	/**
	 * @property {String} state - The state of this door, closed opened etc
	 */
	this.state = 'closed';

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

		//The Open System will handle opening or closing this door
		this.game.staticSystems.openSystem.handleSingleEntity(this.entity);

	}

};

Roguelike.Components.LightSource = function(gradient, radius) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'lightSource';

	/**
	 * @property {Boolean} gradient - Should the lightmap be drawn with a gradient
	 */
	this.gradient = gradient;

	/**
	 * @property {Number} radius - The radius of the light, how far does it shine it's magical light!
	 */
	this.radius = radius;

};

Roguelike.Components.Collide = function(collide) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'collide';

	/**
	 * @property {Boolean} collide - True or false depending on if it should collide with other entities
	 */
	this.collide = collide;

};

Roguelike.Components.KeyboardControl = function(game, entity, controls) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'keyboardControl';

	/**
	 * @property {Roguelike.Entity} entity - Reference to the entity that has this component
	 */
	this.entity = entity;

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Array} controls - Associative array with every control that this entity uses
	 */
	this.controls = controls;

	/**
	 * @property {Roguelike.Keyboard} keyboard - Reference to the keyboard object
	 */
	this.keyboard = game.keyboard;

	/**
	 * @property {Roguelike.Scheduler} scheduler - Reference to the scheduler object
	 */
	this.scheduler = game.scheduler;

	//Initialize the component
	this.initialize();

};

Roguelike.Components.KeyboardControl.prototype = {

	/**
	 * The 'constructor' for this component
	 * Adds the event listener for keyboards events on this entity
	 * @protected
	 */
	initialize: function() {

		//Loop through each control keycode of this entity
		for(var key in this.controls) {

			switch(key) {

				case("left"):

					//Add up key and tell it to move the entities up when it hits
					var leftKey = this.keyboard.getKey(this.controls[key]);

					//Attach the new position function to the keydown event
					leftKey.onDown.on(this.controls[key], this.newPosition.bind(this, "left"), this);

					break;

				case("right"):

					//Add up key and tell it to move the entities up when it hits
					var rightKey = this.keyboard.getKey(this.controls[key]);

					//Attach the new position function to the keydown event
					rightKey.onDown.on(this.controls[key], this.newPosition.bind(this, "right"), this);

					break;

				case("up"):

					//Add up key and tell it to move the entities up when it hits
					var upKey = this.keyboard.getKey(this.controls[key]);

					//Attach the new position function to the keydown event
					upKey.onDown.on(this.controls[key], this.newPosition.bind(this, "up"), this);

					break;

				case("down"):

					//Add up key and tell it to move the entities up when it hits
					var downKey = this.keyboard.getKey(this.controls[key]);

					//Attach the new position function to the keydown event
					downKey.onDown.on(this.controls[key], this.newPosition.bind(this, "down"), this);

					break;

			}

		}

	},

	/**
	 * The function that gets called when a player moves
	 * @protected
	 *
	 * @param {String} direction - The direction the entities are being moved
	 */
	newPosition: function(direction) {

		//Define variables
		var movement;

		//Check which controls are being pressed and update the player accordingly
		switch(direction) {

			case ("left"):

				movement = new Roguelike.Vector2(-1, 0);

				break;

			case ("up"):

				movement = new Roguelike.Vector2(0, -1);

				break;

			case ("right"):

				movement = new Roguelike.Vector2(1, 0);

				break;

			case ("down"):

				movement = new Roguelike.Vector2(0, 1);

				break;

		}

		//Get the components
		var positionComponent = this.entity.getComponent("position");

		//Calculate the new position
		var newPosition = positionComponent.position.combine(movement);

		//Tell the movement system that you want to move to the new position
		this.game.staticSystems.movementSystem.handleSingleEntity(this.entity, newPosition);

		//Unlock the scheduler because the player has moved
		this.scheduler.unlock();

	}

};

Roguelike.Components.Position = function(position) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'position';

	/**
	 * @property {Roguelike.Vector2} position - The position object of this entity
	 */
	this.position = position;

};

Roguelike.Components.Weapon = function(damage) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'weapon';

	/**
	 * @property {Number} damage - The damage that this weapon does
	 */
	this.damage = damage;

};

Roguelike.Components.CanFight = function(game) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'canFight';

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Roguelike.Event} events - Event holder
	 */
	this.events = new Roguelike.Event();

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

		//The combat system will handle the combat!
		this.game.staticSystems.combatSystem.handleSingleEntity(entity, collisionEntity);

	}

};

Roguelike.Components.Movement = function(game, entity, func) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'movement';

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Roguelike.Entity} entity - Reference to the entity that has this component
	 */
	this.entity = entity;

	/**
	 * @property {Function} func - The move functionality that is defined in moveBehaviours.js
	 */
	this.move = func;

};

Roguelike.Components.Movement.prototype = {

	/**
	 * Initialize the game, create all objects
	 * @protected
	 */
	execute: function() {

		//Execute the move behaviour applied to this component
		this.move(this.game, this.entity);

	}

};

Roguelike.Systems.Render = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Object} canvas - Reference to the canvas object everything is drawn on
	 */
	this.canvas = null;

	/**
	 * @property {Object} context - The 2D context of the current canvas object
	 */
	this.context = null;

	/**
	 * @property {Object} mousePos - Object with x and y coordinate of the cursor on the canvas
	 */
	this.mousePos = null;

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

		//Add the mouse move event listener to the canvas to always have the mouse position stored
		this.canvas.addEventListener("mousemove", this.getMousePointer.bind(this));

		//Disable image smoothing with some very ugly browser specific code
		//TODO: Check again in 10 years if there are better solutions to this
		this.context.mozImageSmoothingEnabled = false;
		this.context.webkitImageSmoothingEnabled = false;
		this.context.msImageSmoothingEnabled = false;
		this.context.imageSmoothingEnabled = false;

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

			//Perform the needed operations for this specific system on one entity
			this.handleSingleEntity(entities[i]);

		}

		//Pop the last saved drawing state off of the drawing state stack
		this.context.restore();

		//Draw the lightmap
		this.drawLightMap();

		//Draw the UI
		this.drawUI();

	},

	/**
	 * Performs the needed operations for this specific system on one entity
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is being processed by this system
	 */
	handleSingleEntity: function(entity) {

		//Define variables
		var map = this.game.map;
		var camera = this.game.camera;

		//Get the components from the current entity and store them temporarily in a variable
		var renderComponent = entity.getComponent("sprite");
		var positionComponent = entity.getComponent("position");

		//TODO: Use a preloader and only get the file once, not every frame T__T
		var img = document.getElementById(renderComponent.sprite);

		//Draw the sprite of this entity on the canvas
		this.context.drawImage(
			img,
			renderComponent.tile * 16,
			renderComponent.row * 16,
			16,
			16,
			(positionComponent.position.x * map.settings.tileSize) - camera.position.x,
			(positionComponent.position.y * map.settings.tileSize) - camera.position.y,
			map.settings.tileSize,
			map.settings.tileSize
		);

		//If the entity has health, draw a healthbar
		if(entity.hasComponent("health")) {

			//Get the components
			var healthComponent = entity.getComponent("health");

			if(healthComponent.isDamaged()) {

				this.context.fillStyle = "red";

				//Create the object ( just a rectangle for now )!
				this.context.fillRect(
					(positionComponent.position.x * this.game.map.settings.tileSize) - this.game.camera.position.x,
					(positionComponent.position.y * this.game.map.settings.tileSize) - this.game.camera.position.y,
					this.game.map.settings.tileSize * healthComponent.percentage(),
					5
				);


			}

		}
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
		for(var x = 0; x < map.settings.tilesX; x++) {

			//Loop through every vertical row
			for(var y = 0; y < map.settings.tilesY; y++) {

				//Get the type of the current tile
				var tileRow = map.tiles[x][y].tileRow;
				var tileNumber = map.tiles[x][y].tileNumber;

				this.context.drawImage(
					tileSet,
					tileNumber * 16,
					tileRow * 16,
					16,
					16,
					(x * map.settings.tileSize) - Math.round(camera.position.x),
					(y * map.settings.tileSize) - Math.round(camera.position.y),
					map.settings.tileSize,
					map.settings.tileSize
				);

			}

		}

		//Pop the last saved drawing state off of the drawing state stack
		this.context.restore();

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
		for(var x = 0; x < map.settings.tilesX; x++) {

			//Loop through every vertical row
			for(var y = 0; y < map.settings.tilesY; y++) {

				//Draw the lightmap
				if(map.tiles[x][y].explored === true && 1 - map.tiles[x][y].lightLevel > 0.7) {

					this.context.fillStyle = "rgba(0, 0, 0, 0.7)";

				}else{

					this.context.fillStyle = "rgba(0, 0, 0, " + (1 - map.tiles[x][y].lightLevel) + ")";

				}

				//Create a rectangle!
				this.context.fillRect(
					//Get the current position of the tile, and check where it is in the camera's viewport
					(x * map.settings.tileSize) - Math.round(camera.position.x),
					(y * map.settings.tileSize) - Math.round(camera.position.y),
					map.settings.tileSize,
					map.settings.tileSize
				);

			}

		}

		//Pop the last saved drawing state off of the drawing state stack
		this.context.restore();

	},

	/**
	 * Draw the UI on top of everything
	 * @protected
	 */
	drawUI: function() {

		//Define variables
		var map = this.game.map;
		var camera = this.game.camera;

		//TODO: Use a preloader and only get the file once, not every frame T__T
		var img = document.getElementById("ui");

		//If the mouse position isn't set, stop right here
		if(this.mousePos === null){
			return;
		}

		//Calculate the offset of the camera, how many pixels are left at the left and top of the screen
		var cameraXOffset = camera.position.x % map.settings.tileSize;
		var cameraYOffset = camera.position.y % map.settings.tileSize;

		//Calculate at which tile the mouse is currently pointing relative to the camera
		var tileXRel = Math.floor((this.mousePos.x + cameraXOffset) / map.settings.tileSize);
		var tileYRel = Math.floor((this.mousePos.y + cameraYOffset) / map.settings.tileSize);

		//Calculate at which tile the mouse is currently pointing absolute to the camera
		var tileXAbs = Math.floor((this.mousePos.x + camera.position.x) / map.settings.tileSize);
		var tileYAbs = Math.floor((this.mousePos.y + camera.position.y) / map.settings.tileSize);

		//Create a new Vector2 object of the tile's position
		var tilePosition = new Roguelike.Vector2(tileXAbs, tileYAbs);

		//If the tile that the mouse is pointing at is not within the map, quit here
		if(!map.insideBounds(tilePosition)){
			return;
		}

		//Get the tile at the mouse position
		var tile = map.getTileAt(tilePosition);

		//If the tile isn't a floor tile, you can't walk there so why bother showing the mouse pointer
		//Also don't show the mouse pointer if you haven't explored the tile yet
		if(tile.type !== 2 || !tile.explored){
			return;
		}

		//Draw the sprite of the mouse pointer on the canvas
		this.context.drawImage(
			img,
			0,
			0,
			16,
			16,
			tileXRel * map.settings.tileSize - cameraXOffset,
			tileYRel * map.settings.tileSize - cameraYOffset,
			map.settings.tileSize,
			map.settings.tileSize
		);

		//Check if there are entities at the tile
		if(tile.entities.length === 0){
			return;
		}

		//Get the lats entity
		var lastEntity = tile.entities[tile.entities.length - 1];

		if(lastEntity.hasComponent("tooltip")){

			//Get the components
			var tooltipComponent = lastEntity.getComponent("tooltip");

			//Determine what the lineHeight is
			var lineHeight = (tooltipComponent.fontSize + 5);

			//Draw a rectangle underneath the text
			this.context.fillStyle = "rgba(0, 0, 0, 0.7)";

			//Create a rectangle!
			this.context.fillRect(
				//Get the current position of the tile, and check where it is in the camera's viewport
				this.mousePos.x + 5,
				this.mousePos.y + 10,
				tooltipComponent.maxWidth + 20,
				lineHeight * (tooltipComponent.title.length + tooltipComponent.type.length + tooltipComponent.description.length) + 20
			);

			//Start by drawing on line number 0, this value will get incremented every new line
			var currentPos = 0;

			//Draw the tooltips title
			for(var t = 0; t < tooltipComponent.title.length; t++){

				this.context.font = "bold "+tooltipComponent.fontSize + "px "+tooltipComponent.font;
				this.context.fillStyle = "rgba(255, 255, 255, 1)";

				//Draw the title on screen
				this.context.fillText(
					tooltipComponent.title[t],
					this.mousePos.x + 15,
					this.mousePos.y + 15 + lineHeight + (lineHeight * currentPos)
				);

				//Continue drawing on the next line
				currentPos++;

			}

			//Draw the tooltips type
			for(var y = 0; y < tooltipComponent.type.length; y++){

				this.context.font = tooltipComponent.fontSize + "px "+tooltipComponent.font;
				this.context.fillStyle = "rgba(255, 255, 200, 1)";

				//Draw the title on screen
				this.context.fillText(
					tooltipComponent.type[y],
					this.mousePos.x + 15,
					this.mousePos.y + 15 + lineHeight + (lineHeight * currentPos)
				);

				//Continue drawing on the next line
				currentPos++;

			}

			//Draw the tooltips description
			for(var i = 0; i < tooltipComponent.description.length; i++){

				//Set the current fontsize to the context of the canvas
				this.context.font = tooltipComponent.fontSize + "px "+tooltipComponent.font;
				this.context.fillStyle = "rgba(180, 180, 180, 1)";

				//Draw the description on screen
				this.context.fillText(
					tooltipComponent.description[i],
					this.mousePos.x + 15,
					this.mousePos.y + 15 + lineHeight + (lineHeight * currentPos)
				);

				//Continue drawing on the next line
				currentPos++;

			}


		}

	},

	/**
	 * Get the position of the mouse on the canvas and store it for later use
	 * @protected
	 */
	getMousePointer: function(event) {

		//Get the rectangle from the canvas
		var rect = this.canvas.getBoundingClientRect();

		//Calculate the mouse position
		this.mousePos = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};

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
	 * Performs the needed operations for this specific system on one entity
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is being processed by this system
	 */
	handleSingleEntity: function(entity) {

		//Get the components from the current entity and store them temporarily in a variable
		var canOpenComponent = entity.getComponent("canOpen");
		var spriteComponent = entity.getComponent("sprite");
		var positionComponent = entity.getComponent("position");
		var collideComponent = entity.getComponent("collide");
		var tooltipComponent = entity.getComponent("tooltip");

		//Action to open the door
		if(canOpenComponent.state !== "open") {

			//Change the door's state to open
			canOpenComponent.state = "open";

			//Change the sprite to open
			spriteComponent.tile += 1;

			//Make sure the collide component doesn't say it collides anymore
			collideComponent.collide = false;

			tooltipComponent.type = ["Open"];

			//Make sure the tile that this openable entity is on doesn't block light anymore
			this.game.map.tiles[positionComponent.position.x][positionComponent.position.y].blockLight = false;

		}

	}

};

Roguelike.Systems.LightMap = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Object} mapSize - The size of the current map
	 */
	this.mapSize = {x: game.map.settings.tilesX, y: game.map.settings.tilesY};

	/**
	 * @property {Object} tiles - Object that is being used to store tile data before returning it
	 */
	this.tiles = [];

	/**
	 * @property {Array} mult - Multipliers for transforming coordinates into other octants
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
	 * Function that gets called when the game continues one tick
	 * @protected
	 */
	update: function() {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("lightSource", "position");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++) {

			//Perform the needed operations for this specific system on one entity
			this.handleSingleEntity(entities[i]);

		}

	},

	/**
	 * Performs the needed operations for this specific system on one entity
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is being processed by this system
	 */
	handleSingleEntity: function(entity) {

		//Get the keyboardControl component
		var lightSourceComponent = entity.getComponent("lightSource");
		var positionComponent = entity.getComponent("position");

		//Update the lightsource
		var newLight = this.clear().concat(this.calculate(lightSourceComponent, positionComponent.position));

		//Update the tiles on the map with the new light levels
		for(var l = 0; l < newLight.length; l++) {

			this.game.map.tiles[newLight[l].x][newLight[l].y].lightLevel = newLight[l].lightLevel;
			this.game.map.tiles[newLight[l].x][newLight[l].y].explored = true;

		}

	},

	/**
	 * Function that checks if a tile blocks light or not
	 * @protected
	 *
	 * @param {Number} x - The X position of the tile
	 * @param {Number} y - The Y position of the tile
	 *
	 * @return {Boolean} True when the tile does block light, false when the tile doesn't block light
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
	 *
	 * @return {Array} An empty array
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
	 *
	 * @return {Array} An array containing all tiles
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
	 * Performs the needed operations for this specific system on one entity
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is being processed by this system
	 * @param {Object} newPosition - The new x or y coordinates the entity is trying to move to
	 */
	handleSingleEntity: function(entity, newPosition) {

		//Get components
		var positionComponent = entity.getComponent("position");

		//Check if the new position is correct
		if(this.canMove(entity, newPosition)) {

			//Get the tile to which the entity is trying to move
			var currentTile = this.game.map.tiles[positionComponent.position.x][positionComponent.position.y];
			var nextTile = this.game.map.tiles[newPosition.x][newPosition.y];

			//Remove the entity from the tile it's currently on
			currentTile.removeEntity(entity);

			//And add him to the next tile that he is going to be on
			nextTile.addEntity(entity);

			//Pop the new position from the "stack"
			positionComponent.position = newPosition;

		}

	},

	/**
	 * Function that gets called when an entity wants to move
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is being checked against the map
	 * @param {Object} newPosition - The new position the entity is trying to move to
	 *
	 * @return {Boolean} True when an entity can move to the new position, false when the entity is obstructed
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

			//Define variables
			var canContinue = true;

			//Loop through the entities
			for(var i = 0; i < nextTile.entities.length; i++) {

				//Check if the entity has a collide component
				if(nextTile.entities[i].hasComponent("collide")) {

					//Get the collide component
					var collideComponent = nextTile.entities[i].getComponent("collide");

					//If collide is true, it means we can't walk to the next tile
					if(collideComponent.collide === true) {

						canContinue = false;

					}

				}

				//Loop through the components
				for(var key in nextTile.entities[i].components) {

					//Check if the entity still exists
					if(typeof nextTile.entities[i] === "undefined"){

						//The entity could have died in a previous bumpInto event
						//Thus we should abort the loop of the entity no longer exists
						break;

					}

					//Check if the component has an events parameter
					if(typeof nextTile.entities[i].components[key].events !== "undefined") {

						//Trigger the specified event
						nextTile.entities[i].components[key].events.trigger("bumpInto", entity, nextTile.entities[i]);

					}

				}

			}

			//If there was even one entity that we couldn't collide with on the next tile
			//this will return false
			return canContinue;

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

};

Roguelike.Systems.Combat.prototype = {

	/**
	 * Performs the needed operations for this specific system on one entity
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is being processed by this system
	 * @param {Roguelike.Entity} enemyEntity - The entity that is being attacked
	 */
	handleSingleEntity: function(entity, enemyEntity) {

		//Get the components from the current entity and store them temporarily in a variable
		var weaponComponent = entity.getComponent("weapon");

		//Check if the enemy even has a health component before we try to hit it
		if(enemyEntity.hasComponent("health")) {

			//Get the current entities components
			var healthComponent = enemyEntity.getComponent("health");

			//The weapon of the current entity should damage to the current enemy
			healthComponent.takeDamage(weaponComponent.damage);

			//If the enemy is dead, we have to remove him from the game
			if(healthComponent.isDead()) {

				//Add the current enemy to the remove stack, this way the loop doesn't get interrupted
				this.removeEntity(enemyEntity);

			}

		}

	},

	/**
	 * Remove a dead entity
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is dead
	 */
	removeEntity: function(entity) {

		//TODO: Don't make the player invincible
		if(entity.hasComponent("keyboardControl")) {

			return;

		}

		//Remove the entity from the map's list
		this.game.map.entities.removeEntity(entity);

		//Remove the entity from the scheduler
		this.game.scheduler.remove(entity);

		//Get the components of this entity
		var positionComponent = entity.getComponent("position");

		//Get the tile that the entity ws standing on
		var currentTile = this.game.map.tiles[positionComponent.position.x][positionComponent.position.y];

		//Remove the entity from the tile it was standing on
		currentTile.removeEntity(entity);

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
		//TODO: Enable diagonal movement and make sure the player can also move diagonal
		this.easystar.disableDiagonals();


	},

	/**
	 * Performs the needed operations for this specific system on one entity
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is being processed by this system
	 * @param {Array} acceptableTiles - The entity is able to walk on the tiles in this array
	 */
	handleSingleEntity: function(entity, acceptableTiles) {

		//Set the acceptable tiles to walk on
		this.easystar.setAcceptableTiles(acceptableTiles);

		//Get the components from the current entity and store them temporarily in a variable
		var positionComponent = entity.getComponent("position");

		//TODO: Make this dynamic, not every enemy should chase the player
		var behaviour = "attack";

		//Check the behaviour of the entity
		switch(behaviour) {

			case("attack"):

				//Get the player
				var player = this.game.player;
				var playerPositionComponent = player.getComponent("position");

				//Initialize variables
				var _this = this;

				//Tile at position
				var tileAtPos = this.game.map.getTileAt(positionComponent.position);

				//If the entity is in the visible area of the player, it should act
				if(tileAtPos.lightLevel > 0.7) {

					//Let EasyStar calculate a path towards the player find a path
					this.easystar.findPath(positionComponent.position.x, positionComponent.position.y, playerPositionComponent.position.x, playerPositionComponent.position.y, function(path) {

						//TODO: Make sure enemies don't kill eachother, they have to find another route or collaborate
						if(path === null || path.length === 0) {

							console.log("no path found");

						}else{

							//Create a new Vector2 object of the new position
							var newPosition = new Roguelike.Vector2(path[1].x, path[1].y);

							//Tell the movement system that you want to move to the new position
							_this.game.staticSystems.movementSystem.handleSingleEntity(entity, newPosition);

						}

					});

					//Calculate the path
					this.easystar.calculate();


				}

				break;

		}

	}

};


Roguelike.moveBehaviours = {

	/**
	 * Function that returns a new walk behaviour
	 * @public
	 *
	 * @return {Function} A function used in the strategy pattern
	 */
	walkBehaviour: function() {

		return function(game, entity) {

			//Array with all the acceptable/walkable tiles for this move behaviour
			var acceptableTiles = [2];

			//Make a call to the pathfinding system
			game.staticSystems.pathfindingSystem.handleSingleEntity(entity, acceptableTiles);

		};

	},

	/**
	 * Function that returns a new fly behaviour
	 * @public
	 *
	 * @return {Function} A function used in the strategy pattern
	 */
	flyBehaviour: function() {

		return function(game, entity) {

			//Array with all the acceptable/walkable tiles for this move behaviour
			var acceptableTiles = [2];

			//Make a call to the pathfinding system
			game.staticSystems.pathfindingSystem.handleSingleEntity(entity, acceptableTiles);

		};

	}

};

Roguelike.PlayerFactory = {

	/**
	 * Function that returns a new warrior
	 * @public
	 *
	 * @param {Roguelike.Game} game - Reference to the currently running game
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 * @param {Object} controls - Associative array with every control this entity uses
	 *
	 * @return {Roguelike.Entity} A player entity
	 */
	newPlayerWarrior: function(game, position, controls) {

		//Create the entity
		var entity = new Roguelike.Entity(game, 1000);

		//Give the player a health of 100 points
		entity.addComponent(new Roguelike.Components.Health(100));

		//The starting position of the player is at the dungeon's entrance
		entity.addComponent(new Roguelike.Components.Position(position));

		//The player has a sprite
		entity.addComponent(new Roguelike.Components.Sprite("entities", 0, 0));

		//The player must be controllable by the keyboards arrow keys
		entity.addComponent(new Roguelike.Components.KeyboardControl(
			game,
			entity,
			controls
		));

		//Add a lightsource to the player
		entity.addComponent(new Roguelike.Components.LightSource(true, 6));

		//You can collide with this entity
		entity.addComponent(new Roguelike.Components.Collide(true));

		//The entity has a weapon
		//TODO: Change this to a loadout. Something that says: Hey you are wearing this and this and this
		entity.addComponent(new Roguelike.Components.Weapon(7));

		//This entity is capable of fighting
		entity.addComponent(new Roguelike.Components.CanFight(game));

		//Add a tooltip to this entity
		entity.addComponent(new Roguelike.Components.Tooltip(game.settings.canvas, "Player", "", ""));

		//Return the entity
		return entity;

	}

};

Roguelike.EnemyFactory = {

	/**
	 * Function that returns a new spider entity
	 * @public
	 *
	 * @param {Roguelike.Game} game - Reference to the currently running game
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 *
	 * @return {Roguelike.Entity} An enemy entity
	 */
	newSpider: function(game, position) {

		//Create the entity
		var entity = new Roguelike.Entity(game, 2000);

		//Give the entity a health of 100 points
		entity.addComponent(new Roguelike.Components.Health(20));

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position));

		//The entity has a sprite
		entity.addComponent(new Roguelike.Components.Sprite("entities", 1, 2));

		//You can collide with this entity
		entity.addComponent(new Roguelike.Components.Collide(true));

		//Add a certain move behaviour to this entity
		entity.addComponent(new Roguelike.Components.Movement(
			game,
			entity,
			Roguelike.moveBehaviours.walkBehaviour()
		));

		//The entity has a weapon
		//TODO: Change this to a loadout. Something that says: Hey you are wearing this and this and this
		entity.addComponent(new Roguelike.Components.Weapon(4));

		//This entity is capable of fighting
		entity.addComponent(new Roguelike.Components.CanFight(game));

		//Add a tooltip to this entity
		entity.addComponent(new Roguelike.Components.Tooltip(game.settings.canvas, "Quick Spider", "Arachnid Enemy", "The quick spider is twice as fast as you and will definitely attack you. It's just programmed to do so."));

		//Return the entity
		return entity;

	},

	/**
	 * Function that returns a new skeleton entity
	 * @public
	 *
	 * @param {Roguelike.Game} game - Reference to the currently running game
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 *
	 * @return {Roguelike.Entity} An enemy entity
	 */
	newSkeleton: function(game, position) {

		//Create the entity
		var entity = new Roguelike.Entity(game, 1000);

		//Give the entity a health of 100 points
		entity.addComponent(new Roguelike.Components.Health(50));

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position));

		//The entity has a sprite
		entity.addComponent(new Roguelike.Components.Sprite("entities", 2, 0));

		//You can collide with this entity
		entity.addComponent(new Roguelike.Components.Collide(true));

		//Add a certain move behaviour to this entity
		entity.addComponent(new Roguelike.Components.Movement(
			game,
			entity,
			Roguelike.moveBehaviours.walkBehaviour()
		));

		//The entity has a weapon
		//TODO: Change this to a loadout. Something that says: Hey you are wearing this and this and this
		entity.addComponent(new Roguelike.Components.Weapon(10));

		//This entity is capable of fighting
		entity.addComponent(new Roguelike.Components.CanFight(game));

		//Add a tooltip to this entity
		entity.addComponent(new Roguelike.Components.Tooltip(game.settings.canvas, "Skeleton", "Undead Enemy", "The skeleton is a very dangerous but unstable enemy. If you stab just right his bones will collapse."));

		//Return the entity
		return entity;

	}

};

Roguelike.PropFactory = {

	/**
	 * Function that returns a new entrance to the map
	 * @public
	 *
	 * @param {Roguelike.Game} game - Reference to the currently running game
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 *
	 * @return {Roguelike.Entity} An prop entity
	 */
	newEntrance: function(game, position) {

		//Create the entity
		var entity = new Roguelike.Entity(game);

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position));

		//The entity has a sprite ( color for now )
		entity.addComponent(new Roguelike.Components.Sprite("tileset", 3, 1));

		//Return the entity
		return entity;

	},

	/**
	 * Function that returns a new exit to the map
	 * @public
	 *
	 * @param {Roguelike.Game} game - Reference to the currently running game
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 *
	 * @return {Roguelike.Entity} An prop entity
	 */
	newExit: function(game, position) {

		//Create the entity
		var entity = new Roguelike.Entity(game);

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position));

		//The entity has a sprite ( color for now )
		entity.addComponent(new Roguelike.Components.Sprite("tileset", 3, 0));

		//Return the entity
		return entity;

	},

	/**
	 * Function that returns a new door
	 * @public
	 *
	 * @param {Roguelike.Game} game - Reference to the currently running game
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 *
	 * @return {Roguelike.Entity} An prop entity
	 */
	newDoor: function(game, position) {

		//Create the entity
		var entity = new Roguelike.Entity(game);

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position));

		//The entity has a sprite ( color for now )
		entity.addComponent(new Roguelike.Components.Sprite("tileset", 1, 0));

		//This entity can be opened up by another entity
		entity.addComponent(new Roguelike.Components.CanOpen(game, entity));

		//You can collide with this entity
		entity.addComponent(new Roguelike.Components.Collide(true));

		//Add a tooltip to this entity
		entity.addComponent(new Roguelike.Components.Tooltip(game.settings.canvas, "Wooden Door", "Closed", ""));

		//Return the entity
		return entity;

	}

};

Roguelike.DecorationFactory = {

	/**
	 * Function that returns a grass object
	 * @public
	 *
	 * @param {Roguelike.Game} game - Reference to the currently running game
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 *
	 * @return {Roguelike.Entity} A decoration entity
	 */
	newGrass: function(game, position) {

		//Create the entity
		var entity = new Roguelike.Entity(game);

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
	 * @property {Object} events - An object with all the current events
	 */
	this.events = {};

};

Roguelike.Event.prototype = {

	/**
	 * Function that handles keydown events
	 * @protected
	 *
	 * @param {Object} event - The event object
	 * @param {Function} callback - The function that has to be performed as a callback
	 * @param {Object} context - The object that should be accessible when the event is called
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
	 * @param {Object} event - The event object
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

Roguelike.Keyboard = function() {

	/**
	 * @property {Object} keys - Object that holds all keys
	 */
	this.keys = {};

	//Initialize itself
	this.initialize();

};

Roguelike.Keyboard.prototype = {

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
	 * @return {Roguelike.Key} The Roguelike.Key object
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

Roguelike.Queue = function() {

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

Roguelike.Queue.prototype = {

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
	 * @param {Roguelike.Entity} event - The event that is being added to the queue
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
	 * @return {Roguelike.Entity} The next entity from the queue
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
	 * @param {Roguelike.Entity} event - The event that is being added to the queue
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

Roguelike.Scheduler = function() {

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

Roguelike.Scheduler.prototype = {

	/**
	 * Initialize the game, create all objects
	 * @protected
	 */
	initialize: function() {

		//Create a new Roguelike.Queue object
		this.queue = new Roguelike.Queue();

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
	 * @param {Roguelike.Entity} entity - The entity being added
	 * @param {Boolean} repeat - Is this a recurring thing
	 *
	 * @return {Roguelike.Scheduler} The current Roguelike.Scheduler object
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
	 * @param {Roguelike.Entity} entity - The entity being removed
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
	 * @return {Roguelike.Scheduler} The cleared Roguelike.Scheduler object
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
	 * @return {Roguelike.Entity} The next Roguelike.Entity from the queue
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

Roguelike.Tile = function(type, blockLight, room, tileRow, tileNumber) {

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
	 * @property {Roguelike.Room} belongsTo - The room that this tile belongs to
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

Roguelike.Tile.prototype = {

	/**
	 * Function that adds an entity to a tile
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity being removed from a tile
	 */
	addEntity: function(entity) {

		//Aad the entity to the list
		this.entities.push(entity);

	},

	/**
	 * Function that removes an entity from a tile
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity being removed from a tile
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
	 * @property {Roguelike.Vector2} entrance - An object that holds the position of the entrance of this map
	 */
	this.entrance = null;

	/**
	 * @property {Roguelike.Vector2} exit - An object that holds the position of the exit of this map
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

Roguelike.Map.prototype = {

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
				this.tiles[x][y] = new Roguelike.Tile(0, true, 0, 0);

			}

		}

	},

	/**
	 * Function to get a tile at a position
	 * @protected
	 *
	 * @param {Roguelike.Vector2} position - The position that is being requested
	 *
	 * @return {Roguelike.Tile} The tile object that has been found, empty object otherwise
	 */
	getTileAt: function(position){

		//Try to get the tile object from the map
		var tile = this.tiles[position.x][position.y];

		//Check if the tile object is something, else return an empty tile object
		if(tile){

			return tile;

		}else{

			return new Roguelike.Tile();

		}

	},

	/**
	 * Function to check if one position is inside the maps boundary
	 * @protected
	 *
	 * @param {Roguelike.Vector2} position - The position that is being requested
	 *
	 * @return {Boolean} Returns true if the position is within this map, returns false if it isn't
	 */
	insideBounds: function(position){

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
	 * @param {Roguelike.Room} room - The room object that has to be checked
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

Roguelike.MapFactory = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Roguelike.Map} map - Reference to the current map
	 */
	this.map = game.map;

	/**
	 * @property {Array} possibleDoorLocations - Stores all the positions of possible door locations
	 */
	this.possibleDoorLocations = [];

};

Roguelike.MapFactory.prototype = {

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
			if(tries >= maxTries){
				break;
			}

			//Set all the available directions once
			var directions = ["left", "right", "up", "down"];

			//Get the previous room
			switch (type){

				//Generate a path of rooms, this means we have to generate a room from the previous room
				case("path"):

					var prevRoom = this.map.roomsToExit[this.map.roomsToExit.length - 1];

					break;

				//Extend the already existing path with new rooms
				case("random"):

					var index = Roguelike.Utils.randomNumber(0, this.map.allRooms.length - 1);
					var prevRoom = this.map.allRooms[index];

					break;

				//Extend the already existing path of medium rooms with rooms
				case("randomMedium"):

					//Get another random room
					var index = Roguelike.Utils.randomNumber(0, this.map.mediumRooms.length - 1);
					var prevRoom = this.map.mediumRooms[index];

					break;

			}

			//Continue until we break the loop ourselves
			while(true){

				//If there aren't any directions left to try, we fill the directions
				//array again, but we also go back one room and search again from that room
				if(directions.length === 0){

					//We tried to generate a room in every possible direction
					//This failed and we are now going back one room
					//This process is only allowed "maxTries" times
					tries++;

					//If we are already at the maximum amount of tries, break the loop
					if(tries >= maxTries){
						break;
					}

					//Set all the available directions once
					directions = ["left", "right", "up", "down"];

					//Get the previous room
					switch (type){

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
							index = Roguelike.Utils.randomNumber(0, this.map.allRooms.length - 1);
							prevRoom = this.map.allRooms[index];

							break;

						//Extend the already existing path of medium rooms with rooms
						case("randomMedium"):

							//Get another random room
							index = Roguelike.Utils.randomNumber(0, this.map.mediumRooms.length - 1);
							prevRoom = this.map.mediumRooms[index];

							break;

					}

				}

				//Pick a random side of the previous room
				var side = Roguelike.Utils.randomNumber(0, directions.length - 1);
				var direction = directions[side];

				//Maximum number of tries before stopping the placement of more rooms
				var maxDirectionTries = 5;
				var directionTries = 0;

				//Create a room next to the previous room
				var newRoom = this.generateRoomNextTo(prevRoom, direction);

				//We try to place a new room for a certain amount of times in the current direction
				while(!this.map.roomFits(newRoom)){

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
				if(this.map.roomFits(newRoom)){

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
	 * Create a new Roguelike.Room object next to the supplied previous room
	 * @protected
	 *
	 * @param {Roguelike.Room} prevRoom - The previous room
	 * @param {String} direction - The direction of expanding the dungeon as seen from a room
	 *
	 * @return {Roguelike.Room} A new Roguelike.Room object
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
				heigth = Roguelike.Utils.randomNumber(
					this.map.settings.minRoomHeight,
					this.map.settings.maxRoomHeight
				);

				//Calculate the horizontal and vertical position
				xPos = prevRoom.x1 + Roguelike.Utils.randomNumber(-2, 3);
				yPos = prevRoom.y1 - heigth - this.map.settings.roomSpacing;

				break;

			case ("down"):

				//Calculate the horizontal and vertical position
				xPos = prevRoom.x1 + Roguelike.Utils.randomNumber(-2, 3);
				yPos = prevRoom.y2 + this.map.settings.roomSpacing;

				break;

			case ("left"):

				//Calculate a random width, we need this value here to determine the horizontal position of the room
				width = Roguelike.Utils.randomNumber(
					this.map.settings.minRoomWidth,
					this.map.settings.maxRoomWidth
				);

				//Calculate the horizontal and vertical position
				xPos = prevRoom.x1 - width - this.map.settings.roomSpacing;
				yPos = prevRoom.y1 + Roguelike.Utils.randomNumber(-2, 3);

				break;

			case ("right"):

				//Calculate the horizontal and vertical position
				xPos = prevRoom.x2 + this.map.settings.roomSpacing;
				yPos = prevRoom.y1 + Roguelike.Utils.randomNumber(-2, 3);

				break;

		}

		//Return the newly generated room
		return this.newRoom(width, heigth, xPos, yPos);

	},

	/**
	 * Create a new Roguelike.Room object
	 * @protected
	 *
	 * @param {int} width - Optional width of the new room
	 * @param {int} height - Optional height of the new room
	 * @param {int} xPos - Optional horizontal position of the new room
	 * @param {int} yPos - Optional vertical position of the new room
	 *
	 * @return {Roguelike.Room} A new Roguelike.Room object
	 */
	newRoom: function(width, height, xPos, yPos) {

		//We are using shorthand method instead of || because the optional values might
		//be passed but evaluate as false

		//Generate random values ( in tiles )
		//Start with generating a random width
		var w = (typeof width === "undefined") ? Roguelike.Utils.randomNumber(
			this.game.map.settings.minRoomWidth,
			this.game.map.settings.maxRoomWidth
		) : width;

		//Generate a random height for the room
		var h = (typeof height === "undefined") ? Roguelike.Utils.randomNumber(
			this.game.map.settings.minRoomHeight,
			this.game.map.settings.maxRoomHeight
		) : height;

		//Generate a random horizontal position for this room
		var x = (typeof xPos === "undefined") ? Roguelike.Utils.randomNumber(
			1,
			this.game.map.settings.tilesX - w - 1
		) : xPos;

		//Generate a random vertical position for the room
		var y = (typeof yPos === "undefined") ? Roguelike.Utils.randomNumber(
			1,
			this.game.map.settings.tilesY - h - 1
		) : yPos;

		//Create a new room with these values and return it
		return new Roguelike.Room(x, y, w, h);

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
				for(var i = secondExit.x; i <= firstExit.x; i++) {
					this.generateHorizontalCorridor(i, secondExit.y);
				}

			}

		}

		//Check if we even need to generate a vertical corridor, or if we are on the same coordinate
		if(secondExit.y !== firstExit.y) {

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
	 * Changes a tile to a floor
	 * @protected
	 *
	 * @param {Roguelike.Tile} tile - The tile that is being changed
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
	 *
	 * @param {Roguelike.Tile} tile - The tile that is being changed
	 */
	changeTileToWall: function(tile) {

		tile.type = 1;
		tile.tileRow = 0;
		tile.tileNumber = Roguelike.Utils.randomNumber(1, 2);
		tile.blockLight = true;

	}

};

Roguelike.MapDecorator = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

};

Roguelike.MapDecorator.prototype = {

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
	 * @protected
	 */
	setTileNumbers: function() {

		var map = this.game.map;

		//Loop through every horizontal row
		for(var x = 0; x < map.settings.tilesX; x++) {

			//Loop through every vertical row
			for(var y = 0; y < map.settings.tilesY; y++) {

				if(map.tiles[x][y].type === 1) {

					//Get the tile at the location of the possible door location
					//TODO: Write a function somewhere that returns the surrounding tiles
					var tileLeft = this.game.map.tiles[x - 1][y];
					var tileRight = this.game.map.tiles[x + 1][y];
					var tileDown = this.game.map.tiles[x][y + 1];
					var tileUp = this.game.map.tiles[x][y - 1];

					//TODO: Maybe use a more elegant autotiling solution for this
					//Check left type void, right type floor || Check left type void, right type wall, up type void || tileLeft is wall, tileUp is wall and tileDown is wall
					if(tileLeft.type === 0 && tileRight.type === 2 || tileLeft.type === 0 && tileRight.type === 1 && tileUp.type === 0 || tileLeft.type === 1 && tileUp.type === 1 && tileDown.type === 1 || tileLeft.type === 1 && tileRight.type === 1 && tileUp.type === 0 && tileDown.type === 1) {

						map.tiles[x][y].tileNumber = 3;

						//Check right type void, left type floor || Check right type void, left type wall, up type void
					}else if(tileRight.type === 0 && tileLeft.type === 2 || tileRight.type === 0 && tileLeft.type === 1 && tileUp.type === 0 || tileRight.type === 1 && tileUp.type === 1 && tileDown.type === 1 || tileRight.type === 1 && tileLeft.type === 1 && tileUp.type === 1 && tileDown.type === 0) {

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
							this.game,
							new Roguelike.Vector2(x, y)
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
	placeEntrance: function(){

		//Let the first room return a random position
		var entrancePosition = this.game.map.roomsToExit[0].getRandomPosition();

		//Get a new instance of a map entrance
		var entranceEntity = Roguelike.PropFactory.newEntrance(this.game, entrancePosition);

		//Add the entity to the map
		this.game.map.entities.addEntity(entranceEntity);

		//Tell the map where the player should enter the map
		this.game.map.entrance = entrancePosition;

	},

	/**
	 * Get the last room on the roomsToExit list and turns it into the exit room
	 * @protected
	 */
	placeExit: function(){

		//Let the last room return a random position
		var exitPosition = this.game.map.roomsToExit[this.game.map.roomsToExit.length - 1].getRandomPosition();

		//Get a new instance of a map exit
		var exitEntity = Roguelike.PropFactory.newExit(this.game, exitPosition);

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
			var tileLeft = this.game.map.tiles[doorLocation.x - 1][doorLocation.y];
			var tileRight = this.game.map.tiles[doorLocation.x + 1][doorLocation.y];
			var tileUp = this.game.map.tiles[doorLocation.x][doorLocation.y - 1];
			var tileDown = this.game.map.tiles[doorLocation.x][doorLocation.y + 1];

			var randomNumber = Roguelike.Utils.randomNumber(0, 100);

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
		var doorEntity = Roguelike.PropFactory.newDoor(this.game, position);

		if(orientation === true) {
			doorEntity.components.sprite.number = 0;
			doorEntity.components.sprite.row = 2;
		}

		//Add the entity to the map
		this.game.map.entities.addEntity(doorEntity);

		//Add the door entity to the entities list on the current tile
		tileAtPosition.addEntity(doorEntity);

		//A door blocks light!
		tileAtPosition.blockLight = true;

	},

	populateDungeon: function(){

		for(var i = 0; i < this.game.map.mediumRooms.length; i++){

			var room = this.game.map.mediumRooms[i];

			//Loop through every horizontal row
			for(var x = room.x1; x < room.x2; x++) {

				//Loop through every vertical row
				for(var y = room.y1; y < room.y2; y++) {

					//Don't place wall's over existing floor tiles. This solves the problem that some corridors may get shut of
					if(this.game.map.tiles[x][y].type === 2) {

						//Have a random chance to spawn grass on this tile
						if(Roguelike.Utils.randomNumber(0, 100) >= 90) {

							//Create a new grass entity
							enemyEntity = new Roguelike.EnemyFactory.newSpider(
								this.game,
								new Roguelike.Vector2(x, y)
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

		for(var i = 0; i < this.game.map.hardRooms.length; i++){

			var room = this.game.map.hardRooms[i];

			//Loop through every horizontal row
			for(var x = room.x1; x < room.x2; x++) {

				//Loop through every vertical row
				for(var y = room.y1; y < room.y2; y++) {

					//Don't place wall's over existing floor tiles. This solves the problem that some corridors may get shut of
					if(this.game.map.tiles[x][y].type === 2) {

						//Have a random chance to spawn grass on this tile
						if(Roguelike.Utils.randomNumber(0, 100) >= 90) {

							//Create a new grass entity
							enemyEntity = new Roguelike.EnemyFactory.newSkeleton(
								this.game,
								new Roguelike.Vector2(x, y)
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

	}

};

Roguelike.Room = function(x, y, w, h) {

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
	 *
	 * @return {Roguelike.Vector2} Vector2 object of a random position inside the room
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
}

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
}

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
}

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
}

/* generates a random number on [0,0x7fffffff]-interval */
MersenneTwister.prototype.genrand_int31 = function() {
	return (this.genrand_int32() >>> 1);
}

/* generates a random number on [0,1]-real-interval */
MersenneTwister.prototype.genrand_real1 = function() {
	return this.genrand_int32() * (1.0 / 4294967295.0);
	/* divided by 2^32-1 */
}

/* generates a random number on [0,1)-real-interval */
MersenneTwister.prototype.random = function() {
	return this.genrand_int32() * (1.0 / 4294967296.0);
	/* divided by 2^32 */
}

/* generates a random number on (0,1)-real-interval */
MersenneTwister.prototype.genrand_real3 = function() {
	return (this.genrand_int32() + 0.5) * (1.0 / 4294967296.0);
	/* divided by 2^32 */
}

/* generates a random number on [0,1) with 53-bit resolution*/
MersenneTwister.prototype.genrand_res53 = function() {
	var a = this.genrand_int32() >>> 5, b = this.genrand_int32() >>> 6;
	return(a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
}

/* These real versions are due to Isaku Wada, 2002/01/09 added */

var seed = Math.floor(Math.random() * (500 - 100 + 1) + 100);

console.log(seed);

Roguelike.Utils = {

	mersenneTwister: new MersenneTwister(seed),
	//mersenneTwister: new MersenneTwister(404),

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

	},

	/**
	 * Function to check if an object is in a list
	 * @public
	 *
	 * @param {Object} object - The object to search for
	 * @param {Array} list - The list, aka the array
	 *
	 * @return {Number} Position on success, minus one on failure
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
		return -1;

	}

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
window.addEventListener("load", initializeCanvas);

//Function that get's executed when the page is fully loaded
function initializeCanvas() {

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
	var game = new Roguelike.Game(options);

}
