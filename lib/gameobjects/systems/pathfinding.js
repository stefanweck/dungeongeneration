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
		//TODO: Enable diagonal movement and make sure the player can also move diagonal
		this.easystar.disableDiagonals();


	},

	/**
	 * Performs the needed operations for this specific system on one entity
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is being processed by this system
	 * @param {Array} acceptableTiles - The entity is able to walk on the tiles in this array
	 */
	handleSingleEntity: function(entity, acceptableTiles) {

		//Set the acceptable tiles to walk on
		this.easystar.setAcceptableTiles(acceptableTiles);

		//Get the components from the current entity and store them temporarily in a variable
		var positionComponent = entity.getComponent("position");

		//TODO: Make this dynamic, not every enemy should chase the player
		var behaviour = "attack";

		//Check the behaviour of the entity
		switch(behaviour) {

			case("attack"):

				//Get the player
				var player = this.game.player;
				var playerPositionComponent = player.getComponent("position");

				//Initialize variables
				var _this = this;

				//Tile at position
				var tileAtPos = this.game.map.getTileAt(positionComponent.position);

				//If the entity is in the visible area of the player, it should act
				if(tileAtPos.lightLevel > 0.7) {

					//Let EasyStar calculate a path towards the player find a path
					this.easystar.findPath(positionComponent.position.x, positionComponent.position.y, playerPositionComponent.position.x, playerPositionComponent.position.y, function(path) {

						//TODO: Make sure enemies don't kill eachother, they have to find another route or collaborate
						if(path === null || path.length === 0) {

							console.log("no path found");

						}else{

							//Create a new Vector2 object of the new position
							var newPosition = new Roguelike.Vector2(path[1].x, path[1].y);

							//Tell the movement system that you want to move to the new position
							_this.game.staticSystems.movementSystem.handleSingleEntity(entity, newPosition);

						}

					});

					//Calculate the path
					this.easystar.calculate();


				}

				break;

		}

	}

};

