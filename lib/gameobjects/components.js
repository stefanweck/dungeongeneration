/*
* Components constructor
* 
* @class Roguelike.Components
* @classdesc An object that holds all the components that are available
*
*/
Roguelike.Components = function(){

	/*
	* @property {object} components - An object filled with all the components
	*/
	this.movement = {};

	//Initialize the components
	this.initialize();

};

Roguelike.Components.prototype = {

	/*
	* Initialize all the components and place them in their 'containers'
	* @protected
	*/
	initialize: function(){

		//Initialize the Position Component
		this.movement.position = {

			name: 'position',
			initialize: function(x, y){
				this.x = x;
				this.y = y;
			}

		};

	}

};