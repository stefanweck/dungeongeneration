/**
 * @class Roguelike.DecorationFactory
 * @classdesc Decorations are things in the world the player sees but doesn’t interact with: bushes,
 * debris and other visual detail.
 */
Roguelike.DecorationFactory = {

	/**
	 * Function that returns a grass object
	 * @public
	 *
	 * @param {object} position - The starting position of the entity, object with an x and y value
	 */
	newGrass: function(position) {

		//Create the entity
		var entity = new Roguelike.Entity();

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position.x, position.y));

		//The entity has a sprite ( color for now )
		entity.addComponent(new Roguelike.Components.Sprite(false, "tileset", 1, Roguelike.Utils.randomNumber(3, 5)));

		//Return the entity
		return entity;

	}

};
