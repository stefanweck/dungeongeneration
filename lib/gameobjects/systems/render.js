/**
 * Render System constructor
 *
 * @class Roguelike.Systems.Render
 * @classdesc The renderer draws entities onto the screen
 *
 * @param {int} game - Reference to the currently running game
 */
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
	this.canvas = game.settings.canvas;

	/**
	 * @property {object} canvas - The 2D context of the current canvas object
	 */
	this.context = game.settings.canvas.getContext("2d");

};

Roguelike.Systems.Render.prototype = {

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
