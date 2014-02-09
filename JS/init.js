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