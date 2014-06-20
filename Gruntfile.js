'use strict';

module.exports = function(grunt) {

	//Configure Grunt
	grunt.initConfig({

		//Point to the package file
		//pkg: grunt.file.readJSON('package.json'),

		//Configure JSHint
		jshint: {
			//Process all of our own files but not the files
			//located in the node_modules folder
			files: [
				'**/*.js',
				'!node_modules/**/*',
			],
			options: {
				jshintrc: '.jshintrc'
			}
		}

	});

	//Load plug-ins
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	//Define tasks
	grunt.registerTask('default', [
		'jshint'
	]);

};
