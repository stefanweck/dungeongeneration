/**
 * MapFactory constructor
 *
 * @class Roguelike.MapFactory
 * @classdesc The object that is responsible for generating rooms and corridors
 *
 * @param {Roguelike.Game} game - Reference to the current game object
 */
Roguelike.MapFactory = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

};

Roguelike.MapFactory.prototype = {

	/**
	 * Generate a random amount of rooms and add them to the room list
	 * @protected
	 */
	generateRooms: function() {

		//Define the map variable
		var map = this.game.map;

		//Maximum number of tries before stopping the placement of more rooms
		var maxTries = this.game.map.maxRooms + 10;
		var tries = 0;

		//Create rooms and add them to the list
		while(map.rooms.length < map.maxRooms) {

			//Check if the limit has been reached, this prevents the while loop from crashing your page
			//We assume there is no space left on the map and break the loop
			if(tries >= maxTries) {
				break;
			}

			//Generate random values ( in tiles )
			//Start with generating a random width
			var w = Roguelike.Utils.randomNumber(
				map.minRoomWidth,
				map.maxRoomWidth
			);

			//Generate a random height for the room
			var h = Roguelike.Utils.randomNumber(
				map.minRoomHeight,
				map.maxRoomHeight
			);

			//Generate a random width horizontal position for the room
			var x = Roguelike.Utils.randomNumber(
				1,
				map.tilesX - w - 1
			);

			//Generate a random vertical position for the room
			var y = Roguelike.Utils.randomNumber(
				1,
				map.tilesY - h - 1
			);

			//Create a new room with these values
			var room = new Roguelike.Room(x, y, w, h);

			//We tried to create a room at a certain position
			tries++;

			//Check if this room intersects with the other rooms, if not, add it to the list
			if(!map.roomIntersectsWith(room)) {

				//The room doesn't intersect, initialize the room layout
				room.initialize();
				room.generateExit();

				//If this is the first room, add an entrance to the dungeon
				if(map.rooms.length === 0) {
					room.generateDungeonEntrance(map);
				}

				//Add the room to the room list
				map.rooms.push(room);

				//Reset tries back to zero, giving the next room equal chances of spawning
				tries = 0;

			}

		}

	},

	/**
	 * Generate corridors based on the room's exits
	 * @protected
	 */
	generateCorridors: function() {

		//Define the map variable
		var map = this.game.map;

		//After all the rooms are placed, go and generate the corridors
		//We start at the second room, so we can connect to the first room
		for(var i = 1; i < map.rooms.length; i++) {

			//Generate a corridor from this position to the previous room's exit
			this.generateCorridor(map.rooms[i], map.rooms[i - 1]);

		}

	},

	/**
	 * Check in which direction the corridor has to be generated
	 * @protected
	 *
	 * @param {object} firstRoom - The room from which we are going to generate a path to the second room
	 * @param {object} secondRoom - This room is going to be the endpoint of this corridor
	 */
	generateCorridor: function(firstRoom, secondRoom) {

		//Exit positions are stored in layout, so upper left is 0,0.
		//We need the map's position, so we'll add the top left coordinates of the room
		var firstExit = {
			x: firstRoom.x1 + firstRoom.exit.x,
			y: firstRoom.y1 + firstRoom.exit.y
		};

		var secondExit = {
			x: secondRoom.x1 + secondRoom.exit.x,
			y: secondRoom.y1 + secondRoom.exit.y
		};

		//Horizontal Corridors
		if((secondExit.x - firstExit.x) > 0) {

			//Corridor going left
			for(i = secondExit.x; i >= firstExit.x; i--) {
				this.generateHorizontalCorridor(i, secondExit.y);
			}

		}else{

			//Corridor going right
			for(i = secondExit.x; i <= firstExit.x; i++) {
				this.generateHorizontalCorridor(i, secondExit.y);
			}
		}

		//Vertical Corridors
		if((secondExit.y - firstExit.y) > 0) {

			//If the corridor is going up
			for(i = secondExit.y; i >= firstExit.y; i--) {
				this.generateVerticalCorridor(firstExit.x, i);
			}

		}else{

			//If the corridor is going down
			for(i = secondExit.y; i <= firstExit.y; i++) {
				this.generateVerticalCorridor(firstExit.x, i);
			}
		}

	},

	/**
	 * Generate a horizontal corridor tile, and also place doors and walls
	 * @protected
	 *
	 * @param {int} x - The horizontal position of the tile that has to become a corridor
	 * @param {int} y - The vertical position of the tile that has to become a corridor
	 */
	generateHorizontalCorridor: function(x, y) {

		//Define the map variable
		var map = this.game.map;

		//Get the current tiles type
		var currentTileType = map.tiles[y][x].type;

		//Check the tiletype from the tiles above and below the current tile
		var aboveTileType = map.tiles[y + 1][x].type;
		var belowTileType = map.tiles[y - 1][x].type;

		//Generate a random number between 1 and 100
		var randomChance = Roguelike.Utils.randomNumber(1, 100);

		//Check if if there is a wall where we place this corridor, and have a random chance to spawn a door
		if(currentTileType === 1 && aboveTileType === 1 && belowTileType === 1 && randomChance > 60) {

			//Create the door entity
			var doorEntity = new Roguelike.Entity();
			doorEntity.addComponent(new Roguelike.Components.Position(x, y));
			doorEntity.addComponent(new Roguelike.Components.Sprite("#FFD900"));

			//Add the entity to the map
			map.entities.addEntity(doorEntity);

			//Add this static object to the tile object
			map.tiles[y][x].staticObject = doorEntity;
			map.tiles[y][x].blockLight = true;

		}

		//Place a floor tile
		if(map.tiles[y + 1][x].staticObject !== null) {

			map.tiles[y][x].type = 1;

		}else if(map.tiles[y - 1][x].staticObject !== null) {

			map.tiles[y][x].type = 1;

		}else{

			map.tiles[y][x].type = 2;

			//Only set block light to false if there isn't a door at this position
			if(map.tiles[y][x].staticObject === null) {

				map.tiles[y][x].blockLight = false;

			}

		}

		//Generate walls below this hallway
		if(map.tiles[y + 1][x].type === 0) {

			map.tiles[y + 1][x].type = 1;

		}

		//Generate walls above this hallway
		if(map.tiles[y - 1][x].type === 0) {

			map.tiles[y - 1][x].type = 1;

		}

	},

	/**
	 * Generate a vertical corridor tile, and also place walls
	 * @protected
	 *
	 * @param {int} prevx - The horizontal position of the tile that has to become a corridor
	 * @param {int} y - The vertical position of the tile that has to become a corridor
	 */
	generateVerticalCorridor: function(prevx, y) {

		//Define the map variable
		var map = this.game.map;

		//If there is a door on our path, we simply remove it! Bye!
		//TODO: Check if the object is indeed a door, not only an object
		if(map.tiles[y][prevx].staticObject !== null) {

			//Get the position of the door
			var index = map.objects.indexOf(map.tiles[y][prevx].staticObject);

			//Remove the object from the tile and the array
			map.objects.splice(index, 1);
			map.tiles[y][prevx].staticObject = null;

		}

		//Set the current tile to floor
		map.tiles[y][prevx].type = 2;
		map.tiles[y][prevx].blockLight = false;

		//Generate walls right from this hallway
		if(map.tiles[y][prevx + 1].type === 0) {
			map.tiles[y][prevx + 1].type = 1;
		}
		//Generate walls left from this hallway
		if(map.tiles[y][prevx - 1].type === 0) {
			map.tiles[y][prevx - 1].type = 1;
		}

	},

	/**
	 * Place the entrance and exit objects on the map
	 * @protected
	 */
	placeEntranceExitObjects: function() {

		//Get the position of the dungeon entrance
		var entrancePosition = this.game.map.entrance;

		//Create the entrance entity
		var entranceEntity = new Roguelike.Entity();

		//Add components to the entrance entity
		entranceEntity.addComponent(new Roguelike.Components.Position(entrancePosition.x, entrancePosition.y));
		entranceEntity.addComponent(new Roguelike.Components.Sprite("#BD2D2D"));

		//Add this entity to the map
		this.game.map.entities.addEntity(entranceEntity);

		//TODO: Make exit object

	}

};
