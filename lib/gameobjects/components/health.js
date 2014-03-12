/**
 * Health Component constructor
 *
 * @class Roguelike.Components.Health
 * @classdesc The health component is responsible for managing the health
 *
 * @param {int} maxHealth - The new and maximum health of the entity
 */
Roguelike.Components.Health = function(maxHealth) {

	/**
	 * @property {string} name - The name of this system. This field is always required!
	 */
	this.name = 'health';

	/**
	 * @property {int} health - The starting, and maximum health of the entity
	 */
	this.health = this.maxHealth = maxHealth;

};

Roguelike.Components.Health.prototype = {

	/**
	 * Check whether the entity is dead
	 * @protected
	 */
	isDead: function() {

		return this.health <= 0;

	}

};
