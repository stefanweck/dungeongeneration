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
            if(y === 0 || y === this.h - 1 || x === 0 || x === this.w - 1){
                this.layout[y][x] = 1;
            }else{
                this.layout[y][x] = 2;
            }

        }

    }

};

Room.prototype.generateExit = function generateExit(){

    //Add an exit on one of the sides of the wall
    switch(randomNumber(1,4)){

        case(1): //Top
            this.layout[0][randomNumber(1, this.w - 2)] = 3;
        break;

        case(2): //Right
            this.layout[randomNumber(1, this.h - 2)][this.w - 1] = 3;
        break;

        case(3): //Bottom
            this.layout[this.h - 1][randomNumber(1, this.w - 2)] = 3;
        break;

        case(4): //Left
            this.layout[randomNumber(1, this.h - 2)][0] = 3;
        break;

    }

};