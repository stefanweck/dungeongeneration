var CustomRandom = function(nseed) {

	var seed = nseed;
	var constant = Math.pow(2, 13) + 1;
	var prime = 1987;
	var maximum = 1000;

	return {
		next: function(min, max) {

			while(seed > constant) seed = seed / prime;

			seed *= constant;
			seed += prime;

			return min && max ? min + seed % maximum / maximum * (max - min) : seed % maximum / maximum;
		}
	}
};

var rng = CustomRandom(4012);
//use '4014' as a seed

/**
 * @class Roguelike.Utils
 * @classdesc In this class are the functions stored that are being
 * used in other functions
 */
Roguelike.Utils = {

	/**
	 * Function to generate a random number between two values
	 * @public
	 *
	 * @param {number} from - The minimum number
	 * @param {number} to - The maximum number
	 */
	randomNumber: function(from, to) {

		//return Math.floor(rng.next() * (to - from + 1) + from);
		return Math.floor(Math.random() * (to - from + 1) + from);

	},

	/**
	 * Function to extend the default options with the users options
	 * @public
	 *
	 * @param {object} a - The original object to extend
	 * @param {object} b - The new settings that override the original object
	 */
	extend: function(a, b) {

		//Check each property
		for(var key in b) {
			if(b.hasOwnProperty(key)) {
				a[key] = b[key];
			}
		}

		//Return the extended object
		return a;

	},

	/**
	 * Function to check if an object is in a list
	 * @public
	 *
	 * @param {object} object - The object to search for
	 * @param {Array} list - The list, aka the array
	 */
	contains: function(object, list) {

		//Loop through the list
		for(var i = 0; i < list.length; i++) {

			//If the current list item equals the object, return the position!
			if(list[i] === object) {
				return i;
			}
		}

		//No results found, the list doesn't contain the object
		return false;

	}

};
