/**
 * CanFight Component constructor
 *
 * @class Roguelike.Components.CanFight
 * @classdesc An component that tells the system that this entity can fight!
 *
 * @property {Roguelike.Game} game - Reference to the current game object
 */
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
