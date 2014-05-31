/**
 * Tooltip Component constructor
 *
 * @class Roguelike.Components.Tooltip
 * @classdesc A tooltip that will show up when the player hovers his mouse over the entity
 *
 * /**
 * @param {Object} canvas - The current canvas object
 * @param {String} title - The title of the tooltip
 * @param {String} type - The type of entity
 * @param {String} description - The description of this entity
 */
Roguelike.Components.Tooltip = function(canvas, title, type, description) {

	/**
	 * @property {String} name - The name of this system. This field is always required!
	 */
	this.name = 'tooltip';

	/**
	 * @property {Object} context - The 2D context of the current canvas object
	 */
	this.context = canvas.getContext("2d");

	/**
	 * @property {Number} width - The width of the tooltip
	 */
	this.width = 150;

	/**
	 * @property {Number} maxWidth - The maximum width of the tooltip
	 */
	this.maxWidth = 0;

	/**
	 * @property {Number} fontSize - The size of the font in this tooltip
	 */
	this.fontSize = 12;

	/**
	 * @property {String} font - The font used in the tooltips
	 */
	this.font = "Courier New";

	/**
	 * @property {Array} title - The title of the tooltip
	 */
	this.title = this.splitText(title, this.context);

	/**
	 * @property {Array} type - The type of entity
	 */
	this.type = this.splitText(type, this.context);

	/**
	 * @property {Array} description - The description of this entity
	 */
	this.description = this.splitText(description, this.context);

};

Roguelike.Components.Tooltip.prototype = {

	/**
	 * Splits up a sentence in words and measures how many words can fit on one line
	 * It then divides the words over multiple lines
	 * @protected
	 *
	 * @param {String} text - The text to be split up into multiple lines
	 * @param {Object} context - The 2D context of the current canvas object
	 *
	 * @return {Array} Returns an array with all the separate lines of text
	 */
	splitText: function(text, context) {

		//If there isn't any text, return an empty array
		if(text === "") {
			return [];
		}

		//Define variables
		var words = text.split(' ');
		var lines = [];
		var currentLine = "";

		//Set the current fontsize to the context of the canvas
		context.font = this.fontSize + "px " + this.font;

		//If the text doesn't exceed the maximum width, don't bother splitting it up in separate lines
		if(context.measureText(text).width < this.width) {

			//Check if the current line is the longest line
			this.checkLongestLine(text);

			//Return the text in an array
			return [text];

		}

		//If we reached this point that means the maximum width is has been reached, we have to split up the sentence
		while(words.length > 0) {

			//Define variables
			var newSentence;

			//Check if we have to add an extra space at the beginning
			if(currentLine === "") {

				newSentence = words[0];

			}else{

				//Create what should be the new sentence
				newSentence = currentLine + " " + words[0];

			}

			///Check if the new sentence exceeds the maximum width
			if(context.measureText(newSentence).width < this.width) {

				//Create what should be the new sentence
				if(currentLine === "") {

					//We don't exceed the maximum width so we can add the word to the currentLine
					currentLine += words.splice(0, 1);

				}else{

					//We don't exceed the maximum width so we can add the word to the currentLine
					currentLine += " " + words.splice(0, 1);

				}

			}else{

				//Check if the current line is the longest line
				this.checkLongestLine(currentLine);

				//We exceed the maximum width so the new word has to be placed on a new line
				lines.push(currentLine);

				//Clear the current line again
				currentLine = "";

			}

			//If there aren't any words left, we push whatever is left in the current line to the lines array
			if(words.length === 0 && currentLine.length > 0) {

				//Check if the current line is the longest line
				this.checkLongestLine(currentLine);

				lines.push(currentLine);

			}

		}

		//Return the array of lines
		return lines;

	},

	/**
	 * Checks if a string is longer than any string checked before.
	 * This way I can use the longest string for rendering the tooltips background
	 * @protected
	 *
	 * @param {String} text - The text to be measured
	 */
	checkLongestLine: function(text){

		//Measure the length of the supplied text
		var textLength = this.context.measureText(text).width;

		//If the text is longer than the longest line
		if(textLength > this.maxWidth) {

			//Then this will be the new longest line
			this.maxWidth = textLength;

		}

	}

};
