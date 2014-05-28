/**
 * KeyboardControl Component constructor
 *
 * @class Roguelike.Components.KeyboardControl
 * @classdesc An component that tells the system that this entity can be controlled with the keyboard
 *
 * @param {Roguelike.Game} game - Reference to the current game object
 * @param {Roguelike.Entity} entity - Reference to the entity that has this component
 * @param {Object} controls - Associative array with every control that this entity uses
 */
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
