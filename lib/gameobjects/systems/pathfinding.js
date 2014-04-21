/**
 * PathFinding System constructor
 *
 * @class Roguelike.Systems.PathFinding
 * @classdesc The system that pathfinding
 *
 * @param {number} game - Reference to the currently running game
 */
Roguelike.Systems.PathFinding = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {EasyStar} easyStar - Reference to the EasyStar library
	 */
	this.easystar = null;

	//Initialize itself
	this.initialize();

};

Roguelike.Systems.PathFinding.prototype = {

	/**
	 * Initialize the game, create all objects
	 * @protected
	 */
	initialize: function() {

		//Create a new instance of the EasyStar library
		this.easystar = new EasyStar.js();

		//Implement the grid in EasyStar
		this.easystar.setGrid(this.game.map.typeList());

		//Disable diagonals
		this.easystar.disableDiagonals();

		//Set the acceptable tiles to walk on
		this.easystar.setAcceptableTiles([2]);


	},

	/**
	 * Function that gets called when the game continues one tick
	 * @protected
	 */
	update: function() {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("behaviour", "position");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++) {

			//Get the components from the current entity and store them temporarily in a variable
			var behaviourComponent = entities[i].getComponent("behaviour");
			var positionComponent = entities[i].getComponent("position");

			//Check the behaviour of the entity
			switch (behaviourComponent.behaviour){

				case("attack"):

					//Get the player
					var player = this.game.player;
					var playerPositionComponent = player.getComponent("position");

					var nextPosition;

					//If the entity is withing 10 tiles of the player, walk to the player
					if(positionComponent.position.manhattan(playerPositionComponent.position) < 10){

						//Let EasyStar calculate a path towards the player find a path
						this.easystar.findPath(positionComponent.position.x, positionComponent.position.y, playerPositionComponent.position.x, playerPositionComponent.position.y, function( path ) {

							//TODO: FIX IT!
							if (path === null || path.length === 0) {
								console.log("no path found");
							} else {
								nextPosition = new Roguelike.Vector2(path[1].x, path[1].y);
								positionComponent.actions.push(nextPosition);
							}

						});

						this.easystar.calculate();


					}

					break;

			}

		}

	}

};

