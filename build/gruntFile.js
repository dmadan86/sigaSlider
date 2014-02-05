module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib');

    grunt.initConfig({
        copy:{
            main:{
                files:[
                    {
                        expand: true,
                        cwd: '../',
                        src: ['index_documentation.html'],
                        dest: 'dist/',
                        rename:function(dest, src){
                            return dest + "index.html";
                        }
                    },
                    {
                        expand: true,
                        cwd: '../',
                        src: ['css/*.png'],
                        dest: 'dist/css/',
                        rename:function(dest, src){
                            var t = src.split('/');
                            return dest + t[t.length-1]
                        }
                    }
                ]
            }
        },
        uglify: {
            dist: {
                files: {
                    'dist/js/sigaSlider.min.js': ['../js/sigaSlider.js']
                }
            }
        },
        cssmin: {
            minify: {
                expand: true,
                cwd: '../',
                src: ['css/*.css', 'css/!*.min.css'],
                dest: 'dist/',
                ext: '.min.css'
            }
        },
        clean: ['dist']

    });
    grunt.registerTask('default', [ 'clean', 'copy', 'uglify', 'cssmin']);
};