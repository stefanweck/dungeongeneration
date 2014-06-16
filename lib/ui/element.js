/**
 * Element constructor
 *
 * @class Roguelike.UI.Element
 * @classdesc A single UI element
 *
 * @param {Roguelike.Game} game - Reference to the current game object
 * @param {Roguelike.Vector2} position - The position of this element
 */
Roguelike.UI.Element = function(game, position) {

	/**
	 * @property {Roguelike.Game} game - Reference to the current game object
	 */
	this.game = game;

	/**
	 * @property {Boolean} visible - Is this UI element visible or not
	 */
	this.visible = true;

	/**
	 * @property {Roguelike.Vector2} position - The position of this element
	 */
	this.position = position;

};

Roguelike.UI.Element.prototype = {



};
