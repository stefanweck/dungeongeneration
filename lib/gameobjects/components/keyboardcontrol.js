/**
 * KeyboardControl Component constructor
 *
 * @class Roguelike.Components.KeyboardControl
 * @classdesc An component that tells the system that this entity can be controlled with the keyboard
 */
Roguelike.Components.KeyboardControl = function(scheduler) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'keyboardControl';

	/**
	 * @property {Roguelike.Scheduler} scheduler - Reference to the scheduler object
	 */
	this.scheduler = scheduler;

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

		//Make sure the function inside the event listener can reach the scheduler
		var _this = this;

		//Attach the keydown event listener to this component
		window.addEventListener('keydown', function(){

			//Unlock the scheduler because the player has moved
			_this.scheduler.unlock();

		}, false);

	}

};
