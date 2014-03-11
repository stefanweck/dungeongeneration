/**
 * LightSource constructor
 *
 * Changed and used code from:
 * http://heyjavascript.com/shadowcasting-field-of-view-on-canvas-with-javascript/
 *
 * @class Roguelike.LightSource
 * @classdesc The object that is responsible for generating rooms and corridors
 *
 * @param {Roguelike.Game} game - Reference to the current game object
 * @param {object} options - The object that holds all options for this lightsource
 */
Roguelike.LightSource = function(game, options) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {bool} gradient - Should the lightmap be drawn with a gradient
	 */
	this.gradient = options.gradient;

	/**
	 * @property {object} mapSize - The size of the current map
	 */
	this.mapSize = {x: game.map.tilesX, y: game.map.tilesY};

	/**
	 * @property {object} tiles - Object that is being used to store tile data before returning it
	 */
	this.tiles = [];

	/**
	 * @property {object} position - The current position of the light source
	 */
	this.position = new Roguelike.Vector2(-1, -1);

	/**
	 * @property {int} radius - The radius of the light, how far does it shine it's magical light!
	 */
	this.radius = options.radius;

	/**
	 * @property {object} oldRadius
	 */
	this.oldRadius = options.radius;

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

Roguelike.LightSource.prototype = {

	/**
	 * Function that checks if a tile blocks light or not
	 * @protected
	 *
	 * @param {int} x - The X position of the tile
	 * @param {int} y - The Y position of the tile
	 */
	doesTileBlock: function(x, y) {
		return this.game.map.tiles[y][x].blockLight;
	},

	/**
	 * Calculates an octant. Called by the this.calculate when calculating lighting
	 * @protected
	 */
	calculateOctant: function(cx, cy, row, start, end, radius, xx, xy, yx, yy, id) {
		this.tiles.push({
			x: cx,
			y: cy,
			lightLevel: 0
		});

		var new_start = 0;

		if(start < end) return;

		var radius_squared = radius * radius;

		for(var i = row; i < radius + 1; i++) {
			var dx = -i - 1;
			var dy = -i;

			var blocked = false;

			while(dx <= 0) {

				dx += 1;

				var X = cx + dx * xx + dy * xy;
				var Y = cy + dx * yx + dy * yy;

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
							var pos2 = this.position;
							var d = (pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.y - pos2.y) * (pos1.y - pos2.y);

							this.tiles.push({
								x: X,
								y: Y,
								lightLevel: (this.gradient === false) ? 1 : (1 - (d / (this.radius * this.radius)))
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
							if(this.doesTileBlock(X, Y) && i < radius) {
								blocked = true;
								this.calculateOctant(cx, cy, i + 1, start, l_slope, this.radius, xx, xy, yx, yy, id + 1);

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
	 */
	calculate: function() {
		for(var i = 0; i < 8; i++) {
			this.calculateOctant(this.position.x, this.position.y, 1, 1.0, 0.0, this.radius,
				this.mult[0][i], this.mult[1][i], this.mult[2][i], this.mult[3][i], 0);
		}

		//Push this tile and it's light level's in the tiles array
		this.tiles.push({
			x: this.position.x,
			y: this.position.y,
			lightLevel: 1
		});

		//Return the tiles
		return this.tiles;
	},

	/**
	 * Update the position of the lightsource and calculate light again
	 * @protected
	 *
	 * @param {int} x - The X position of the lightsource
	 * @param {int} y - The Y position of the lightsource
	 */
	update: function(x, y) {
		this.position = new Roguelike.Vector2(x, y);
		return this.clear().concat(this.calculate());
	}

};
