/*
* Renderer constructor
* 
* @class Roguelike.Renderer
* @classdesc An object that handles the rendering of the map onto the canvas
* 
*/
Roguelike.Renderer = function(){

    /*
    * @property {array} colors - Contains all the default colors for the tiles
    */
    this.colors = ['#302222','#443939','#6B5B45', '#CCC'];

};

Roguelike.Renderer.prototype = {

    /*
    * Draw the current map onto the canvas
    * @protected
    *
    * @param {Roguelike.Map} map - The map that is going to be drawn onto the canvas
    */
    draw: function(map){

        //Loop through every horizontal row
        for(y = 0; y < map.tilesY; y++){

            //Loop through every vertical row
            for(x = 0; x < map.tilesX; x++){

                //Get the type of the current tile
                var tileType = map.tiles[y][x].type;

                //Get the corrosponding color of this tile from the array of colors
                oContext.fillStyle = this.colors[tileType];

                //Create a rectangle!
                oContext.fillRect(x * map.tileSize, y * map.tileSize, map.tileSize, map.tileSize);

            }

        }

    }

};