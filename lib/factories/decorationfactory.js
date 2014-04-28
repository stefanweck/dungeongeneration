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
	 * @param {Roguelike.Game} game - Reference to the currently running game
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 *
	 * @return {Roguelike.Entity} A decoration entity
	 */
	newGrass: function(game, position) {

		//Create the entity
		var entity = new Roguelike.Entity(game);

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position));

		//The entity has a sprite ( color for now )
		entity.addComponent(new Roguelike.Components.Sprite("decoration", 0, Roguelike.Utils.randomNumber(3, 5)));

		//Return the entity
		return entity;

	}

};
