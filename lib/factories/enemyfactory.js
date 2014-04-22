/**
 * @class Roguelike.EnemyFactory
 * @classdesc A factory that returns pre made enemies with
 * a set of components
 */
Roguelike.EnemyFactory = {

	/**
	 * Function that returns a new skeleton entity
	 * @public
	 *
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 */
	newSkeleton: function(position) {

		//Create the entity
		var entity = new Roguelike.Entity();

		//Give the entity a health of 100 points
		entity.addComponent(new Roguelike.Components.Health(20));

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position));

		//The entity has a sprite
		entity.addComponent(new Roguelike.Components.Sprite("entities", 0, 2));

		//You can collide with this entity
		entity.addComponent(new Roguelike.Components.Collide(true));

		//The entity has a weapon
		//TODO: Change this to a loadout. Something that says: Hey you are wearing this and this and this
		entity.addComponent(new Roguelike.Components.Weapon(10));

		//This entity is capable of fighting
		entity.addComponent(new Roguelike.Components.CanFight());

		//This entity has a certain behaviour
		entity.addComponent(new Roguelike.Components.Behaviour("attack"));

		//Return the entity
		return entity;

	}

};
