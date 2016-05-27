module.exports = function(grunt) {
    var license = grunt.file.read('LICENSE');
    var githubUrl = 'https://github.com/akopachov/mini-linq-js';
    grunt.initConfig({
        uglify: {
            options: {
                preserveComments: false,
                banner: '/* ! ' + githubUrl + ' */\n/* !\n' + license + '\n */\n'
            },
            core: {
                files: {
                    'dist/mini-linq.min.js': ['src/mini-linq.js']
                }
            },
            coreAndLazy: {
                files: {
                    'dist/mini-linq.with-lazy.min.js': ['src/mini-linq.js', 'src/mini-linq.lazy.js']
                }
            },
            coreAndKnockout: {
                files: {
                    'dist/mini-linq.with-knockout.min.js': ['src/mini-linq.js', 'src/mini-linq.knockout.js']
                }
            },
            full: {
                files: {
                    'dist/mini-linq.full.min.js': ['src/mini-linq.js', 'src/mini-linq.lazy.js', 'src/mini-linq.knockout.js']
                }
            }
        }
    });
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    
    grunt.registerTask('default', ['uglify']);
};