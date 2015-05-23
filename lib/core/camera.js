//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Boundary = require('../geometry/boundary.js');

/**
 * Camera constructor
 *
 * @class Camera
 * @classdesc A Camera that follows an object in the viewport on the canvas
 *
 * @param {Game} game - Reference to the current game object
 * @param {Object} position - The x and y coordinate of this Camera, in pixels
 */
var Camera = function(game, position) {

	/**
	 * @property {Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Vector2} position - The x and y top left coordinates of this camera, in pixels
	 */
	this.position = position;

	/**
	 * @property {Number} viewportWidth - The width of the game's canvas, in pixels
	 */
	this.viewportWidth = game.sizeManager.width;

	/**
	 * @property {Number} viewportHeight - The height of the game's canvas, in pixels
	 */
	this.viewportHeight = game.sizeManager.height;

	/**
	 * @property {Number} minimumDistanceX - The minimal distance from horizontal borders before the camera starts to move, in pixels
	 */
	this.minimumDistanceX = 0;

	/**
	 * @property {Number} minimumDistanceY - The minimal distance from vertical borders before the camera starts to move, in pixels
	 */
	this.minimumDistanceY = 0;

	/**
	 * @property {Object} followObject - The object that should be followed by the camera
	 */
	this.followObject = null;

	/**
	 * @property {Boundary} viewportBoundary - The boundary that represents the viewport
	 */
	this.viewportBoundary = new Boundary(
		this.position.x * (game.settings.tileSize * this.game.settings.zoom),
		this.position.y * (game.settings.tileSize * this.game.settings.zoom),
		this.viewportWidth,
		this.viewportHeight
	);

	/**
	 * @property {Boundary} mapBoundary - The boundary that represents the viewport
	 */
	this.mapBoundary = new Boundary(
		0,
		0,
		game.settings.tilesX * (game.settings.tileSize * this.game.settings.zoom),
		game.settings.tilesY * (game.settings.tileSize * this.game.settings.zoom)
	);

};

Camera.prototype = {

	/**
	 * Function to call when you want to follow a specific entity
	 * @public
	 *
	 * @param {Entity} followEntity - The entity that should be followed by the camera, this entity is required to have the position component
	 * @param {Number} minimumDistanceX - The minimal distance from horizontal borders before the camera starts to move
	 * @param {Number} minimumDistanceY - The minimal distance from vertical borders before the camera starts to move
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
	 * @public
	 */
	update: function() {

		//Check if the camera even has to move
		if(this.followObject !== null) {

			//Define the variables needed for moving the camera
			var tileSize = this.game.map.settings.tileSize * this.game.settings.zoom;
			var newPosition = {
				x : this.position.x,
				y : this.position.y
			};

			//Calculate the center position of the object that we are following
			var followCenterX = (this.followObject.position.x * tileSize) + (tileSize / 2);
			var followCenterY = (this.followObject.position.y * tileSize) + (tileSize / 2);

			//Move the camera horizontal first
			//We Math.floor the final position so the position is always a rounded number. This prevents the pixel scaling from trying to enlarge half pixels and thus providing weird graphics.
			if(followCenterX - this.position.x + this.minimumDistanceX > this.viewportWidth) {

				//Set the new horizontal position for the camera
				newPosition.x = Math.floor(followCenterX - (this.viewportWidth - this.minimumDistanceX));

			}else if(followCenterX - this.minimumDistanceX < this.position.x) {

				//Set the new horizontal position for the camera
				newPosition.x = Math.floor(followCenterX - this.minimumDistanceX);

			}

			//Then move the camera vertical
			//We Math.floor the final position so the position is always a rounded number. This prevents the pixel scaling from trying to enlarge half pixels and thus providing weird graphics.
			if(followCenterY - this.position.y + this.minimumDistanceY > this.viewportHeight) {

				//Set the new vertical position for the camera
				newPosition.y = Math.floor(followCenterY - (this.viewportHeight - this.minimumDistanceY));

			}else if(followCenterY - this.minimumDistanceY < this.position.y) {

				//Set the new vertical position for the camera
				newPosition.y = Math.floor(followCenterY - this.minimumDistanceY);

			}

		}

		//Now we update our viewport's boundaries
		this.viewportBoundary.set(newPosition.x, newPosition.y);

		//Check if we don't want the camera leaving the world's boundaries, and if it's needed to correct that
		if(this.game.settings.cameraBounds && !this.viewportBoundary.isWithin(this.mapBoundary)) {

			//Left
			if(this.viewportBoundary.left < this.mapBoundary.left) {
				newPosition.x = this.mapBoundary.left;
			}

			//Top
			if(this.viewportBoundary.top < this.mapBoundary.top) {
				newPosition.y = this.mapBoundary.top;
			}

			//Right
			if(this.viewportBoundary.right > this.mapBoundary.right) {
				newPosition.x = this.mapBoundary.right - this.viewportWidth;
			}

			//Bottom
			if(this.viewportBoundary.bottom > this.mapBoundary.bottom) {
				newPosition.y = this.mapBoundary.bottom - this.viewportHeight;
			}

		}

		var oldPosition = {
			x : this.position.x,
			y : this.position.y
		};

		TweenMax.to(oldPosition, 0.5, {
			x : newPosition.x,
			y : newPosition.y,
			onUpdate: function () {
				this.position.x = Math.ceil(oldPosition.x);
				this.position.y = Math.ceil(oldPosition.y);
			},
			onUpdateScope: this
		});

	}

};

//Export the Browserify module
module.exports = Camera;
