/**
 * MapDecorator constructor
 *
 * @class Roguelike.MapDecorator
 * @classdesc The object that is responsible for decorating the map
 *
 * @param {Roguelike.Game} game - Reference to the current game object
 */
Roguelike.MapDecorator = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

};

Roguelike.MapDecorator.prototype = {

	decorateMap: function() {

		//Place the entrance and exit on the map
		this.placeEntrance();
		this.placeExit();

		//Let the autotiler work it's magic
		this.setTileNumbers();

		//Place doors on the map
		this.generateDoors();

		//Populate the dungeon with monsters and or friendlies
		this.populateDungeon();

	},

	/**
	 * This function sets the correct tileset row and number for each tile
	 * @protected
	 */
	setTileNumbers: function() {

		var map = this.game.map;

		//Loop through every horizontal row
		for(var x = 0; x < map.settings.tilesX; x++) {

			//Loop through every vertical row
			for(var y = 0; y < map.settings.tilesY; y++) {

				if(map.tiles[x][y].type === 1) {

					//Get the tile at the location of the possible door location
					//TODO: Write a function somewhere that returns the surrounding tiles
					var tileLeft = this.game.map.tiles[x - 1][y];
					var tileRight = this.game.map.tiles[x + 1][y];
					var tileDown = this.game.map.tiles[x][y + 1];
					var tileUp = this.game.map.tiles[x][y - 1];

					//TODO: Maybe use a more elegant autotiling solution for this
					//Check left type void, right type floor || Check left type void, right type wall, up type void || tileLeft is wall, tileUp is wall and tileDown is wall
					if(tileLeft.type === 0 && tileRight.type === 2 || tileLeft.type === 0 && tileRight.type === 1 && tileUp.type === 0 || tileLeft.type === 1 && tileUp.type === 1 && tileDown.type === 1 || tileLeft.type === 1 && tileRight.type === 1 && tileUp.type === 0 && tileDown.type === 1) {

						map.tiles[x][y].tileNumber = 3;

						//Check right type void, left type floor || Check right type void, left type wall, up type void
					}else if(tileRight.type === 0 && tileLeft.type === 2 || tileRight.type === 0 && tileLeft.type === 1 && tileUp.type === 0 || tileRight.type === 1 && tileUp.type === 1 && tileDown.type === 1 || tileRight.type === 1 && tileLeft.type === 1 && tileUp.type === 1 && tileDown.type === 0) {

						map.tiles[x][y].tileNumber = 4;

						//Check above for a wall, left for a wall and right for void
					}else if(tileUp.type === 1 && tileLeft.type === 1 && tileRight.type === 0) {

						map.tiles[x][y].tileNumber = 6;

						//Check above for a wall, right for a wall and left for void
					}else if(tileUp.type === 1 && tileRight.type === 1 && tileLeft.type === 0) {

						map.tiles[x][y].tileNumber = 5;

						//Check up for floor, down for wall, left for floor, right for wall
					}else if(tileUp.type === 2 && tileDown.type === 1 && tileLeft.type === 2 && tileRight.type === 1) {

						map.tiles[x][y].tileRow = 1;
						map.tiles[x][y].tileNumber = 3;

						//Check up for floor, down for wall, left for wall, right for floor
					}else if(tileUp.type === 2 && tileDown.type === 1 && tileLeft.type === 1 && tileRight.type === 2) {

						map.tiles[x][y].tileRow = 1;
						map.tiles[x][y].tileNumber = 2;

						//Check if above is floor, right and left are floor and beneath is a wall
					}else if(tileUp.type === 2 && tileDown.type === 1 && tileLeft.type === 2 && tileRight.type === 2) {

						map.tiles[x][y].tileRow = 1;
						map.tiles[x][y].tileNumber = 5;

						//Check if the tiles left and right are floors, and up and down are walls
					}else if(tileUp.type === 1 && tileDown.type === 1 && tileLeft.type === 2 && tileRight.type === 2 || tileUp.type === 1 && tileDown.type === 1 && tileLeft.type === 2 && tileRight.type === 1) {

						map.tiles[x][y].tileRow = 1;
						map.tiles[x][y].tileNumber = 4;

					}

				}

				//If the current tile is a floor tile
				if(map.tiles[x][y].type === 2) {

					//Have a random chance to spawn grass on this tile
					if(Roguelike.Utils.randomNumber(0, 100) >= 80) {

						//Create a new grass entity
						grassEntity = new Roguelike.DecorationFactory.newGrass(
							this.game,
							new Roguelike.Vector2(x, y)
						);

						//Add the entity to the tile on the map
						map.tiles[x][y].addEntity(grassEntity);

						//Add the entity to the map
						map.entities.addEntity(grassEntity);

					}


				}

			}

		}

	},

	/**
	 * Get the first room on the roomsToExit list and turns it into the entrance room
	 * @protected
	 */
	placeEntrance: function() {

		//Let the first room return a random position
		var entrancePosition = this.game.map.roomsToExit[0].getRandomPosition();

		//Get a new instance of a map entrance
		var entranceEntity = Roguelike.PropFactory.newEntrance(this.game, entrancePosition);

		//Add the entity to the map
		this.game.map.entities.addEntity(entranceEntity);

		//Tell the map where the player should enter the map
		this.game.map.entrance = entrancePosition;

	},

	/**
	 * Get the last room on the roomsToExit list and turns it into the exit room
	 * @protected
	 */
	placeExit: function() {

		//Let the last room return a random position
		var exitPosition = this.game.map.roomsToExit[this.game.map.roomsToExit.length - 1].getRandomPosition();

		//Get a new instance of a map exit
		var exitEntity = Roguelike.PropFactory.newExit(this.game, exitPosition);

		//Add the entity to the map
		this.game.map.entities.addEntity(exitEntity);

		//Tell the map where the player should leave the map
		this.game.map.exit = exitPosition;

	},

	/**
	 * Generate some doors and spread them out over the map!
	 * @protected
	 */
	generateDoors: function() {

		//Loop through all possible door locations
		//TODO: Don't store the possible door locations in the mapfactory, store it in the map that is being created and decorated
		for(var i = 0; i < this.game.mapFactory.possibleDoorLocations.length; i++) {

			//Store the current location in a local variable
			var doorLocation = this.game.mapFactory.possibleDoorLocations[i];

			//Get the tile at the location of the possible door location
			var tileLeft = this.game.map.tiles[doorLocation.x - 1][doorLocation.y];
			var tileRight = this.game.map.tiles[doorLocation.x + 1][doorLocation.y];
			var tileUp = this.game.map.tiles[doorLocation.x][doorLocation.y - 1];
			var tileDown = this.game.map.tiles[doorLocation.x][doorLocation.y + 1];

			var randomNumber = Roguelike.Utils.randomNumber(0, 100);

			//If the tiles left and right are walls and the tiles above and below are floors
			if(tileLeft.type === 1 && tileRight.type === 1 && tileUp.entities.length === 0 && tileDown.entities.length === 0 && tileUp.type === 2 && tileDown.type === 2 && randomNumber > 50) {

				//Place a door at this location
				this.placeDoor(doorLocation, false);

				//If the tiles left and right are floors and the tiles above and below are walls
			}else if(tileLeft.type === 2 && tileRight.type === 2 && tileLeft.entities.length === 0 && tileRight.entities.length === 0 && tileUp.type === 1 && tileDown.type === 1 && randomNumber > 50) {

				//Place a door at this location
				this.placeDoor(doorLocation, true);

			}

		}

	},

	/**
	 * Place the entrance and exit objects on the map
	 * @protected
	 */
	placeDoor: function(position, orientation) {

		//Get the tile at the door's position
		var tileAtPosition = this.game.map.tiles[position.x][position.y];

		//Create the door entity
		var doorEntity = Roguelike.PropFactory.newDoor(this.game, position);

		if(orientation === true) {
			doorEntity.components.sprite.number = 0;
			doorEntity.components.sprite.row = 2;
		}

		//Add the entity to the map
		this.game.map.entities.addEntity(doorEntity);

		//Add the door entity to the entities list on the current tile
		tileAtPosition.addEntity(doorEntity);

		//A door blocks light!
		tileAtPosition.blockLight = true;

	},

	populateDungeon: function() {

		for(var i = 0; i < this.game.map.mediumRooms.length; i++) {

			var room = this.game.map.mediumRooms[i];

			//Loop through every horizontal row
			for(var x = room.x1; x < room.x2; x++) {

				//Loop through every vertical row
				for(var y = room.y1; y < room.y2; y++) {

					//Don't place wall's over existing floor tiles. This solves the problem that some corridors may get shut of
					if(this.game.map.tiles[x][y].type === 2) {

						//Have a random chance to spawn grass on this tile
						if(Roguelike.Utils.randomNumber(0, 100) >= 90) {

							//Create a new grass entity
							enemyEntity = new Roguelike.EnemyFactory.newSpider(
								this.game,
								new Roguelike.Vector2(x, y)
							);

							//Add the entity to the tile on the map
							this.game.map.tiles[x][y].addEntity(enemyEntity);

							//Add the entity to the map
							this.game.map.entities.addEntity(enemyEntity);

							//Add the entity to the scheduler
							this.game.scheduler.add(enemyEntity, true);

						}

					}

				}

			}

		}

		for(var i = 0; i < this.game.map.hardRooms.length; i++) {

			var room = this.game.map.hardRooms[i];

			//Loop through every horizontal row
			for(var x = room.x1; x < room.x2; x++) {

				//Loop through every vertical row
				for(var y = room.y1; y < room.y2; y++) {

					//Don't place wall's over existing floor tiles. This solves the problem that some corridors may get shut of
					if(this.game.map.tiles[x][y].type === 2) {

						//Have a random chance to spawn grass on this tile
						if(Roguelike.Utils.randomNumber(0, 100) >= 90) {

							//Create a new grass entity
							enemyEntity = new Roguelike.EnemyFactory.newSkeleton(
								this.game,
								new Roguelike.Vector2(x, y)
							);

							//Add the entity to the tile on the map
							this.game.map.tiles[x][y].addEntity(enemyEntity);

							//Add the entity to the map
							this.game.map.entities.addEntity(enemyEntity);

							//Add the entity to the scheduler
							this.game.scheduler.add(enemyEntity, true);

						}

					}

				}

			}

		}

	}

};
