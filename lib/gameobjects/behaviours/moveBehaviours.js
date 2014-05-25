/**
 * @class Roguelike.moveBehaviours
 * @classdesc An object that holds all move behaviours used in the Movement component
 */
Roguelike.moveBehaviours = {

	/**
	 * Function that returns a new walk behaviour
	 * @public
	 *
	 * @return {Function} A function used in the strategy pattern
	 */
	walkBehaviour: function() {

		return function(game, entity) {

			//Array with all the acceptable/walkable tiles for this move behaviour
			var acceptableTiles = [2];

			//Make a call to the pathfinding system
			game.staticSystems.pathfindingSystem.handleSingleEntity(entity, acceptableTiles);

		};

	},

	/**
	 * Function that returns a new fly behaviour
	 * @public
	 *
	 * @return {Function} A function used in the strategy pattern
	 */
	flyBehaviour: function() {

		return function(game, entity) {

			//Array with all the acceptable/walkable tiles for this move behaviour
			var acceptableTiles = [2];

			//Make a call to the pathfinding system
			game.staticSystems.pathfindingSystem.handleSingleEntity(entity, acceptableTiles);

		};

	}

};
