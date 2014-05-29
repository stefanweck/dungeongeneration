/**
 * @class Roguelike.PropFactory
 * @classdesc A factory that returns pre made props with
 * a set of components. Props are like decorations but can be touched: boxes, boulders, and doors.
 */
Roguelike.PropFactory = {

	/**
	 * Function that returns a new entrance to the map
	 * @public
	 *
	 * @param {Roguelike.Game} game - Reference to the currently running game
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 *
	 * @return {Roguelike.Entity} An prop entity
	 */
	newEntrance: function(game, position) {

		//Create the entity
		var entity = new Roguelike.Entity(game);

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position));

		//The entity has a sprite ( color for now )
		entity.addComponent(new Roguelike.Components.Sprite("tileset", 3, 1));

		//Return the entity
		return entity;

	},

	/**
	 * Function that returns a new exit to the map
	 * @public
	 *
	 * @param {Roguelike.Game} game - Reference to the currently running game
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 *
	 * @return {Roguelike.Entity} An prop entity
	 */
	newExit: function(game, position) {

		//Create the entity
		var entity = new Roguelike.Entity(game);

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position));

		//The entity has a sprite ( color for now )
		entity.addComponent(new Roguelike.Components.Sprite("tileset", 3, 0));

		//Return the entity
		return entity;

	},

	/**
	 * Function that returns a new door
	 * @public
	 *
	 * @param {Roguelike.Game} game - Reference to the currently running game
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 *
	 * @return {Roguelike.Entity} An prop entity
	 */
	newDoor: function(game, position) {

		//Create the entity
		var entity = new Roguelike.Entity(game);

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position));

		//The entity has a sprite ( color for now )
		entity.addComponent(new Roguelike.Components.Sprite("tileset", 1, 0));

		//This entity can be opened up by another entity
		entity.addComponent(new Roguelike.Components.CanOpen(game, entity));

		//You can collide with this entity
		entity.addComponent(new Roguelike.Components.Collide(true));

		//Add a tooltip to this entity
		entity.addComponent(new Roguelike.Components.Tooltip(game.settings.canvas, "Wooden Door", "Closed", ""));

		//Return the entity
		return entity;

	}

};
