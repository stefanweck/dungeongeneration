'use strict';

module.exports = function(grunt) {

	//Configure Grunt
	grunt.initConfig({

		//Point to the package file
		pkg: grunt.file.readJSON('package.json'),

		//Configure JSHint with files to exclude and options
		jshint: {
			files: [
				'**/*.js',
				'!Gruntfile.js',
				'!lib/libraries/*',
				'!node_modules/**/*',
				'!dist/**/*'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},

		//Configure Browserify build, no debug map and don't keep alive
		browserify: {
			default:{
				options:{
					debug: false,
					keepalive: false
				},
				files:{
					'dist/dungeongeneration.js': [ 'lib/init.js' ]
				}
			}
		},

		//Configure Watchify build used while developing, debug map and constant file watch
		watchify: {
			options:{
				debug: true,
				keepalive: true
			},
			default: {
				src: './lib/init.js',
				dest: './dist/dungeongeneration.js'
			}
		},

		//Configure Uglify that is executed when creating a new build
		uglify: {
			dist: {
				files: {
					'dist/dungeongeneration.min.js': 'dist/dungeongeneration.js'
				}
			}
		}

	});

	//Load plug-ins
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-watchify');

	//Define 'grunt debug' task
	grunt.registerTask('debug', [
		'jshint',
	]);

	//Define 'grunt build' task
	grunt.registerTask('build', [
		'browserify',
		'uglify'
	]);

	//Define 'grunt dev' task
	grunt.registerTask('dev', [
		'watchify',
	]);

};
