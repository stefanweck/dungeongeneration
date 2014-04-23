/**
 * PathFinding System constructor
 *
 * @class Roguelike.Systems.PathFinding
 * @classdesc The system that handles pathfinding calculates new routes for entities with a certain behaviour
 *
 * @param {Roguelike.Game} game - Reference to the currently running game
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

			//Perform the needed operations for this specific system on one entity
			this.handleSingleEntity(entities[i]);

		}

	},

	/**
	 * Performs the needed operations for this specific system on one entity
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is being processed by this system
	 */
	handleSingleEntity : function(entity){

		//Get the components from the current entity and store them temporarily in a variable
		var behaviourComponent = entity.getComponent("behaviour");
		var positionComponent = entity.getComponent("position");

		//Check the behaviour of the entity
		switch(behaviourComponent.behaviour) {

			case("attack"):

				//Get the player
				var player = this.game.player;
				var playerPositionComponent = player.getComponent("position");

				//Initialize variables
				var nextPosition;

				//If the entity is withing 10 tiles of the player, walk to the player
				if(positionComponent.position.manhattan(playerPositionComponent.position) < 10) {

					//Let EasyStar calculate a path towards the player find a path
					this.easystar.findPath(positionComponent.position.x, positionComponent.position.y, playerPositionComponent.position.x, playerPositionComponent.position.y, function(path) {

						//TODO: Make sure enemies don't kill eachother, they have to find another route or collaborate
						if(path === null || path.length === 0) {
							console.log("no path found");
						}else{
							nextPosition = new Roguelike.Vector2(path[1].x, path[1].y);
							positionComponent.actions.push(nextPosition);
						}

					});

					//TODO: Find out is this is still needed, i dont think so.
					this.easystar.calculate();


				}

				break;

		}

	}

};

