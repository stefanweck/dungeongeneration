function Map(){

    //Map properties
    this.tilesX = 60;
    this.tilesY = 40;
    this.maxRooms = 8;
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

            //The room doesn't intersect, initialize the room layout
            oRoom.initialize();
            oRoom.generateExit();

            //Add the room to the room list
            this.rooms.push(oRoom);

            //Reset tries back to zero, giving the next room equal chances of spawning
            var tries = 0;

        }

    };

}

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

    //After all the rooms are placed, go and generate the corridors
    for(i = 0; i < this.corridors.length; i++){

        //Generate a corridor from this position to the previous room's exit
        this.generateCorridors(this.corridors[i].x, this.corridors[i].y, this.corridors[i].prevx, this.corridors[i].prevy);

    }

}

Map.prototype.generateCorridors = function generateCorridors(x, y, prevx, prevy){

    var xDifference = prevx - x;
    var yDifference = prevy - y;

    if((x - prevx) > 0){

        //If the difference is positive
        for(i = x; i >= prevx; i--){

            this.tiles[y][i] = 2;

            if(this.tiles[y + 1][i] === 0){
                this.tiles[y + 1][i] = 1;
            }
            if(this.tiles[y - 1][i] === 0){
                this.tiles[y - 1][i] = 1;
            }


        }
    }else{
        
        //If the difference is negative
        for(i = x; i <= prevx; i++){

            this.tiles[y][i] = 2;

            if(this.tiles[y + 1][i] === 0){
                this.tiles[y + 1][i] = 1;
            }
            if(this.tiles[y - 1][i] === 0){
                this.tiles[y - 1][i] = 1;
            }

        }
    }

    if((y - prevy) > 0){
        
        //If the difference is positive
        for(i = y; i >= prevy; i--){

            this.tiles[i][prevx] = 2;

            if(this.tiles[i][prevx + 1] === 0){
                this.tiles[i][prevx + 1] = 1;
            }
            if(this.tiles[i][prevx - 1] === 0){
                this.tiles[i][prevx - 1] = 1;
            }

        }
    }else{
        
        //If the difference is negative
        for(i = y; i <= prevy; i++){

            this.tiles[i][prevx] = 2;

            if(this.tiles[i][prevx + 1] === 0){
                this.tiles[i][prevx + 1] = 1;
            }
            if(this.tiles[i][prevx - 1] === 0){
                this.tiles[i][prevx - 1] = 1;
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
                    oContext.fillStyle = 'grey';
                break;
                case(2):
                    oContext.fillStyle = 'white';
                break;
                case(3):
                    oContext.fillStyle = 'red';
                break;
                case(4):
                    oContext.fillStyle = 'blue';
                break;

            }

            //Create a rectangle!
            oContext.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);

        }

    }

}