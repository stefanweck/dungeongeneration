'use strict';

module.exports = function(grunt) {

	//Configure Grunt
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

	});

	//Load plug-ins
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	//Define tasks
	grunt.registerTask('default', [
		//No tasks, yet
	]);

};
