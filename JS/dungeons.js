//Initialize variables
var oCanvas;
var oContext;

window.onload = function(){

    initializeCanvas();

}

function initializeCanvas(){

    //Initialize the canvas
    oCanvas = document.getElementById("canvas");
    oContext = oCanvas.getContext("2d");

    //Set the width and height of the canvas
    oCanvas.width = 900;
    oCanvas.height = 600;

    //Set click event to the canvas
    oCanvas.addEventListener('click', initializeMap, false);

    //Initialize the map object
    initializeMap();

}

function initializeMap(){

    //Create and initialize the map object
    oMap = new Map();
    oMap.initialize();

    //Generate rooms for this map
    oMap.generateRooms();
    oMap.addRooms();

    //Draw the map on canvas
    oMap.draw();

}

function Map(){

    //Map properties
    this.tilesX = 36;
    this.tilesY = 24;
    this.maxRooms = 5;
    this.rooms = [];
    this.tiles = [];

    //The width and height of a single tile
    this.tileSize = 25;

    //Room properties ( also in tiles )
    this.minRoomWidth = 4;
    this.maxRoomWidth = 8;
    this.minRoomHeight = 4;
    this.maxRoomHeight = 8;

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

}

Map.prototype.generateRooms = function generateRooms(){

    //Maximum number of tries before stopping the placement of more rooms
    var maxTries = this.maxRooms + 10;
    var tries = 0;

    //Create rooms and add them to the list
    while (this.rooms.length < this.maxRooms) {

        //Check if the limit has been reached, this prevents the while loop from crashing your page
        //We assume there is no space left on the map and break the loop
        if(tries >= maxTries){
            break;
        }

        //Generate random values ( in tiles )
        var w = randomNumber(this.minRoomWidth, this.maxRoomWidth);
        var h = randomNumber(this.minRoomHeight, this.maxRoomHeight);
        var x = randomNumber(1, this.tilesX - w - 1);
        var y = randomNumber(1, this.tilesY - h - 1);

        //Create a new room with these values
        var oRoom = new Room(x, y, w, h);

        //We tryed to create a room at a certain position
        tries++;

        //Check if this room intersects with the other rooms, if not, add it to the list
        if(!oRoom.intersects(this.rooms)){
            this.rooms.push(oRoom);
            //Reset tries back to zero, giving the next room equal chances of spawning
            var tries = 0;
        }

    };

}

Map.prototype.addRooms = function addRooms(){

    //Loop through each room in the list
    for (var i = 0; i < this.rooms.length; i++) {

        //Loop through every horizontal row
        for(y = this.rooms[i].y1; y < this.rooms[i].y2; y++){

            //Loop through every vertical row
            for(x = this.rooms[i].x1; x < this.rooms[i].x2; x++){

                //Dig out this place on the map!
                this.tiles[y][x] = 1;

            }

        }

    }

}

Map.prototype.draw = function draw(){

    //Loop through every horizontal row
    for(y = 0; y < this.tilesY; y++){

        //Loop through every vertical row
        for(x = 0; x < this.tilesX; x++){

            //Create different colors for each type of tile
            switch(this.tiles[y][x]){

                //This could be done a little bit better in the next version
                case(0):
                    oContext.fillStyle = 'black';
                break;
                case(1):
                    oContext.fillStyle = 'white';
                break;

            }

            //Create a rectangle!
            oContext.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);

        }

    }

}

function Room(x, y, w, h){

    //Coordinates of every corner of the room
    this.x1 = x;
    this.x2 = w + x;
    this.y1 = y;
    this.y2 = y + h;

    //Widht and height of the room in number of tiles
    this.w = w;
    this.h = h;

    //Position of this room on the grid
    this.xPos = x * 25;
    this.yPos = y * 25;

}

Room.prototype.intersects = function intersects(rooms){

    //Loop through every room in the list
    for (var i = 0; i < rooms.length; i++) {

        //Check if the room intersects with the current room
        if(this.x1 <= rooms[i].x2 && this.x2 >= rooms[i].x1 && this.y1 <= rooms[i].y2 && this.y2 >= rooms[i].y1){
            return true;
        }

    }
    //If the room doesn't intersect another room, return false
    return false;

}

function randomNumber(from,to){

    //Function to generate a random number
    return Math.floor(Math.random()*(to-from+1)+from);

}