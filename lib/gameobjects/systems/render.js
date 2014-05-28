/**
 * Render System constructor
 *
 * @class Roguelike.Systems.Render
 * @classdesc The renderer draws entities onto the screen
 *
 * @param {Roguelike.Game} game - Reference to the currently running game
 */
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
	 * @property {Object} canvas - The 2D context of the current canvas object
	 */
	this.context = null;

	/**
	 * @property {Array} tileColors - Contains all the default colors for the tiles
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

		//Add the mouse move event listener to the canvas
		this.canvas.addEventListener("mousemove", this.drawMousePointer.bind(this));

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

		//Draw the sprite of this entity on the canvas
		//TODO: Make a less confusing and big calculation
		this.context.drawImage(
			img,
			0,
			0,
			16,
			16,
			Math.floor((this.mousePos.x + camera.position.x % map.settings.tileSize) / map.settings.tileSize) * map.settings.tileSize - camera.position.x % map.settings.tileSize,
			Math.floor((this.mousePos.y - camera.position.x % map.settings.tileSize) / map.settings.tileSize) * map.settings.tileSize + camera.position.x % map.settings.tileSize,
			map.settings.tileSize,
			map.settings.tileSize
		);

	},

	/**
	 * Draw the mouse pointer on the map
	 * @protected
	 */
	drawMousePointer: function(event) {

		//Define variables
		var map = this.game.map;
		var camera = this.game.camera;

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
