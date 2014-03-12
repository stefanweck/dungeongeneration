/**
 * Renderer constructor
 *
 * @class Roguelike.Renderer
 * @classdesc An object that handles the rendering of the map onto the canvas
 *
 * @property {Roguelike.Game} game - Reference to the current game object
 */
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

				//Get the corrosponding color of this tile from the array of colors
				this.context.fillStyle = this.tileColors[tileType];

				//Create a rectangle!
				this.context.fillRect(
					//Get the current position of the tile, and check where it is in the camera's viewport
					(x * this.game.map.tileSize) - this.game.camera.position.x,
					(y * this.game.map.tileSize) - this.game.camera.position.y,
					this.game.map.tileSize,
					this.game.map.tileSize
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

				//Create a rectangle!
				this.context.fillRect(
					//Get the current position of the tile, and check where it is in the camera's viewport
					(x * this.game.map.tileSize) - this.game.camera.position.x,
					(y * this.game.map.tileSize) - this.game.camera.position.y,
					this.game.map.tileSize,
					this.game.map.tileSize
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
