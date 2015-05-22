//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var PropFactory = require('../factories/propfactory.js'),
	DecorationFactory = require('../factories/decorationfactory.js'),
	EnemyFactory = require('../factories/enemyfactory.js'),
	Vector2 = require('../geometry/vector2.js'),
	Utils = require('../core/utils.js');

/**
 * MapDecorator constructor
 *
 * @class MapDecorator
 * @classdesc The object that is responsible for decorating the map
 *
 * @param {Game} game - Reference to the current game object
 */
var MapDecorator = function(game) {

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Array} tileArray - An array that stores which bitwise numbers should get certain tiles from the tileset
	 */
	this.tileArray = [];

	//Initialize itself
	this.initialize();

};

MapDecorator.prototype = {

	/**
	 * Perform the needed actions before decorating the map
	 * @private
	 */
	initialize: function() {

		//Filling the tileArray used by the auto tiling in the setTileNumbers function, a more detailed explanation can be found there
		this.tileArray["wall_single"] = [206];
		this.tileArray["wall_single_alone"] = [124, 182, 214, 222, 238, 239, 246, 252, 254, 255];
		this.tileArray["wall_pillar_left"] = [125, 204, 212, 253];
		this.tileArray["wall_corner_left"] = [76, 92, 148, 156, 220, 221];
		this.tileArray["wall_top_end"] = [123, 187, 217, 243, 249, 251];
		this.tileArray["wall_top_continue"] = [58, 106, 122, 154, 186, 200, 202, 218, 234, 250];
		this.tileArray["wall_corner_left_down"] = [25, 89, 57, 97, 105, 113, 121];
		this.tileArray["wall_left_continue"] = [24, 72, 88];
		this.tileArray["wall_corner_right"] = [100, 102, 134, 166, 183, 198, 228, 230, 231, 247];
		this.tileArray["wall_corner_both"] = [192];
		this.tileArray["pillar_right"] = [32];
		this.tileArray["pillar_left"] = [16];
		this.tileArray["pillar_both"] = [48];
		this.tileArray["wall"] = [17, 33, 49, 68, 85, 101, 117, 132, 149, 161, 165, 181, 196, 213, 229, 245];
		this.tileArray["wall_corner_right_down"] = [35, 51, 145, 147, 163, 177, 179];
		this.tileArray["wall_right_continue"] = [34, 162, 130];
		this.tileArray["wall_continue_left_corner"] = [64, 80];
		this.tileArray["wall_continue_right_corner"] = [128, 160];
		this.tileArray["wall_corner_left_down_corner_right"] = [96];
		this.tileArray["wall_continue_left_corner_right_right"] = [152, 216];
		this.tileArray["wall_corner_right_corner_left_up"] = [144];
		this.tileArray["wall_continue_left_corner_right"] = [104, 120];
		this.tileArray["wall_continue_right_corner_left"] = [50, 146, 178];
		this.tileArray["wall_corner_right_corner_left"] = [98, 194, 226];

	},

	/**
	 * A function that starts the decorating of the map, calling all the necessary functions
	 * @public
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
	 * 16 - 1 - 32
	 *  8 - x - 2
	 * 64 - 4 - 128
	 *
	 * X is the tile that is currently being checked. For every floor tile that surrounds the current tile
	 * a certain value is added. For example: If there are floor tiles, above, left and bottom left of the current tile
	 * you end up with the number 74. This always describes an unique layout on the map and therefore translates to a certain tile on the tileset.
	 *
	 * @private
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
							map.tiles[x][y].tileRow = Utils.randomNumber(0, 1);

							var rand = Utils.randomNumber(1, 2);

							var textureName = index + "_" + rand + ".png";

							map.pixitiles[x][y].texture = PIXI.Texture.fromFrame(textureName);

							//Break the loop because we have found what we are looking for
							break;

						}

					}

				}else if(map.tiles[x][y].type === 2) {

					var random = Utils.randomNumber(1, 4);

					var texturename = "floor_" + random + ".png";

					this.game.map.pixitiles[x][y].texture = PIXI.Texture.fromFrame(texturename);

				}

				//If the current tile is a floor tile
				if(map.tiles[x][y].type === 2) {

					//Have a random chance to spawn grass on this tile
					if(Utils.randomNumber(0, 100) >= 80) {

						//Create a new grass entity
						var grassEntity = new DecorationFactory.newGrass(
							this.game,
							new Vector2(x, y)
						);

						//Add the entity to the tile on the map
						map.tiles[x][y].add(grassEntity);

						//Add the entity to the map
						map.entities.add(grassEntity);

					}


				}

			}

		}

	},

	/**
	 * Get the first room on the roomsToExit list and turns it into the entrance room
	 * @private
	 */
	placeEntrance: function() {

		//Let the first room return a random position
		var entrancePosition = this.game.map.roomsToExit[0].getRandomPosition();

		//Get a new instance of a map entrance
		var entranceEntity = PropFactory.newEntrance(this.game, entrancePosition);

		//Add the entity to the map
		this.game.map.entities.add(entranceEntity);

		//Tell the map where the player should enter the map
		this.game.map.entrance = entrancePosition;

	},

	/**
	 * Get the last room on the roomsToExit list and turns it into the exit room
	 * @private
	 */
	placeExit: function() {

		//Let the last room return a random position
		var exitPosition = this.game.map.roomsToExit[this.game.map.roomsToExit.length - 1].getRandomPosition();

		//Get a new instance of a map exit
		var exitEntity = PropFactory.newExit(this.game, exitPosition);

		//Add the entity to the map
		this.game.map.entities.add(exitEntity);

		//Tell the map where the player should leave the map
		this.game.map.exit = exitPosition;

	},

	/**
	 * Generate some doors and spread them out over the map!
	 * @private
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

			var randomNumber = Utils.randomNumber(0, 100);

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
	 * @private
	 */
	placeDoor: function(position, orientation) {

		//Get the tile at the door's position
		var tileAtPosition = this.game.map.tiles[position.x][position.y];

		//Create the door entity
		var doorEntity = PropFactory.newDoor(this.game, position);

		if(orientation === true) {

			//Also change the name of the texture so the Open system can easily change the sprite
			doorEntity.textureName = "door_vertical_closed.png";

			//Change the sprite to open
			doorEntity.sprite.texture = PIXI.Texture.fromFrame('door_vertical_closed.png');

		}

		//Add the entity to the map
		this.game.map.entities.add(doorEntity);

		//Add the door entity to the entities list on the current tile
		tileAtPosition.add(doorEntity);

		//A door blocks light!
		tileAtPosition.blockLight = true;

	},

	/**
	 * Populate the dungeon with enemies and or friendlies
	 * This function is due to some heavy changes
	 * @private
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
						if(Utils.randomNumber(0, 100) >= 90) {

							//Create a new grass entity
							var enemyEntity = new EnemyFactory.newSpider(
								this.game,
								new Vector2(x, y)
							);

							//Add the entity to the tile on the map
							this.game.map.tiles[x][y].add(enemyEntity);

							//Add the entity to the map
							this.game.map.entities.add(enemyEntity);

							//Add the entity to the scheduler
							this.game.scheduler.add(enemyEntity, true);

						}

					}

				}

			}

		}

		for(var b = 0; b < this.game.map.hardRooms.length; b++) {

			var hardRoom = this.game.map.hardRooms[b];

			//Loop through every horizontal row
			for(var xPos = hardRoom.x1; xPos < hardRoom.x2; xPos++) {

				//Loop through every vertical row
				for(var yPos = hardRoom.y1; yPos < hardRoom.y2; yPos++) {

					//Don't place wall's over existing floor tiles. This solves the problem that some corridors may get shut of
					if(this.game.map.tiles[xPos][yPos].type === 2) {

						//Have a random chance to spawn grass on this tile
						if(Utils.randomNumber(0, 100) >= 90) {

							//Create a new grass entity
							enemyEntity = new EnemyFactory.newSkeleton(
								this.game,
								new Vector2(xPos, yPos)
							);

							//Add the entity to the tile on the map
							this.game.map.tiles[xPos][yPos].add(enemyEntity);

							//Add the entity to the map
							this.game.map.entities.add(enemyEntity);

							//Add the entity to the scheduler
							this.game.scheduler.add(enemyEntity, true);

						}

					}

				}

			}

		}

	}

};

//Export the Browserify module
module.exports = MapDecorator;
