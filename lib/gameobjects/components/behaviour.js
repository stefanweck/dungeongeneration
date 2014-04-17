/**
 * Behaviour Component constructor
 *
 * @class Roguelike.Components.Behaviour
 * @classdesc A component that tells the behaviour of an entity, is it agressive, does it try to flee, etc
 */
Roguelike.Components.Behaviour = function(behaviour) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'behaviour';

	/**
	 * @property {Roguelike.Event} events - Event holder
	 */
	this.behaviour = behaviour;

};
