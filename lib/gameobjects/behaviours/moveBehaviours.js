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

		return function(game, entity){

			//Make a call to the pathfinding system
			game.pathfindingSystem.handleSingleEntity(entity);

		};

	},

	/**
	 * Function that returns a new fly behaviour
	 * @public
	 *
	 * @return {Function} A function used in the strategy pattern
	 */
	flyBehaviour: function() {

		return function(){

			console.log("I'm flying!");

		};

	}

};
