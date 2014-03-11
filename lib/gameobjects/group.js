/**
 * Control constructor
 *
 * @class Roguelike.Group
 * @classdesc The object that holds multiple entities and is able to search them
 *
 * @param {Roguelike.Game} game - A reference to the current game object
 */
Roguelike.Group = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {array} entities - Collection of all the entities in this group
	 */
	this.entities = [];

};

Roguelike.Group.prototype = {

	/**
	 * Function to add a new entity to this group
	 * @protected
	 */
	addEntity: function(entity) {

		//Check if the entity is the correct object
		if(!entity instanceof Roguelike.Entity) {
			return;
		}

		//Add the current entity to the list
		this.entities.push(entity);

	},

	/**
	 * Function to remove an entity from this group
	 * @protected
	 */
	removeEntity: function(entity) {

		//Check if the entity exists, if not, we don't have to delete it
		var position = Roguelike.Utils.contains(entity, this.entities);

		//The element doesn't exist in the list
		if(position === false) {
			return;
		}

		//Remove the current entity from the group
		this.entities.splice(position, 1);

	}

};
