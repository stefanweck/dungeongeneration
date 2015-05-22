//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Vector2 = require('../../geometry/vector2.js');

/**
 * LightMap System constructor
 *
 * @class LightMap
 * @classdesc The lightmap system recalculates the lightmap and makes sure that explored areas are visible
 * Inherits from PIXI.ParticleContainer
 *
 * @param {Game} game - Reference to the currently running game
 */
var LightMap = function(game) {

	/**
	 * Inherit the constructor from the PIXI.ParticleContainer object
	 */
	PIXI.ParticleContainer.call(this, null, {
        alpha: true
    });

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Object} mapSize - The size of the current map
	 */
	this.mapSize = {x: game.map.settings.tilesX, y: game.map.settings.tilesY};

	/**
	 * @property {Object} tiles - Object that is being used to store tile data before returning it
	 */
	this.tiles = [];

	/**
	 * @property {Array} pixitiles - An array that holds all lightmap objects
	 */
	this.pixitiles = [];

	/**
	 * @property {Array} mult - Multipliers for transforming coordinates into other octants
	 */
	this.mult = [
		[1, 0, 0, -1, -1, 0, 0, 1],
		[0, 1, -1, 0, 0, -1, 1, 0],
		[0, 1, 1, 0, 0, -1, -1, 0],
		[1, 0, 0, 1, -1, 0, 0, -1]
	];

	/**
	 * @property {Boolean} tilesLit - Boolean to see if game tiles have been lit
	 */
	this.tilesLit = false;

	//Initialize itself
	this.initialize();

};

//Inherit the prototype from the PIXI.ParticleContainer
LightMap.prototype = Object.create(PIXI.ParticleContainer.prototype);
LightMap.prototype.constructor = LightMap;

/**
 * Initialize the layout of the lightmap
 * @private
 */
LightMap.prototype.initialize = function() {

	//Loop through every horizontal row
	for(var x = 0; x < this.game.map.settings.tilesX; x++) {

		this.pixitiles[x] = [];

		//Loop through every vertical row
		for(var y = 0; y < this.game.map.settings.tilesY; y++) {

			this.pixitiles[x][y] = PIXI.Sprite.fromFrame("void.png");

			this.pixitiles[x][y].position.x = x * this.game.map.settings.tileSize;
			this.pixitiles[x][y].position.y = y * this.game.map.settings.tileSize;

			//Add the tile to the container
			this.addChild(this.pixitiles[x][y]);

		}

	}

	this.game.world.addChild(this);

};

/**
 * Function that gets called when the game continues one tick
 * @public
 */
LightMap.prototype.update = function() {

	if(this.game.isActive) {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.get("lightSource", "position");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++) {

			//Perform the needed operations for this specific system on one entity
			this.handleSingleEntity(entities[i]);

		}

		this.tilesLit = true;

	}else if(this.tilesLit) {

		this.clear();
		this.tilesLit = false;

	}

};

/**
 * Performs the needed operations for this specific system on one entity
 * @public
 *
 * @param {Entity} entity - The entity that is being processed by this system
 */
LightMap.prototype.handleSingleEntity = function(entity) {

	//Get the keyboardControl component
	var lightSourceComponent = entity.getComponent("lightSource");
	var positionComponent = entity.getComponent("position");

	//Update the lightsource
	var newLight = this.clear().concat(this.calculate(lightSourceComponent, positionComponent.position));

	//Update the tiles on the map with the new light levels
	for(var l = 0; l < newLight.length; l++) {

		//If the tile hasn't been explored before
		if(!this.game.map.tiles[newLight[l].x][newLight[l].y].explored) {

			//Change the alpha of the lightmap tile to match the light level
			this.pixitiles[newLight[l].x][newLight[l].y].alpha = 1 - newLight[l].lightLevel;

			//Set the tile explored to true
			this.game.map.tiles[newLight[l].x][newLight[l].y].explored = true;

		}else{

			//If the light level is below 0.7 change it according to the light level
			if(1 - newLight[l].lightLevel < 0.7) {

				this.pixitiles[newLight[l].x][newLight[l].y].alpha = 1 - newLight[l].lightLevel;
				this.game.map.tiles[newLight[l].x][newLight[l].y].lightLevel = newLight[l].lightLevel;

			}else{

				this.pixitiles[newLight[l].x][newLight[l].y].alpha = 0.7;
				this.game.map.tiles[newLight[l].x][newLight[l].y].lightLevel = 0.7;

			}

		}

	}

};

