/**
 * Render System constructor
 *
 * @class Roguelike.Systems.Render
 * @classdesc The renderer draws entities onto the screen
 *
 * @param {number} game - Reference to the currently running game
 */
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

		//Define variables
		var map = this.game.map;
		var camera = this.game.camera;

		//TODO: Use a preloader and only get the file once, not every frame
		var tileSet = document.getElementById("tileset");

		//Save the context to push a copy of our current drawing state onto our drawing state stack
		this.context.save();

		//Loop through every horizontal row
		for(var y = 0; y < map.tilesY; y++) {

			//Loop through every vertical row
			for(var x = 0; x < map.tilesX; x++) {

				//Get the type of the current tile
				var tileRow = map.tiles[y][x].tileRow;
				var tileNumber = map.tiles[y][x].tileNumber;

				this.context.drawImage(
					tileSet,
					tileNumber * 48,
					tileRow * 48,
					48,
					48,
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

			//The objects color
			//TODO: Start removing this, only use sprites, not colored squares
			if(renderComponent.color !== false){

				//Get the objects color
				this.context.fillStyle = renderComponent.color;

				//Create the object ( just a rectangle for now )!
				this.context.fillRect(
					(positionComponent.x * this.game.map.tileSize) - this.game.camera.position.x,
					(positionComponent.y * this.game.map.tileSize) - this.game.camera.position.y,
					this.game.map.tileSize,
					this.game.map.tileSize
				);

			}else{

				//TODO: Use a preloader and only get the file once, not every frame T__T
				var img = document.getElementById(renderComponent.sprite);

				this.context.drawImage(
					img,
					renderComponent.tile * 48,
					renderComponent.row * 48,
					48,
					48,
					(positionComponent.x * this.game.map.tileSize) - this.game.camera.position.x,
					(positionComponent.y * this.game.map.tileSize) - this.game.camera.position.y,
					this.game.map.tileSize,
					this.game.map.tileSize
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
		for(var y = 0; y < map.tilesY; y++) {

			//Loop through every vertical row
			for(var x = 0; x < map.tilesX; x++) {

				//Draw the lightmap
				if(map.tiles[y][x].explored === true && 1 - map.tiles[y][x].lightLevel > 0.7) {

					this.context.fillStyle = "rgba(0, 0, 0, 0.7)";

				}else{

					this.context.fillStyle = "rgba(0, 0, 0, " + (1 - map.tiles[y][x].lightLevel) + ")";

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
