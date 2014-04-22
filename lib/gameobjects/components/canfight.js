/**
 * CanFight Component constructor
 *
 * @class Roguelike.Components.CanFight
 * @classdesc An component that tells the system that this entity can fight!
 */
Roguelike.Components.CanFight = function() {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'canFight';

	/**
	 * @property {Roguelike.Event} events - Event holder
	 */
	this.events = new Roguelike.Event();

	/**
	 * @property {array} actions - A stack with the next actions to perform on this object
	 */
	this.actions = [];

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

		//Push the enemy that is going to get attacked into the actions stack
		//The combat system will handle the combat!
		this.actions.push(collisionEntity);

	}

};
