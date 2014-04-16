/**
 * Weapon Component constructor
 *
 * @class Roguelike.Components.Sprite
 * @classdesc The weapon of an entity, this class is due to some heavy changes
 *
 * @param {int} damage - The damage that this weapon does
 */
Roguelike.Components.Weapon = function(damage) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'weapon';

	/**
	 * @property {int} damage - The damage that this weapon does
	 */
	this.damage = damage;

};
