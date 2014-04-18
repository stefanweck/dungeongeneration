/**
 * Camera constructor
 *
 * @class Roguelike.Camera
 * @classdesc A Camera that follows an object in the viewport on the canvas
 *
 * @param {Roguelike.Game} game - Reference to the current game object
 * @param {object} position - The x and y coordinate of this Camera, in pixels
 */
Roguelike.Camera = function(game, position) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {object} position - The x and y top left coordinates of this camera, in pixels
	 */
	this.position = position;

	/**
	 * @property {number} viewportWidth - The width of the game's canvas, in pixels
	 */
	this.viewportWidth = game.settings.canvas.width;

	/**
	 * @property {number} viewportHeight - The height of the game's canvas, in pixels
	 */
	this.viewportHeight = game.settings.canvas.height;

	/**
	 * @property {number} minimumDistanceX - The minimal distance from horizontal borders before the camera starts to move, in pixels
	 */
	this.minimumDistanceX = 0;

	/**
	 * @property {number} minimumDistanceY - The minimal distance from vertical borders before the camera starts to move, in pixels
	 */
	this.minimumDistanceY = 0;

	/**
	 * @property {object} followObject - The object that should be followed by the camera
	 */
	this.followObject = null;

	/**
	 * @property {Roguelike.Boundary} viewportBoundary - The boundary that represents the viewport
	 */
	this.viewportBoundary = new Roguelike.Boundary(
		this.position.x * game.settings.tileSize,
		this.position.y * game.settings.tileSize,
		this.viewportWidth,
		this.viewportHeight
	);

	/**
	 * @property {Roguelike.Boundary} mapBoundary - The boundary that represents the viewport
	 */
	this.mapBoundary = new Roguelike.Boundary(
		0,
		0,
		game.settings.tilesX * game.settings.tileSize,
		game.settings.tilesY * game.settings.tileSize
	);

};

Roguelike.Camera.prototype = {

	/**
	 * Function to call when you want to follow a specific entity
	 * @protected
	 *
	 * @param {Roguelike.Entity} followEntity - The entity that should be followed by the camera, this entity is required to have the position component
	 * @param {number} minimumDistanceX - The minimal distance from horizontal borders before the camera starts to move
	 * @param {number} minimumDistanceY - The minimal distance from vertical borders before the camera starts to move
	 */
	follow: function(followEntity, minimumDistanceX, minimumDistanceY) {

		//Set the follow object to be the object that's passed along
		//Object needs to have a position component, containing an
		//X and an Y value, in tiles
		this.followObject = followEntity.components.position;

		//Set the minimum distance from the borders of the map
		this.minimumDistanceX = minimumDistanceX;
		this.minimumDistanceY = minimumDistanceY;

	},

	/**
	 * Function to update the camera to a new position, for example following an object
	 * @protected
	 */
	update: function() {

		//Check if the camera even has to move
		if(this.followObject !== null) {

			//Define the variables needed for moving the camera
			var tileSize = this.game.settings.tileSize;

			//Move the camera horizontal first
			if((this.followObject.position.x * tileSize) - this.position.x + this.minimumDistanceX > this.viewportWidth) {

				//Set the new horizontal position for the camera
				this.position.x = (this.followObject.position.x * tileSize) - (this.viewportWidth - this.minimumDistanceX);

			}else if((this.followObject.position.x * tileSize) - this.minimumDistanceX < this.position.x) {

				//Set the new horizontal position for the camera
				this.position.x = (this.followObject.position.x * tileSize) - this.minimumDistanceX;

			}

			//Then move the camera vertical
			if((this.followObject.position.y * tileSize) - this.position.y + this.minimumDistanceY > this.viewportHeight) {

				//Set the new vertical position for the camera
				this.position.y = (this.followObject.position.y * tileSize) - (this.viewportHeight - this.minimumDistanceY);

			}else if((this.followObject.position.y * tileSize) - this.minimumDistanceY < this.position.y) {

				//Set the new vertical position for the camera
				this.position.y = (this.followObject.position.y * tileSize) - this.minimumDistanceY;

			}

		}

		//Now we update our viewport's boundaries
		this.viewportBoundary.set(this.position.x, this.position.y);

		//We don't want the camera leaving the world's boundaries, for obvious reasons
		if(!this.viewportBoundary.isWithin(this.mapBoundary)) {

			//Left
			if(this.viewportBoundary.left < this.mapBoundary.left) {
				this.position.x = this.mapBoundary.left;
			}

			//Top
			if(this.viewportBoundary.top < this.mapBoundary.top) {
				this.position.y = this.mapBoundary.top;
			}

			//Right
			if(this.viewportBoundary.right > this.mapBoundary.right) {
				this.position.x = this.mapBoundary.right - this.viewportWidth;
			}

			//Bottom
			if(this.viewportBoundary.bottom > this.mapBoundary.bottom) {
				this.position.y = this.mapBoundary.bottom - this.viewportHeight;
			}

		}

	}

};
