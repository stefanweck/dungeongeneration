/**
 * @author       Stefan Weck <contact@stefanweck.nl>
 * @website      {@link http://stefanweck.nl}
 * @license      MIT License
 */

/**
 * Roguelike javascript game with HTML5's canvas
 *
 * v.1.6.5 - Build on: 15 March 2014
 *
 * Features:
 * - Random Dungeon Generation ( Surprise! )
 * - Corridors between the rooms
 * - Random doors at the end of corridors
 * - A player that can walk through the dungeon
 * - A camera with a viewport
 * - Fog of War!
 * - Field of view for the player
 * - Configurable settings
 * - A component entity system
 *
 * What's next?
 *
 * - Turns
 * - Interaction with objects, such as doors
 * - Different types of rooms
 * - Monsters, enemies
 * - Looting
 * - Treasures
 * - Path finding
 * - And more!
 *
 */

/**
 * @namespace Roguelike
 */
var Roguelike = Roguelike || {

	//Details, version etc
	VERSION: '1.6.5',

	//Holder for all the game's available components
	Components: {},

	//Holder for all the game's available systems
	Systems: {}

};
