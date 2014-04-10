/**
 * MapFactory constructor
 *
 * @class Roguelike.MapFactory
 * @classdesc The factory that is responsible for returning maps and corridors
 *
 * @param {Roguelike.Game} game - Reference to the current game object
 */
Roguelike.MapFactory = {

	/**
	 * Generate a random amount of rooms and add them to the room list
	 * @protected
	 *
	 * @param {Object} settings - An object that holds all settings
	 */
	generateRooms: function(settings) {

		//Define variables
		var rooms = [];

		//Maximum number of tries before stopping the placement of more rooms
		var maxTries = 10;
		var tries = 0;

		//Create rooms and add them to the list
		while(rooms.length < settings.maxRooms) {

			//Check if the limit has been reached, this prevents the while loop from crashing your page
			//We assume there is no space left on the map and break the loop
			if(tries >= maxTries) {
				break;
			}

			//Generate random values ( in tiles )
			//Start with generating a random width
			var w = Roguelike.Utils.randomNumber(
				settings.minRoomWidth,
				settings.maxRoomWidth
			);

			//Generate a random height for the room
			var h = Roguelike.Utils.randomNumber(
				settings.minRoomHeight,
				settings.maxRoomHeight
			);

			//Generate a random width horizontal position for the room
			var x = Roguelike.Utils.randomNumber(
				1,
				settings.tilesX - w - 1
			);

			//Generate a random vertical position for the room
			var y = Roguelike.Utils.randomNumber(
				1,
				settings.tilesY - h - 1
			);

			//Create a new room with these values
			var room = new Roguelike.Room(x, y, w, h);

			//We tried to create a room at a certain position
			tries++;

			//Check if this room intersects with the other rooms, if not, add it to the list
			if(!this.intersectsWith(rooms, room)) {

				//The room doesn't intersect, initialize the room layout
				room.initialize();
				room.generateExit();

				//Add the room to the room list
				rooms.push(room);

				//Reset tries back to zero, giving the next room equal chances of spawning
				tries = 0;

			}

		}

		//We have generated all the rooms, return the rooms
		return rooms;

	},

	/**
	 * Check if a single room overlaps a room that is already on the map
	 * @protected
	 *
	 * @param {Array} list - The list of room objects
	 * @param {Roguelike.Room} object - The room object that has to be checked
	 */
	intersectsWith: function(list, object) {

		//Loop through every room in the list
		for(var i = 0; i < list.length; i++) {

			//Check if the room intersects with the current room
			if(object.x1 <= list[i].x2 && object.x2 >= list[i].x1 && object.y1 <= list[i].y2 && object.y2 >= list[i].y1) {
				return true;
			}

		}
		//If the room doesn't intersect another room, return false
		return false;

	}

};
