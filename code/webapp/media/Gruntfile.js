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
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask("default", ["clean", "sass"]);
};
