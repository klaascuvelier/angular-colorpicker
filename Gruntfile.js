module.exports = function (grunt) {

    grunt.initConfig({
        pkg    : grunt.file.readJSON('package.json'),
        concat : {
            options: {
                separator: ''
            },
            js: {
                src : [
                    'src/js/colorpicker.js',
                    'src/js/*.js'
                ],
                dest: 'dist/colorpicker.js'
            }
        },
        less: {
            components: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    'dist/colorpicker.css': 'src/less/*.less'
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            files  : [
                'Gruntfile.js',
                'src/**/*',
                'examples/**/*'
            ],
            tasks  : ['default']
        },
        uglify : {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            jid    : {
                files: {
                    'dist/showpad-viewer.js': 'dist/colorpicker.js'
                }
            }
        },
        jshint : {
            beforeConcat: {
                src: ['gruntfile.js', 'src/js/*.js']
            },
            afterConcat : {
                src: [
                    '<%= concat.js.dest %>'
                ]
            },
            options     : {
                // options here to override JSHint defaults
                globals     : {
                    console : true,
                    module  : true,
                    document: true,
                    angular : true
                },
                globalstrict: false
            }
        },
        connect: {
            server: {
                options: {
                    port      : 5555,
                    base      : './',
                    hostname  : '0.0.0.0',
                    keepalive : true,
                    livereload: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('default', [ 'jshint:beforeConcat', 'concat', 'jshint:afterConcat', 'less'/*, 'uglify'*/]);
    grunt.registerTask('livereload', [ 'default', 'watch']);
    grunt.registerTask('serve', [ 'connect' ]);
};