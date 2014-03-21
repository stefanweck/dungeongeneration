/**
 * Entity constructor
 *
 * @class Roguelike.Entity
 * @classdesc A single entity in the game world
 *
 */
Roguelike.Entity = function() {

	/**
	 * @property {object} components - An object filled with all the components this entity has
	 */
	this.components = {};

	/**
	 * @property {Roguelike.Event} onAddComponent - Event that handles AddComponent event
	 */
	this.onAddComponent = new Roguelike.Event();

	/**
	 * @property {Roguelike.Event} onRemoveComponent - Event that handles RemoveComponent event
	 */
	this.onRemoveComponent = new Roguelike.Event();

};

Roguelike.Entity.prototype = {

	/**
	 * Check whether this entity has a certain component
	 * @protected
	 *
	 * @param {string} name - The name of the component
	 */
	hasComponent: function(name) {

		return (this.components[name] !== undefined);

	},

	/**
	 * Get a certain component on this entity
	 * @protected
	 *
	 * @param {string} name - The name of the component
	 */
	getComponent: function(name) {

		return this.components[name];

	},

	/**
	 * Add an existing component to this entity
	 * @protected
	 *
	 * @param {Roguelike.Components} component - The component that is getting added to this entity
	 */
	addComponent: function(component) {

		//Add the component
		this.components[component.name] = component;

		//Trigger the AddComponent event
		this.onAddComponent.trigger(component);

	},

	/**
	 * Remove a component from this entity
	 * @protected
	 *
	 * @param {Roguelike.Components} component - The component that is getting removed from this entity
	 */
	removeComponent: function(component) {

		//Add the component
		this.components[component.name] = undefined;

		//Trigger the RemoveComponent event
		this.onRemoveComponent.trigger(component);

	}

};
