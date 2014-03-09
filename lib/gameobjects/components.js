Roguelike.Components.Position = function(x, y){

	this.name = 'position';
	this.x = x;
	this.y = y;

};

Roguelike.Components.Position.prototype = {

	

};

Roguelike.Components.Health = function(maxHealth){

	this.name = 'health';
	this.health = this.maxHealth = maxHealth;

};

Roguelike.Components.Health.prototype = {

	isDead: function(){

		return this.health <= 0;

	}

};