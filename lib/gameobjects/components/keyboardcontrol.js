/**
 * KeyboardControl Component constructor
 *
 * @class Roguelike.Components.KeyboardControl
 * @classdesc An component that tells the system that this entity can be controlled with the keyboard
 */
Roguelike.Components.KeyboardControl = function(controls, scheduler) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'keyboardControl';

	/**
	 * @property {array} controls - An array with every control keycode of this entity
	 */
	this.controls = controls;

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
		window.addEventListener('keydown', function(e){

			//Loop through each control keycode of this entity
			for(var key in _this.controls){

				//Check if one of the keys pressed is a control of this entity
				if(_this.controls[key] === event.keyCode){

					//Prevent the default action of this key
					e.preventDefault();

					//Unlock the scheduler because the player has moved
					_this.scheduler.unlock();

				}

			}

		}, false);

	}

};
