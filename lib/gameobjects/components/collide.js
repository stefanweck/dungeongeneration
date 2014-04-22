/**
 * Collide Component constructor
 *
 * @class Roguelike.Components.Collide
 * @classdesc A component that tells if the entity is passable or not
 */
Roguelike.Components.Collide = function(collide) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'collide';

	/**
	 * @property {bool} collide - True or false depending on if it should collide with other entities
	 */
	this.collide = collide;

};
