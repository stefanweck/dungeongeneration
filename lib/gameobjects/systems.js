/*
* Control System constructor
* 
* @class Roguelike.Systems.Control
* @classdesc The health component is responsible for maning the health
*
* @param {int} maxHealth - The new and maximum health of the entity
*/
Roguelike.Systems.Control = function(game){

    /*
     * @property {string} name - The name of this system. This field is always required!
     */
	this.name = 'control';

    /*
     * @property {Roguelike.Game} game - Reference to the current game object
     */
	this.game = game;

};

Roguelike.Systems.Control.prototype = {

	/*
	* Function that gets called when the game continues one tick
	* @protected
	*/
	update: function(){

		//TODO: Get all entities that have KeyboardControl component
        //Then loop through them and check the user input, and handle accordingly

	}

};
