//Because Browserify encapsulates every module, use strict won't apply to the global scope and break everything
'use strict';

//Require necessary modules
var Entity = require('../gameobjects/entity.js'),
    Weapon = require('../gameobjects/components/weapon.js'),
    CanPickUp = require('../gameobjects/components/canpickup.js'),
    Tooltip = require('../gameobjects/components/tooltip.js'),
    Position = require('../gameobjects/components/position.js');

/**
 * @class ItemFactory
 * @classdesc A factory that returns pre made item entities with
 * a set of components
 */
var ItemFactory = {

    /**
     * Function that returns a new sword
     * @public
     *
     * @param {Game} game - Reference to the currently running game
     * @param {Vector2} position - The position object of this entity
     *
     * @return {Entity} An item entity
     */
    newSword: function (game, position) {

        //Create the entity
        var entity = new Entity(game, "Item", "Sword", "warrior_right.png");

        //The starting position of the player is at the dungeon's entrance
        entity.addComponent(new Position(position));

        //The entity has a weapon
        entity.addComponent(new Weapon(10));

        //This entity is capable of being picked up by the following entity types
        var canPickedUpBy = ['Player'];

        entity.addComponent(new CanPickUp(game, canPickedUpBy));

        //Add a tooltip to this entity
        entity.addComponent(new Tooltip(
            "Sword",
            "Item",
            "Regular Sword"
        ));

        //Return the entity
        return entity;

    }

};

//Export the Browserify module
module.exports = ItemFactory;
