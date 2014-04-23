/**
 * Control System constructor
 *
 * @class Roguelike.Systems.Control
 * @classdesc The control system is responsible for handling user input
 *
 * @param {Roguelike.Game} game - Reference to the currently running game
 */
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
	 * Function that gets called when the game continues one tick
	 * @protected
	 */
	update: function() {

		//Nothing here, yet..

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
