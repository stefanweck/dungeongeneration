/**
 * LightMap System constructor
 *
 * @class Roguelike.Systems.LightMap
 * @classdesc The lightmap system recalculates the lightmap and makes sure that explored areas are visible
 *
 * @param {Roguelike.Game} game - Reference to the currently running game
 */
Roguelike.Systems.LightMap = function(game) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {object} mapSize - The size of the current map
	 */
	this.mapSize = {x: game.map.tilesX, y: game.map.tilesY};

	/**
	 * @property {object} tiles - Object that is being used to store tile data before returning it
	 */
	this.tiles = [];

	/**
	 * @property {array} mult - Multipliers for transforming coordinates into other octants
	 */
	this.mult = [
		[1, 0, 0, -1, -1, 0, 0, 1],
		[0, 1, -1, 0, 0, -1, 1, 0],
		[0, 1, 1, 0, 0, -1, -1, 0],
		[1, 0, 0, 1, -1, 0, 0, -1]
	];

};

Roguelike.Systems.LightMap.prototype = {

	/**
	 * Function that gets called when the game continues one tick
	 * @protected
	 */
	update: function() {

		//Then loop through all keyboardControl Entities and check the user input, and handle accordingly
		var entities = this.game.map.entities.getEntities("lightSource", "position");

		//Loop through all matching entities
		for(var i = 0; i < entities.length; i++) {

			//Perform the needed operations for this specific system on one entity
			this.handleSingleEntity(entities[i]);

		}

	},

	/**
	 * Performs the needed operations for this specific system on one entity
	 * @protected
	 *
	 * @param {Roguelike.Entity} entity - The entity that is being processed by this system
	 */
	handleSingleEntity : function(entity){

		//Get the keyboardControl component
		var lightSourceComponent = entity.getComponent("lightSource");
		var positionComponent = entity.getComponent("position");

		//Update the lightsource
		var newLight = this.clear().concat(this.calculate(lightSourceComponent, positionComponent.position));

		//Update the tiles on the map with the new light levels
		for(var l = 0; l < newLight.length; l++) {

			this.game.map.tiles[newLight[l].x][newLight[l].y].lightLevel = newLight[l].lightLevel;
			this.game.map.tiles[newLight[l].x][newLight[l].y].explored = true;

		}

	},

	/**
	 * Function that checks if a tile blocks light or not
	 * @protected
	 *
	 * @param {number} x - The X position of the tile
	 * @param {number} y - The Y position of the tile
	 */
	doesTileBlock: function(x, y) {

		return this.game.map.tiles[x][y].blockLight;

	},

	/**
	 * Function to calculate a new octant
	 * @protected
	 */
	calculateOctant: function(position, row, start, end, lightsource, xx, xy, yx, yy, id) {

		this.tiles.push({
			x: position.x,
			y: position.y,
			lightLevel: 0
		});

		var new_start = 0;

		if(start < end) return;

		var radius_squared = lightsource.radius * lightsource.radius;

		for(var i = row; i < lightsource.radius + 1; i++) {
			var dx = -i - 1;
			var dy = -i;

			var blocked = false;

			while(dx <= 0) {

				dx += 1;

				var X = position.x + dx * xx + dy * xy;
				var Y = position.y + dx * yx + dy * yy;

				if(X < this.mapSize.x && X >= 0 && Y < this.mapSize.y && Y >= 0) {

					var l_slope = (dx - 0.5) / (dy + 0.5);
					var r_slope = (dx + 0.5) / (dy - 0.5);

					if(start < r_slope) {
						continue;
					}else if(end > l_slope) {
						break;
					}else{
						if(dx * dx + dy * dy < radius_squared) {
							var pos1 = new Roguelike.Vector2(X, Y);
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
								new_start = r_slope;
								continue;
							}else{
								blocked = false;
								start = new_start;
							}
						}else{
							if(this.doesTileBlock(X, Y) && i < lightsource.radius) {
								blocked = true;
								this.calculateOctant(position, i + 1, start, l_slope, lightsource, xx, xy, yx, yy, id + 1);

								new_start = r_slope;
							}
						}
					}
				}
			}

			if(blocked) break;
		}

	},

	/**
	 * Sets flag lit to false on all tiles within radius of position specified
	 * @protected
	 */
	clear: function() {

		var i = this.tiles.length;
		while(i--) {
			this.tiles[i].lightLevel = 0;
		}

		var o = this.tiles;
		this.tiles = [];
		return o;

	},

	/**
	 * Calculate the new lightning from this lightsource
	 * @protected
	 *
	 * @param {Roguelike.Components.LightSource} lightSource - The lightsource that is being calculated
	 * @param {Roguelike.Components.Position} position - The position of the lightsource
	 */
	calculate: function(lightSource, position) {

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
	}

};
