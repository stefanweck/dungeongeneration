/**
 * @class Roguelike.PlayerFactory
 * @classdesc A factory that returns pre made player entities with
 * a set of components
 */
Roguelike.PlayerFactory = {

	/**
	 * Function that returns a new warrior
	 * @public
	 *
	 * @param {Roguelike.Game} game - Reference to the currently running game
	 * @param {Roguelike.Vector2} position - The position object of this entity
	 * @param {Object} controls - Associative array with every control this entity uses
	 *
	 * @return {Roguelike.Entity} A player entity
	 */
	newPlayerWarrior: function(game, position, controls) {

		//Create the entity
		var entity = new Roguelike.Entity(game, 1000);

		//Give the player a health of 100 points
		entity.addComponent(new Roguelike.Components.Health(100));

		//The starting position of the player is at the dungeon's entrance
		entity.addComponent(new Roguelike.Components.Position(position));

		//The player has a sprite
		entity.addComponent(new Roguelike.Components.Sprite("entities", 0, 0));

		//The player must be controllable by the keyboards arrow keys
		entity.addComponent(new Roguelike.Components.KeyboardControl(
			game,
			entity,
			controls
		));

		//Add a lightsource to the player
		entity.addComponent(new Roguelike.Components.LightSource(true, 6));

		//You can collide with this entity
		entity.addComponent(new Roguelike.Components.Collide(true));

		//The entity has a weapon
		//TODO: Change this to a loadout. Something that says: Hey you are wearing this and this and this
		entity.addComponent(new Roguelike.Components.Weapon(7));

		//This entity is capable of fighting
		entity.addComponent(new Roguelike.Components.CanFight(game));

		//Add a tooltip to this entity
		entity.addComponent(new Roguelike.Components.Tooltip(game.settings.canvas, "Player", "", ""));

		//Return the entity
		return entity;

	}

};
