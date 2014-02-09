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

    //Layout of the room
    this.layout = [];

}

Room.prototype.initialize = function initialize(){

    //Loop through every horizontal row
    for(y = 0; y < this.h; y++){

        //Initialize this row
        this.layout[y] = [];

        //Loop through every vertical row
        for(x = 0; x < this.w; x++){

            //Check if the position filled has to be a wall or floor
            if(y == 0 || y == this.h - 1 || x == 0 || x == this.w - 1){
                this.layout[y][x] = 1; 
            }else{
                this.layout[y][x] = 2;  
            }

        }

    }

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