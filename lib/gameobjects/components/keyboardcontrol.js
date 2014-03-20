/**
 * KeyboardControl Component constructor
 *
 * @class Roguelike.Components.KeyboardControl
 * @classdesc An component that tells the system that this entity can be controlled with the keyboard
 */
Roguelike.Components.KeyboardControl = function(leftKey, rightKey, upKey, downKey) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'keyboardControl';

	/**
	 * @property {object} controls - Object that holds the keycodes for certain keys
	 */
	this.controls = {
		leftKey: leftKey,
		rightKey: rightKey,
		upKey: upKey,
		downKey: downKey
	};

	/**
	 * @property {Roguelike.Event} events - Event holder
	 */
	this.events = new Roguelike.Event();

	/**
	 * @property {array} actions - The next actions to perform on this object
	 */
	this.actions = [];

};
