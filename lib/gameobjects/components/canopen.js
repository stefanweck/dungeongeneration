/**
 * CanOpen Component constructor
 *
 * @class Roguelike.Components.CanOpen
 * @classdesc An component that tells the system that this entity can be opened by another entity
 */
Roguelike.Components.CanOpen = function() {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'canOpen';

	/**
	 * @property {Roguelike.Event} events - Event holder
	 */
	this.events = new Roguelike.Event();

	/**
	 * @property {string} state - The state of this door, closed opened etc
	 */
	this.state = 'closed';

	/**
	 * @property {array} actions - The next actions to perform on this object
	 */
	this.actions = [];

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

		//If the door is closed, add an open action to the actions stack
		if(this.state === 'closed') {

			//The Open System will handle opening this door
			this.actions.push("open");

		}

	}

};