/**
 * Function that checks if a tile blocks light or not
 * @private
 *
 * @param {Number} x - The X position of the tile
 * @param {Number} y - The Y position of the tile
 *
 * @return {Boolean} True when the tile does block light, false when the tile doesn't block light
 */
LightMap.prototype.doesTileBlock = function(x, y) {

	return this.game.map.tiles[x][y].blockLight;

};

/**
 * Function to calculate a new octant
 * @private
 */
LightMap.prototype.calculateOctant = function(position, row, start, end, lightsource, xx, xy, yx, yy, id) {

	this.tiles.push({
		x: position.x,
		y: position.y,
		lightLevel: 0
	});

	var newStart = 0;

	if(start < end) {
		return;
	}

	var radiusSquared = lightsource.radius * lightsource.radius;

	for(var i = row; i < lightsource.radius + 1; i++) {
		var dx = -i - 1;
		var dy = -i;

		var blocked = false;

		while(dx <= 0) {

			dx += 1;

			var X = position.x + dx * xx + dy * xy;
			var Y = position.y + dx * yx + dy * yy;

			if(X < this.mapSize.x && X >= 0 && Y < this.mapSize.y && Y >= 0) {

				var lSlope = (dx - 0.5) / (dy + 0.5);
				var rSlope = (dx + 0.5) / (dy - 0.5);

				if(start < rSlope) {
					continue;
				}else if(end > lSlope) {
					break;
				}else{
					if(dx * dx + dy * dy < radiusSquared) {
						var pos1 = new Vector2(X, Y);
						var pos2 = position;
						var d = (pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.y - pos2.y) * (pos1.y - pos2.y);

						this.tiles.push({
							x: X,
							y: Y,
							lightLevel: (lightsource.gradient === false) ? 1 : (1 - (d / (lightsource.radius * lightsource.radius)))
						});
					}

					if(blocked) {
						if(this.doesTileBlock(X, Y)) {
							newStart = rSlope;
							continue;
						}else{
							blocked = false;
							start = newStart;
						}
					}else{
						if(this.doesTileBlock(X, Y) && i < lightsource.radius) {
							blocked = true;
							this.calculateOctant(position, i + 1, start, lSlope, lightsource, xx, xy, yx, yy, id + 1);

							newStart = rSlope;
						}
					}
				}
			}
		}

		if(blocked) {
			break;
		}

	}

};

/**
 * Sets flag lit to false on all tiles within radius of position specified
 * @private
 *
 * @return {Array} An empty array
 */
LightMap.prototype.clear = function() {

	var i = this.tiles.length;
	while(i--) {
		this.tiles[i].lightLevel = 0;
	}

	var o = this.tiles;
	this.tiles = [];
	return o;

};

/**
 * Calculate the new lightning from this lightsource
 * @private
 *
 * @param {LightSource} lightSource - The lightsource that is being calculated
 * @param {Position} position - The position of the lightsource
 *
 * @return {Array} An array containing all tiles
 */
LightMap.prototype.calculate = function(lightSource, position) {

	for(var i = 0; i < 8; i++) {

		this.calculateOctant(position, 1, 1.0, 0.0, lightSource,
			this.mult[0][i], this.mult[1][i], this.mult[2][i], this.mult[3][i], 0);

	}

	//Push this tile and it's light level's in the tiles array
	this.tiles.push({
		x: position.x,
		y: position.y,
		lightLevel: 1
	});

	//Return the tiles
	return this.tiles;
};

//Export the Browserify module
module.exports = LightMap;
