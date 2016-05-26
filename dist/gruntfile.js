module.exports = function(grunt) {
    var license = grunt.file.read('../LICENSE');
    grunt.initConfig({
        uglify: {
            options: {
                preserveComments: false,
                banner: '/* !\n' + license + '\n */\n'
            },
            core: {
                files: {
                    'build/mini-linq.min.js': ['../mini-linq.js']
                }
            },
            coreAndLazy: {
                files: {
                    'build/mini-linq.with-lazy.min.js': ['../mini-linq.js', '../mini-linq.lazy.js']
                }
            },
            coreAndKnockout: {
                files: {
                    'build/mini-linq.with-knockout.min.js': ['../mini-linq.js', '../mini-linq.knockout.js']
                }
            },
            full: {
                files: {
                    'build/mini-linq.full.min.js': ['../mini-linq.js', '../mini-linq.lazy.js', '../mini-linq.knockout.js']
                }
            }
        }
    });
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.registerTask('build', ['uglify']);
};