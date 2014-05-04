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

	/**
	 * @property {Roguelike.Map} map - Reference to the current map
	 */
	this.map = game.map;

};

Roguelike.MapFactory.prototype = {

	/**
	 * This function calls all the functions in the right order to generate the map
	 * @protected
	 */
	generateRooms: function() {

		//Generate the first room of the map
		this.generateEntranceRoom();

		//Generate the path to the exit room
		this.generateRoomsToExit();

	},

	/**
	 * Generate the first room of the map
	 * @protected
	 */
	generateEntranceRoom: function() {

		//Create a new room that will serve as the entrance room
		var newRoom = this.newRoom();

		//TODO: Only initialize if the room fits
		newRoom.initialize();

		//Place the room on the map
		this.placeRoom(newRoom);

		//Let the room return a random position
		var entrancePosition = newRoom.getRandomPosition();

		//Get a new instance of a map entrance
		var entranceEntity = Roguelike.PropFactory.newEntrance(this.game, entrancePosition);

		//Add the entity to the map
		this.map.entities.addEntity(entranceEntity);

		//Tell the map where the player should enter the map
		this.map.entrance = entrancePosition;

		//Define the just generated map as the entrance room of the map
		//It is the first room in the path to the exit
		this.map.roomsToExit.push(newRoom);

	},

	generateRoomsToExit: function(){

		//Maximum number of tries before stopping the placement of more rooms
		var maxTries = 15;
		var tries = 0;

		//Create rooms and add them to the list
		while(this.map.roomsToExit.length < this.map.settings.maxMainRooms) {

			//Check if the limit has been reached, this prevents the while loop from crashing your page
			//We assume there is no space left on the map and break the loop
			if(tries >= maxTries) {
				break;
			}

			//We tried to create a room at a certain position
			tries++;

		}

	},

	newRoom: function(){

		//Generate random values ( in tiles )
		//Start with generating a random width
		var w = Roguelike.Utils.randomNumber(
			this.game.map.settings.minRoomWidth,
			this.game.map.settings.maxRoomWidth
		);

		//Generate a random height for the room
		var h = Roguelike.Utils.randomNumber(
			this.game.map.settings.minRoomHeight,
			this.game.map.settings.maxRoomHeight
		);

		//Generate a random width horizontal position for the room
		var x = Roguelike.Utils.randomNumber(
			1,
			this.game.map.settings.tilesX - w - 1
		);

		//Generate a random vertical position for the room
		var y = Roguelike.Utils.randomNumber(
			1,
			this.game.map.settings.tilesY - h - 1
		);

		//Create a new room with these values and return it
		return new Roguelike.Room(x, y, w, h);

	},

	/**
	 * Places a room on the map
	 * @protected
	 */
	placeRoom: function(room) {

		//Loop through every horizontal row
		for(var x = room.x1; x < room.x2; x++) {

			//What is the current Y position in the layout of the current room
			var layoutXPos = room.x2 - x - 1;

			//Loop through every vertical row
			for(var y = room.y1; y < room.y2; y++) {

				//What is the current X position in the layout of the current room
				var layoutYPos = room.y2 - y - 1;

				//Place the tile that is on the layout on this position on the map
				this.game.map.tiles[x][y] = room.layout[layoutXPos][layoutYPos];

			}

		}

	}

	//Functie die een kamer als input krijg, daar een random zijkant en positie van pakt en van daar uit
	//gaat kijken of er een gang moet komen en dan een nieuw kamer daar plaatst
	//Zo krijg je een chain aan kamers die naar de exit gaan

	//RoomList, alle rooms
	//NormalRoomList, de rooms van begin tot einde
	//EntranceRoom
	//ExitRoom
	//MediumRoomList
	//HeavyRoomList

};
