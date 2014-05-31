/**
 * Health Component constructor
 *
 * @class Roguelike.Components.Health
 * @classdesc The health component is responsible for managing the health
 *
 * @param {Number} maxHealth - The new and maximum health of the entity
 */
Roguelike.Components.Health = function(maxHealth) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'health';

	/**
	 * @property {Number} minHealth - The minimum health of the entity
	 */
	this.minHealth = 0;

	/**
	 * @property {Number} health - The starting, and maximum health of the entity
	 */
	this.health = this.maxHealth = maxHealth;

};

Roguelike.Components.Health.prototype = {

	/**
	 * Returns the percentage of health that is left
	 * @protected
	 *
	 * @return {Number} Percentage rounded to 2 decimals
	 */
	percentage: function() {

		//Return the percentage
		return this.health / this.maxHealth;

	},

	/**
	 * Check if the entity has full health
	 * @protected
	 *
	 * @return {Boolean} True when full health, false when damaged
	 */
	isDamaged: function() {

		//Return true or false based on the entities health
		return this.health < this.maxHealth;

	},

	/**
	 * Check whether the entity is dead
	 * @protected
	 *
	 * @return {Boolean} True when dead, false when alive
	 */
	isDead: function() {

		//Return true or false based on the entities health
		return this.health <= this.minHealth;

	},

	/**
	 * Function to take damage
	 * @protected
	 */
	takeDamage: function(damage) {

		//Subtract the damage from the health of this entity
		this.health -= damage;

		//If the health drops below the minimum health, set it to the minimum health
		if(this.health < this.minHealth) {

			this.health = this.minHealth;

		}

	}

};
