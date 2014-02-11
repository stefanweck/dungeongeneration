function Map(tileX, TilexY, maxRooms){

    //Map properties
    this.tilesX = tileX;
    this.tilesY = TilexY;
    this.maxRooms = maxRooms;
    this.rooms = [];
    this.corridors = [];
    this.tiles = [];

    //The width and height of a single tile
    this.tileSize = 15;

    //Room properties ( also in tiles )
    this.minRoomWidth = 6;
    this.maxRoomWidth = 12;
    this.minRoomHeight = 6;
    this.maxRoomHeight = 12;

    //Objects that belong to a map
    this.roomFactory = new RoomFactory();

}

Map.prototype.initialize = function initialize(){

    //Loop through every horizontal row
    for(y = 0; y < this.tilesY; y++){

        //Initialize this row
        this.tiles[y] = [];

        //Loop through every vertical row
        for(x = 0; x < this.tilesX; x++){

            //Initialize this position by setting it to zero
            this.tiles[y][x] = 0;

        }

    }

};

Map.prototype.roomIntersectsWith = function roomIntersectsWith(room){

    //Loop through every room in the list
    for (var i = 0; i < this.rooms.length; i++) {

        //Check if the room intersects with the current room
        if(room.x1 <= this.rooms[i].x2 && room.x2 >= this.rooms[i].x1 && room.y1 <= this.rooms[i].y2 && room.y2 >= this.rooms[i].y1){
            return true;
        }

    }
    //If the room doesn't intersect another room, return false
    return false;

};

Map.prototype.addRooms = function addRooms(){

    //Define variables
    var previousExit = [];
    var currentExit = [];

    //Loop through each room in the list
    for (var i = 0; i < this.rooms.length; i++) {

        //Set the last exit to the previous exits variable
        //TODO: Find out why cloning doesn't work
        previousExit['x'] = currentExit['x'];
        previousExit['y'] = currentExit['y'];

        //Loop through every horizontal row
        for(y = this.rooms[i].y1; y < this.rooms[i].y2; y++){

            //What is the current Y position in the layout of the current room
            var layoutYPos = this.rooms[i].y2 - y - 1;

            //Loop through every vertical row
            for(x = this.rooms[i].x1; x < this.rooms[i].x2; x++){

            //What is the current X position in the layout of the current room
            var layoutXPos = this.rooms[i].x2 - x - 1;
            var currentTile = this.rooms[i].layout[layoutYPos][layoutXPos];

                //Place the tile that is on the layout on this position on the map
                this.tiles[y][x] = currentTile;

                //If the current tile is an exit, set the variables for this position
                if(currentTile === 3){
                    currentExit['x'] = x;
                    currentExit['y'] = y;
                }

            }

        }

        //Add corridor when this is not the first room
        if(i !== 0){
            var corridor = {'x' : currentExit['x'], 'y' : currentExit['y'], 'prevx' : previousExit['x'], 'prevy' : previousExit['y']};
            this.corridors.push(corridor);
        }

    }

    //Generate the corridors for these rooms
    this.roomFactory.genereteCorridors(this);

};