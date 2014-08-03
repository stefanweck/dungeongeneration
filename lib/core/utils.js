//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var MersenneTwister = require('../libraries/mersennetwister.js');

//Calculate a seed and log it for debugging purposes
var seed = Math.floor(Math.random() * (500 - 1 + 1) + 1);
console.log("Map Seed: " + seed);

/**
 * Static Utilities Class
 *
 * @class Utils
 * @classdesc In this class are the functions stored that are being
 * used in other functions
 */
var Utils = {

	//Create a new instance of the Mersenne Twister
	mersenneTwister: new MersenneTwister(seed),

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

//Export the Browserify module
module.exports = Utils;
