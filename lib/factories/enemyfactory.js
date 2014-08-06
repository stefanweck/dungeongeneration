//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Entity = require('../gameobjects/entity.js'),
	MoveBehaviours = require('../gameobjects/behaviours/moveBehaviours.js'),
	Position = require('../gameobjects/components/position.js'),
	CanOpen = require('../gameobjects/components/canopen.js'),
	Collide = require('../gameobjects/components/collide.js'),
	Health = require('../gameobjects/components/health.js'),
	CanFight = require('../gameobjects/components/canfight.js'),
	Weapon = require('../gameobjects/components/weapon.js'),
	MovementComponent = require('../gameobjects/components/movement.js'),
	Tooltip = require('../gameobjects/components/tooltip.js');

/**
 * @class EnemyFactory
 * @classdesc A factory that returns pre made enemies with
 * a set of components
 */
var EnemyFactory = {

	/**
	 * Function that returns a new spider entity
	 * @public
	 *
	 * @param {Game} game - Reference to the currently running game
	 * @param {Vector2} position - The position object of this entity
	 *
	 * @return {Entity} An enemy entity
	 */
	newSpider: function(game, position) {

		//Create the entity
		var entity = new Entity(game, "Arachnid", "Quick Spider", "spider_small_right.png", 2000);

		//Give the entity a health of 100 points
		entity.addComponent(new Health(20));

		//The starting position of the entity
		entity.addComponent(new Position(position));

		//You can collide with this entity
		entity.addComponent(new Collide(true));

		//Add a certain move behaviour to this entity
		entity.addComponent(new MovementComponent(
			game,
			entity,
			MoveBehaviours.walkBehaviour()
		));

		//The entity has a weapon
		//TODO: Change this to a loadout. Something that says: Hey you are wearing this and this and this
		entity.addComponent(new Weapon(4));

		//This entity is capable of fighting
		var canAttackTypes = ["Player"];

		entity.addComponent(new CanFight(game, canAttackTypes));

		//Add a tooltip to this entity
		entity.addComponent(new Tooltip(
			entity.name,
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
	 * @param {Game} game - Reference to the currently running game
	 * @param {Vector2} position - The position object of this entity
	 *
	 * @return {Entity} An enemy entity
	 */
	newSkeleton: function(game, position) {

		//Create the entity
		var entity = new Entity(game, "Undead", "Skeleton", "skeleton_right.png", 1000);

		//Give the entity a health of 100 points
		entity.addComponent(new Health(50));

		//The starting position of the entity
		entity.addComponent(new Position(position));

		//You can collide with this entity
		entity.addComponent(new Collide(true));

		//Add a certain move behaviour to this entity
		entity.addComponent(new MovementComponent(
			game,
			entity,
			MoveBehaviours.walkBehaviour()
		));

		//The entity has a weapon
		//TODO: Change this to a loadout. Something that says: Hey you are wearing this and this and this
		entity.addComponent(new Weapon(10));

		//This entity is capable of fighting
		var canAttackTypes = ["Player"];

		entity.addComponent(new CanFight(game, canAttackTypes));

		//Add a tooltip to this entity
		entity.addComponent(new Tooltip(
			entity.name,
			"Undead Enemy",
			"The skeleton is a very dangerous but unstable enemy. If you stab just right his bones will collapse."
		));

		//Return the entity
		return entity;

	}

};

//Export the Browserify module
module.exports = EnemyFactory;
