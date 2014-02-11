//TODO
//Add default settings, just like jquery's extend options

//Initialize variables
var oCanvas;
var oContext;

window.onload = function(){

    initializeCanvas();

};

function initializeCanvas(){

    //Initialize the canvas
    oCanvas = document.getElementById("canvas");
    oContext = oCanvas.getContext("2d");

    //Set the width and height of the canvas
    oCanvas.width = 900;
    oCanvas.height = 600;

    //Set click event to the canvas
    oCanvas.addEventListener('click', function(){
        dungeon = new Dungeon(60, 40, 10);
    }, false);

    //Create a new dungeon
    var dungeon = new Dungeon(
        //Tiles X
        60,
        //Tiles Y
        40,
        //Maximum number of rooms
        10
    );

}