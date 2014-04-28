/**
 * @class Roguelike.moveBehaviours
 * @classdesc An object that holds all move behaviours used in the Movement component
 */
Roguelike.moveBehaviours = {

	/**
	 * Function that returns a new walk behaviour
	 * @public
	 */
	walkBehaviour: function() {

		return function(){

			console.log("I'm walking");

		};

	},

	/**
	 * Function that returns a new fly behaviour
	 * @public
	 */
	flyBehaviour: function() {

		return function(){

			console.log("I'm flying!");

		};

	}

};
