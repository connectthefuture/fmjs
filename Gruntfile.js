/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    // Custome Paths
    srcFiles: ['src/js/*.js'], // source files
    componentsDir: 'bower_components', // bower components
    testFiles: ['spec/*.spec.js'], // test files (jasmin' specs)

    // Task configuration.
    jscs: { // check javascript style
      options: {
        config: '.jscsrc',  // configuration file
        fix: true,
        force: true
      },
      source: {
        src: '<%= srcFiles %>'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      test: {
        src: '<%= testFiles %>'
      }
    },

    jshint: { // check javascript syntax and errors
      options: {
        jshintrc: true // configuration file
      },
      source: {
        src: '<%= jscs.source.src %>'
      },
      gruntfile: {
        src: '<%= jscs.gruntfile.src %>'
      },
      test: {
        src: '<%= jscs.test.src %>'
      }
    },

    connect: {
      test: {
        options: {
          hostname: 'localhost',
          port: 8001,
          base: ['.']
        }
      }
    },

    jasmine: { // run tests
      test: {
        // comment when using the define function within the specs files
        //src: '<%= jshint.source.src %>',
        options: {
          debug: true,
          host: 'http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/',
          specs: '<%= jshint.test.src %>',
          template: require('grunt-template-jasmine-requirejs'),
          templateOptions: {
            version: '<%= componentsDir %>/requirejs/require.js',
            requireConfigFile: 'demo/config.js', // requireJS's config file
            /*requireConfig: {
              baseUrl: '.' // change base url to execute tests from local FS
            }*/
          }
        }
      }
    },

    requirejs: { // concat and minimize AMD modules
      compile: {
        options: {
          baseUrl: '<%= componentsDir %>',
          name: '<%= pkg.name %>Package',
          mainConfigFile: 'demo/config.js',
          out: 'dist/<%= pkg.name %>.min.js'
        }
      }
    },

    copy: {
      components: { // copy the bower components that were not concat to dist/
        files: [
          {
            expand: true,
            cwd: '<%= componentsDir %>',
            src: ['requirejs/require.js'],
            dest: 'dist/dependencies'}]
      },
      module: { // copy the module as a bower component to <%= componentsDir %>
        files: [
          {
            expand: true,
            src: 'src/**/*',
            dest: '<%= componentsDir %>/<%= pkg.name %>/'
          }]
      }
    },

    watch: {
      source: {
        files: '<%= jshint.source.src %>',
        tasks: ['jscs:source', 'jshint:source', 'copy:module']
      },
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jscs:source', 'jshint:gruntfile']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jscs:source', 'jshint:test', 'jasmine']
      }
    },

    browserSync: {
      dev: {
        bsFiles: {
          src: [
              'demo/**/*.js',
              'demo/**/*.css',
              'demo/**/*.html',
              'src/**/*.js',
              'src/**/*.css',
              'src/**/*.html'
          ]
        },
        options: {
          watchTask: true,
          // serve base dir
          server: ['.'],
          startPath: '/demo'
        }
      }
    }

  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // Serve task.
  grunt.registerTask('serve', function(/*target*/) {

    grunt.task.run([
      'copy:module',
      'browserSync:dev',
      'watch'
    ]);
  });

  // Test task.
  grunt.registerTask('test', ['jscs', 'jshint', 'copy:module', 'connect', 'jasmine']);

  // Build task.
  grunt.registerTask('build', ['jscs', 'jshint', 'copy:module', 'requirejs', 'copy']);

  // Default task.
  grunt.registerTask('default', ['build']);

};
