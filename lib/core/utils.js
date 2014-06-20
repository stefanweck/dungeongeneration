/**
 * Static Utilities Class
 *
 * @class Roguelike.Utils
 * @classdesc In this class are the functions stored that are being
 * used in other functions
 */
var seed = Math.floor(Math.random() * (500 - 100 + 1) + 100);

console.log(seed);

Roguelike.Utils = {

	mersenneTwister: new MersenneTwister(seed),
	//mersenneTwister: new MersenneTwister(404),

	/**
	 * Function to generate a random number between two values
	 * @public
	 *
	 * @param {Number} from - The minimum number
	 * @param {Number} to - The maximum number
	 *
	 * @return {Number} A random number between the two supplied values
	 */
	randomNumber: function(from, to) {

		return Math.floor(this.mersenneTwister.random() * (to - from + 1) + from);

	},

	/**
	 * Function to extend the default options with the users options
	 * @public
	 *
	 * @param {Object} a - The original object to extend
	 * @param {Object} b - The new settings that override the original object
	 *
	 * @return {Object} The extended object
	 */
	extend: function(a, b) {

		//Loop through each key
		for(var key in b) {

			//If the new settings have the key we are looping through
			if(b.hasOwnProperty(key)) {

				//Extend the original object with the new values
				a[key] = b[key];

			}

		}

		//Return the extended object
		return a;

	}

};
