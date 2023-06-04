/* global global */
'use strict';

var path                        = require('path');

global.PROJECT_ROOT_PATH        = path.resolve('.');
global.PROJECT_SOURCE_ROOT_PATH = global.PROJECT_ROOT_PATH + '/src/';

module.exports = function(grunt) {

   var jsFiles = ['Gruntfile.js', 'test/**/*.js'];
   
   grunt.initConfig({
      jshint: {
         allButNotSettings : {
            options: {
               jshintrc: '.jshintrc'
            },
            src: jsFiles
         }
      },

      mochaTest: {
			libRaw: {
			  options: {
				 require: ['test/testGlobals.js'],
				 reporter: 'spec'
			  },
			  src: ['test/**/*.js']
			}
        }           
   }); 

   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-mocha-test');
   
   grunt.registerTask('lint', ['jshint']);
   grunt.registerTask('test', ['mochaTest:libRaw']);
   
   grunt.registerTask('default', ['lint', 'test']);
 };
