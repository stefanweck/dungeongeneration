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
	 *
	 * @return {Roguelike.Entity} An enemy entity
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
			game,
			entity,
			Roguelike.moveBehaviours.walkBehaviour()
		));

		//The entity has a weapon
		//TODO: Change this to a loadout. Something that says: Hey you are wearing this and this and this
		entity.addComponent(new Roguelike.Components.Weapon(4));

		//This entity is capable of fighting
		entity.addComponent(new Roguelike.Components.CanFight(game));

		//Add a tooltip to this entity
		entity.addComponent(new Roguelike.Components.Tooltip(
			game.settings.canvas,
			"Quick Spider",
			"Arachnid Enemy",
			"The quick spider is twice as fast as you and will definitely attack you. It's just programmed to do so."
		));

		//Return the entity
		return entity;

	},

	/**
	 * Function that returns a new skeleton entity
	 * @public
	 *
	 * @param {Roguelike.Game} game - Reference to the currently running game
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 *
	 * @return {Roguelike.Entity} An enemy entity
	 */
	newSkeleton: function(game, position) {

		//Create the entity
		var entity = new Roguelike.Entity(game, 1000);

		//Give the entity a health of 100 points
		entity.addComponent(new Roguelike.Components.Health(50));

		//The starting position of the entity
		entity.addComponent(new Roguelike.Components.Position(position));

		//The entity has a sprite
		entity.addComponent(new Roguelike.Components.Sprite("entities", 2, 0));

		//You can collide with this entity
		entity.addComponent(new Roguelike.Components.Collide(true));

		//Add a certain move behaviour to this entity
		entity.addComponent(new Roguelike.Components.Movement(
			game,
			entity,
			Roguelike.moveBehaviours.walkBehaviour()
		));

		//The entity has a weapon
		//TODO: Change this to a loadout. Something that says: Hey you are wearing this and this and this
		entity.addComponent(new Roguelike.Components.Weapon(10));

		//This entity is capable of fighting
		entity.addComponent(new Roguelike.Components.CanFight(game));

		//Add a tooltip to this entity
		entity.addComponent(new Roguelike.Components.Tooltip(
			game.settings.canvas,
			"Skeleton",
			"Undead Enemy",
			"The skeleton is a very dangerous but unstable enemy. If you stab just right his bones will collapse."
		));

		//Return the entity
		return entity;

	}

};
