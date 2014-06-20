'use strict';

module.exports = function(grunt) {

	// configure grunt
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

	});

	// Load plug-ins
	// grunt.loadNpmTasks('grunt-contrib-whatever');

	// define tasks
	grunt.registerTask('default', [
		// No tasks, yet
	]);

};
