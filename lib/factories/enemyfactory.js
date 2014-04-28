/**
 * @class Roguelike.EnemyFactory
 * @classdesc A factory that returns pre made enemies with
 * a set of components
 */
Roguelike.EnemyFactory = {

	/**
	 * Function that returns a new spider entity
	 * @public
	 *
	 * @param {Roguelike.Game} game - Reference to the currently running game
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 */
	newSpider: function(game, position) {

		//Create the entity
		var entity = new Roguelike.Entity(game, 2000);

		//Give the entity a health of 100 points
		entity.addComponent(new Roguelike.Components.Health(20));

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position));

		//The entity has a sprite
		entity.addComponent(new Roguelike.Components.Sprite("entities", 1, 2));

		//You can collide with this entity
		entity.addComponent(new Roguelike.Components.Collide(true));

		//Add a certain move behaviour to this entity
		entity.addComponent(new Roguelike.Components.Movement(
			Roguelike.moveBehaviours.flyBehaviour()
		));

		//The entity has a weapon
		//TODO: Change this to a loadout. Something that says: Hey you are wearing this and this and this
		entity.addComponent(new Roguelike.Components.Weapon(10));

		//This entity is capable of fighting
		entity.addComponent(new Roguelike.Components.CanFight());

		//Return the entity
		return entity;

	}

};
