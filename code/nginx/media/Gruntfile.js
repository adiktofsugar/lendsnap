module.exports = function (grunt) {
    grunt.initConfig({
        clean: ["css"],
        sass: {
            all: {
                expand: true,
                cwd: 'scss/',
                src: '**/*.scss',
                dest: 'css/',
                ext: '.css'
            }
        },
        watch: {
            all: {
                options: {
                    atBegin: true
                },
                files: ['scss/**/*.scss'],
                tasks: ['sass']
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask("default", ["clean", "sass"]);
};
