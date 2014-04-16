/**
 * @class Roguelike.EnemyFactory
 * @classdesc A factory that returns pre made entity's with
 * a set of components
 */
Roguelike.EnemyFactory = {

	/**
	 * Function that returns a new skeleton entity
	 * @public
	 *
	 * @param {object} position - The starting position of the entity, object with an x and y value
	 */
	newSkeleton: function(position) {

		//Create the entity
		var entity = new Roguelike.Entity();

		//Give the entity a health of 100 points
		entity.addComponent(new Roguelike.Components.Health(100));

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position.x, position.y));

		//The entity has a sprite ( color for now )
		entity.addComponent(new Roguelike.Components.Sprite("entities", 0, 2));

		//Return the entity
		return entity;

	}

};
