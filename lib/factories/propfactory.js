/**
 * @class Roguelike.PropFactory
 * @classdesc A factory that returns pre made props with
 * a set of components. Props are like decorations but can be touched: boxes, boulders, and doors.
 */
Roguelike.PropFactory = {

	/**
	 * Function that returns a new door
	 * @public
	 *
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 */
	newDoor: function(position) {

		//Create the entity
		var entity = new Roguelike.Entity();

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position));

		//The entity has a sprite ( color for now )
		entity.addComponent(new Roguelike.Components.Sprite("tileset", 1, 0));

		//This entity can be opened up by another entity
		entity.addComponent(new Roguelike.Components.CanOpen());

		//You can collide with this entity
		entity.addComponent(new Roguelike.Components.Collide(true));

		//Return the entity
		return entity;

	}

};
