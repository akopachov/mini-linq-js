module.exports = function(grunt) {
    var license = grunt.file.read('LICENSE');
    var githubUrl = 'https://github.com/akopachov/mini-linq-js';
    grunt.initConfig({
        copy: {
            core: {
                src: 'src/mini-linq.js',
                dest: 'dist/mini-linq.min.js',
                options: {
                    process: function (content, srcpath) {
                        return content.replace('/* ADDITIONAL_ATTACHMENTS */', '');
                    }
                }
            },
            coreAndLazy: {
                src: 'src/mini-linq.js',
                dest: 'dist/mini-linq.with-lazy.min.js',
                options: {
                    process: function (content, srcpath) {
                        return content.replace('/* ADDITIONAL_ATTACHMENTS */', grunt.file.read('src/mini-linq.lazy.js'));
                    }
                }
            },
            coreAndKnockout: {
                src: 'src/mini-linq.js',
                dest: 'dist/mini-linq.with-knockout.min.js',
                options: {
                    process: function (content, srcpath) {
                        return content.replace('/* ADDITIONAL_ATTACHMENTS */', grunt.file.read('src/mini-linq.knockout.js'));
                    }
                }
            },
            full: {
                src: 'src/mini-linq.js',
                dest: 'dist/mini-linq.full.min.js',
                options: {
                    process: function (content, srcpath) {
                        return content.replace('/* ADDITIONAL_ATTACHMENTS */', grunt.file.read('src/mini-linq.lazy.js') + grunt.file.read('src/mini-linq.knockout.js'));
                    }
                }
            }
        },
        uglify: {
            options: {
                preserveComments: false,
                banner: '/* ! ' + githubUrl + ' */\n/* !\n' + license + '\n */\n'
            },
            build: {
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: '*.js',
                    dest: 'dist/'
                }]
            }
        }
    });
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    
    grunt.registerTask('default', ['copy', 'uglify']);
};