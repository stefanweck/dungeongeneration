/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %> */\n',
		// Task configuration.
		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: true
			},
			dist: {
				src: ["lib/roguelike.js",
					"lib/core/game.js",
					"lib/core/utils.js",
					"lib/core/camera.js",
					"lib/geometry/vector2.js",
					"lib/geometry/boundary.js",
					"lib/gameobjects/entity.js",
					"lib/gameobjects/group.js",
					"lib/gameobjects/components/sprite.js",
					"lib/gameobjects/components/health.js",
					"lib/gameobjects/components/canopen.js",
					"lib/gameobjects/components/lightsource.js",
					"lib/gameobjects/components/collide.js",
					"lib/gameobjects/components/keyboardcontrol.js",
					"lib/gameobjects/components/position.js",
					"lib/gameobjects/components/weapon.js",
					"lib/gameobjects/components/canfight.js",
					"lib/gameobjects/components/behaviour.js",
					"lib/gameobjects/systems/render.js",
					"lib/gameobjects/systems/open.js",
					"lib/gameobjects/systems/lightmap.js",
					"lib/gameobjects/systems/control.js",
					"lib/gameobjects/systems/movement.js",
					"lib/gameobjects/systems/combat.js",
					"lib/gameobjects/systems/pathfinding.js",
					"lib/factories/playerfactory.js",
					"lib/factories/enemyfactory.js",
					"lib/factories/propfactory.js",
					"lib/factories/decorationfactory.js",
					"lib/input/event.js",
					"lib/input/key.js",
					"lib/input/keyboard.js",
					"lib/tilemap/tile.js",
					"lib/tilemap/map.js",
					"lib/tilemap/mapfactory.js",
					"lib/tilemap/room.js",
					"lib/libraries/easystar.js",
					"lib/init.js"
				],
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			dist: {
				src: '<%= concat.dist.dest %>',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Default task.
	grunt.registerTask('default', ['concat', 'uglify']);

};
