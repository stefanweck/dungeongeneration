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

	/**
	 * @property {Array} tileArray - An array that stores which bitwise numbers should get certain tiles from the tileset
	 */
	this.tileArray = [];

	//Initialize itself
	this.initialize();

};

Roguelike.MapDecorator.prototype = {

	/**
	 * Perform the needed actions before decorating the map
	 * @protected
	 */
	initialize: function() {

		//Filling the tileArray used by the auto tiling in the setTileNumbers function, a more detailed explanation can be found there
		this.tileArray[0] = [255];
		this.tileArray[1] = [238, 239, 254];
		this.tileArray[2] = [125, 204, 253];
		this.tileArray[3] = [76, 92, 220];
		this.tileArray[4] = [123, 187, 251];
		this.tileArray[5] = [122, 152, 186, 192, 200, 216, 218, 234, 250];
		this.tileArray[6] = [25, 89, 57, 121];
		this.tileArray[7] = [24, 72, 80, 88];
		this.tileArray[8] = [134, 166, 230, 231, 247];
		this.tileArray[9] = [32];
		this.tileArray[10] = [17, 33, 49, 196];
		this.tileArray[11] = [16];
		this.tileArray[12] = [35, 51, 163, 179];
		this.tileArray[13] = [34, 162, 130];
		this.tileArray[14] = [64];
		this.tileArray[15] = [128];
		this.tileArray[16] = [120];
		this.tileArray[17] = [178];
		this.tileArray[18] = [194, 226];

	},

	/**
	 * A function that starts the decorating of the map, calling all the necessary functions
	 * @protected
	 */
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
	 *
	 * The key of the tileArray is representing the tile on the tileset
	 * The values represent the results that can come out of the bitwise calculation of surrounding tiles
	 * Calculating these values is rather easy following this graph:
	 *
	 * 16 - 2 - 32
	 *  8 - x - 2
	 * 64 - 4 - 128
	 *
	 * X is the tile that is currently being checked. For every floor tile that surrounds the current tile
	 * a certain value is added. For example: If there are floor tiles, above, left and bottom left of the current tile
	 * you end up with the number 74. This always describes an unique layout on the map and therefore translates to a certain tile on the tileset.
	 *
	 * @protected
	 */
	setTileNumbers: function() {

		//Get the reference to the map object
		var map = this.game.map;

		//Loop through every horizontal row
		for(var x = 0; x < map.settings.tilesX; x++) {

			//Loop through every vertical row
			for(var y = 0; y < map.settings.tilesY; y++) {

				//If the current tile is a wall, perform the autotiling check
				if(map.tiles[x][y].type === 1) {

					//Get the tile at the location of the possible door location
					//TODO: Write a function on the map that returns the surrounding tiles
					var tileLeft = this.game.map.tiles[x - 1][y];
					var tileRight = this.game.map.tiles[x + 1][y];
					var tileDown = this.game.map.tiles[x][y + 1];
					var tileUp = this.game.map.tiles[x][y - 1];
					var tileUpperLeft = this.game.map.tiles[x - 1][y - 1];
					var tileUpperRight = this.game.map.tiles[x + 1][y - 1];
					var tileLowerLeft = this.game.map.tiles[x - 1][y + 1];
					var tileLowerRight = this.game.map.tiles[x + 1][y + 1];

					//Start out with tile number 0
					var tileNumber = 0;

					//Check every tile and increment a value when it is a floor typed tile
					if(tileUp.type === 2) {
						tileNumber += 1;
					}
					if(tileRight.type === 2) {
						tileNumber += 2;
					}
					if(tileDown.type === 2) {
						tileNumber += 4;
					}
					if(tileLeft.type === 2) {
						tileNumber += 8;
					}
					if(tileUpperLeft.type === 2) {
						tileNumber += 16;
					}
					if(tileUpperRight.type === 2) {
						tileNumber += 32;
					}
					if(tileLowerLeft.type === 2) {
						tileNumber += 64;
					}
					if(tileLowerRight.type === 2) {
						tileNumber += 128;
					}

					//Loop through each tile number and see if any of the values inside them match the current tile value
					for(var index in this.tileArray) {

						//If the value matches, we choose the key number of this array as the corresponding tile on the spritesheet
						if(this.tileArray[index].indexOf(tileNumber) !== -1) {

							//Set the tile number to the corresponding tile
							map.tiles[x][y].tileNumber = index;

							//Chose a random row, 0 or 1. This is to add a little more variety in the tiles
							map.tiles[x][y].tileRow = Roguelike.Utils.randomNumber(0, 1);

							//Break the loop because we have found what we are looking for
							break;

						}

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
			//TODO: Write a function on the map that returns tiles in a certain radius
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
			doorEntity.components.sprite.tile = 0;
		}

		//Add the entity to the map
		this.game.map.entities.addEntity(doorEntity);

		//Add the door entity to the entities list on the current tile
		tileAtPosition.addEntity(doorEntity);

		//A door blocks light!
		tileAtPosition.blockLight = true;

	},

	/**
	 * Populate the dungeon with enemies and or friendlies
	 * This function is due to some heavy changes
	 * @protected
	 */
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
