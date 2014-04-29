/**
 * CanOpen Component constructor
 *
 * @class Roguelike.Components.CanOpen
 * @classdesc An component that tells the system that this entity can be opened by another entity
 *
 * @param {Roguelike.Game} game - Reference to the current game object
 * @param {Roguelike.Entity} entity - Reference to the entity that has this component
 */
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
