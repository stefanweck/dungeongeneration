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
        src: ['lib/roguelike.js',
              'lib/core/game.js',
              'lib/core/renderer.js',
              'lib/core/utils.js',
              'lib/core/camera.js',
              'lib/geometry/vector2.js',
              'lib/geometry/boundary.js',
              'lib/gameobjects/object.js',
              'lib/gameobjects/player.js',
              'lib/input/controls.js',
              'lib/tilemap/tile.js',
              'lib/tilemap/map.js',
              'lib/tilemap/mapfactory.js',
              'lib/tilemap/room.js',
              'lib/tilemap/lightsource.js',
              'lib/init.js',
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
