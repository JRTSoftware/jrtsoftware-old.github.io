'use strict';
var path = require('path');

// match one level down:
// e.g. 'bar/foo/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// e.g. 'bar/foo/**/*.js'

module.exports = function (grunt) {
    'use strict';

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // show elapsed time at the end
    require('time-grunt')(grunt);
    // Init
    grunt.initConfig({
        timestamp: '<%= new Date().getTime() %>',
        pkg: grunt.file.readJSON('package.json'),

        src: {
            path: 'assets/src',
            sass: '**/*.{scss,sass}',
            lib: 'bower_components/Font-Awesome-SVG-PNG',
            theme: '/black',
            size: '/128'
        },

        temp: {
            path: 'assets/temp'
        },

        dist: {
            path: 'assets/dist'
        },

        distvendor: {
            path: 'assets/dist/vendor'
        },

        // clean all generated files
        clean: {
            all: {
                files: [{
                    src: [
                        '<%= dist.path %>/**/*.css',
                        '<%= dist.path %>/**/*.js',
                        '<%= dist.path %>/**/*.svg',
                        '<%= dist.path %>/**/*.{png,jpg,gif,jpeg}',
                        '<%= distvendor.path %>/**/*.css',
                        '<%= distvendor.path %>/**/*.js',
                        '<%= distvendor.path %>/**/*.svg',
                        '<%= distvendor.path %>/**/*.{png,jpg,gif,jpeg}'
                    ]
                }]
            },
            images: {
                files: [{
                    src: [
                        '<%= dist.path %>/**/*.{png,jpg,gif,jpeg}'
                    ]
                }]
            },
            temp: {
                files: [{
                    src: [
                        '<%= temp.path %>/**/*.{svg,png}'
                    ]
                }]
            }
        },

        // Sprite generation
        // sprite: {
        //     all: {
        //         src: 'assets/src/images/sprite/*.png',
        //         dest: 'assets/src/images/sprite.png',
        //         destCss: 'assets/src/sass/_jrt-sprite.sass',
        //         cssTemplate: 'assets/src/sass/jrt-sprite.mustache'
        //     }
        // },

        sass: {
            options: {
                outputStyle: 'nested',
                sourceComments: 'normal',
                sourceMap: false
            },
            dist: {
                files: {
                    '<%= dist.path %>/css/styles.css': ['<%= src.path %>/sass/styles.sass', '<%= src.path %>/css/jumbotron.css']
                }
            }//,
            // distvendor: {
            //     files: {
            //         '<%= distvendor.path %>/css/bootstrap.min.css': 'node_modules/bootstrap/dist/css/bootstrap.min.css'
            //     }
            // }
        },

        // use always with target e.g. `csslint:doc` or `csslint:dev`
        // unfortunately there is no point to run csslint on compressed css so
        // csslint runs once, when you use `grunt` and it lints on documentation's css
        // csslint runs on every save when you use `grunt dev` and it lints the original file you are working on -> `style.css`
        csslint: {
            options: {
                csslintrc: 'csslint.json'
            },
            dev: {
                src: ['<%= src.jrtsoftware %>']
            }
        },

        cssmin: {
            minify: {
                expand: true,
                cwd: '<%= dist.path %>/css/',
                src: ['*.css', '!*.min.css'],
                dest: '<%= dist.path %>/css/',
                ext: '.min.css'
            }
        },

        // Concat & minify
        // this processes only the files described in 'jsfiles.json'
        uglify: {
            options: {
                report: 'gzip',
                warnings: true
            },
            distvendor: {
                files: {
                    '<%= distvendor.path %>/js/bootstrap.min.js': 'node_modules/bootstrap/dist/js/bootstrap.js',
                    '<%= distvendor.path %>/js/jquery.min.js': 'node_modules/jquery/dist/jquery.min.js',
                    '<%= distvendor.path %>/js/tether.min.js': 'node_modules/tether/dist/js/tether.min.js'
                }
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= src.path %>/js',
                    src: '**/*.js',
                    dest: '<%= dist.path %>/js'
                }]
            }
        },

        // Image Optimization
        imagemin: {
            dist: {
                options: {
                    optimizationLevel: 4,
                    progressive: true
                },
                files: [
                    {
                        expand: true,
                        cwd: 'assets/src/images',
                        src: ['**/*.{png,jpg,gif,jpeg}'],
                        dest: 'assets/dist/img'
                    }
                ]
            }
        },

        bower: {
            install: {
                options: {
                    targetDir: './lib',
                    layout: 'byComponent'
                }
            }
        },

        copy: {
            'font-awesome-svg-png-svg': {
                src: '<%= src.lib %><%= src.theme %>/svg/*.svg',
                dest: '<%= temp.path %>/svg/',
                expand: true,
                flatten: true
            },
            'font-awesome-svg-png-png': {
                src: '<%= src.lib %><%= src.theme %>/png<%= src.size %>/*.png',
                dest: '<%= temp.path %>/png/',
                expand: true,
                flatten: true
            }
        },

        svgstore: {
            icons: {
                files: {
                    '<%= dist.path %>/img/icons.svg': ['<%= temp.path %>/svg/*.svg']
                },
                options: {
                    formatting: {
                        indent_size: 2
                    },
                    prefix: 'icon-',
                    cleanup: true,
                    convertNameToId: function (name) {
                        return name.replace(/^\w+\_/, '');
                    }
                }
            }
        },


        watch: {
            options: {
                spawn: false
            },
            styles: {
                files: ['<%= src.path %>/**/*.{scss,sass}'],
                tasks: ['sass:dist', 'cssmin']
            },
            images: {
                files: ['<%= src.path %>/**/*.{png,jpg,gif,jpeg}'],
                tasks: ['clean:images', 'imagemin']
            },
            js: {
                files: ['<%= src.path %>/**/*.js'],
                tasks: ['uglify:dist']
            },
        },

        concurrent: {
            dev: {
                tasks: ['watch:styles', 'watch:js', 'watch:images'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });

    // Tasks
    grunt.registerTask('iconfont', [
        'clean:all',
        'prebuild',
        'build'
    ]);

    // Runs once
    grunt.registerTask('build', [
        'sass',
        'cssmin',
        'uglify',
        'newer:imagemin'
    ]);

    // default task runs csslint once on startup on documentation's css
    grunt.registerTask('default', [
        'clean:all',
        'build',
        'concurrent:dev'
    ]);

    grunt.registerTask('prebuild', [
        'bower',
        'newer:copy',
        'svgstore'//,
        //'clean:temp'
    ]);

};
