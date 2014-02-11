function Renderer(){

    //Renderer properties
    this.colors = ['black','grey','white'];

}

Renderer.prototype.draw = function draw(map){

    //Loop through every horizontal row
    for(y = 0; y < map.tilesY; y++){

        //Loop through every vertical row
        for(x = 0; x < map.tilesX; x++){

            //Get the type of the current tile
            var tileType = map.tiles[y][x];

            //Get the corrosponding color of this tile from the array of colors
            oContext.fillStyle = this.colors[tileType];

            //Create a rectangle!
            oContext.fillRect(x * map.tileSize, y * map.tileSize, map.tileSize, map.tileSize);

        }

    }

};