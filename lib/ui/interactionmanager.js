//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

/**
 * InteractionManager constructor
 *
 * @class InteractionManager
 * @classdesc An object that manages all mouse interaction and interactive elements
 *
 * @param {Object} target - The target of this interaction manager
 */
var InteractionManager = function(target) {

	/**
	 * @property {Object} target - The target of this interaction manager
	 */
	this.target = target;

	/**
	 * @property {Object} mousePos - Object with x and y coordinate of the cursor on the canvas
	 */
	this.mousePos = {x:0, y:0};

	/**
	 * @property {Array} elements - Array that stores all interactive elements
	 */
	this.elements = [];

	//Initialize itself
	this.initialize();

};

InteractionManager.prototype = {

	/**
	 * Initialize the Interaction Manager with the correct event listeners
	 * @protected
	 */
	initialize: function(){

		//Add the mouse move event listener to the canvas to always have the mouse position stored
		this.target.addEventListener("mousemove", this.onMouseMove.bind(this));
		this.target.addEventListener("mousedown", this.onMouseDown.bind(this));

	},

	/**
	 * Get the position of the mouse on the canvas and store it for later use
	 * @protected
	 */
	onMouseMove: function(event) {

		//Calculate the mouse position
		this.calculatePosition(event);

		//Loop through all interactive elements
		for(var i = 0; i < this.elements.length; i++){

			//Don't continue if the element is invisible
			if(!this.elements[i].visible || this.elements[i].alpha === 0){

				return;

			}

			//Get the position of this element on the canvas
			var position = this.elements[i].getPosition();

			//Check if our mouse hovers the element
			if(this.mousePos.x >= position.x && this.mousePos.x <= position.x + this.elements[i].width && this.mousePos.y >= position.y && this.mousePos.y <= position.y + this.elements[i].height){

				//We are hovering the current element
				this.elements[i].onHover();

				//Break the for loop, because we don't want underlaying elements to also have the hover variable on true
				break;

			}

		}

	},

	/**
	 * Function that is executed when the user pressed his mouse
	 * @protected
	 */
	onMouseDown: function(event) {

		//Calculate the mouse position
		this.calculatePosition(event);

		//Loop through all interactive elements
		for(var i = 0; i < this.elements.length; i++){

			//Don't continue if the element is invisible
			if(!this.elements[i].visible || this.elements[i].alpha === 0){

				return;

			}

			//Get the position of this element on the canvas
			var position = this.elements[i].getPosition();

			//Check if our mouse hovers the element
			if(this.mousePos.x >= position.x && this.mousePos.x <= position.x + this.elements[i].width && this.mousePos.y >= position.y && this.mousePos.y <= position.y + this.elements[i].height){

				//We are hovering the current element
				this.elements[i].onClick();

				//Break the for loop, because we don't want underlaying elements to also have the hover variable on true
				break;

			}

		}

	},

	/**
	 * Function that calculates the mouse position on the canvas
	 * @protected
	 */
	calculatePosition: function(event){

		//Get the rectangle from the target canvas
		var rect = this.target.getBoundingClientRect();

		//Calculate the mouse position
		this.mousePos = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};

	}

};

//Export the Browserify module
module.exports = InteractionManager;
