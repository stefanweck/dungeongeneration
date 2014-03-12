/**
 * Control System constructor
 *
 * @class Roguelike.Systems.Control
 * @classdesc The health component is responsible for managing the health
 *
 * @param {int} game - Reference to the currently running game
 */
Roguelike.Systems.Control = function(game) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'control';

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	//Reference to the current systme
	var _this = this;

	//Add up key and tell it to move the player up when it hits
	this.upKey = this.game.keyboard.getKey(38);
	var moveUp = function() {
		_this.moveEntities('up');
	};

	//Add up key and tell it to move the player up when it hits
	this.downKey = this.game.keyboard.getKey(40);
	var moveDown = function() {
		_this.moveEntities('down');
	};

	//Add up key and tell it to move the player up when it hits
	this.leftKey = this.game.keyboard.getKey(37);
	var moveLeft = function() {
		_this.moveEntities('left');
	};

	//Add up key and tell it to move the player up when it hits
	this.rightKey = this.game.keyboard.getKey(39);
	var moveRight = function() {
		_this.moveEntities('right');
	};

	//Add the current functionality to the keys and refer to the player object
	this.upKey.onDown.on(38, moveUp, _this);
	this.downKey.onDown.on(40, moveDown, _this);
	this.leftKey.onDown.on(37, moveLeft, _this);
	this.rightKey.onDown.on(39, moveRight, _this);

};

Roguelike.Systems.Control.prototype = {

	/**
	 * Function that gets called when the game continues one tick
	 * @protected
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
	 */
	moveEntity: function(direction, entity) {

		var entityPosition = entity.getComponent("position");

		//Check which controls are being pressed and update the player accordingly
		if(direction === 'left') {
			entityPosition.x -= 1;
		}else if(direction === 'up') {
			entityPosition.y -= 1;
		}else if(direction === 'right') {
			entityPosition.x += 1;
		}else if(direction === 'down') {
			entityPosition.y += 1;
		}

	}

};

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
