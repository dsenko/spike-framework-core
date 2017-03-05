var spike = {

    docs: {

        rootDir: 'app',

        dirs: [
            'core',
            'modules',
            'singletons',
            'database',
            'jquery',
            'rest',
            'overrides'
        ],

        dist: './docs',
        commandDirs: '',
        commandGenerate: '',
    },

    output: {

        prod: './dist/spike-framework.min.js',
        dev: './dist/spike-framework.js',

        uglify: {}

    },

    modules: [
        './src/core/system.js',
        './src/core/security.min.js',
        './src/core/router.js',
        './src/core/config.js',
        './src/core/events.js',
        './src/core/cordova.js',
        './src/core/message.js',

        './src/modules/component.js',
        './src/modules/controller.js',
        './src/modules/modal.js',
        './src/modules/partial.js',

        './src/singletons/abstract.js',
        './src/singletons/enumerator.js',
        './src/singletons/global.js',
        './src/singletons/service.js',
        './src/singletons/plugins.js',
        './src/singletons/util.js',

        './src/database/crud.js',
        './src/database/database.js',
        './src/database/model.js',
        './src/database/query.js',

        './src/rest/rest.js',

        './src/jquery/serializeObject.js',
        './src/jquery/set.js',
        './src/jquery/attrs.js',

        './src/overrides/modal-bootstrap.js',
    ]

};

function crateDocsCommand() {

    spike.docs.commandDirs += 'mkdir ' + spike.docs.dist.substring(2, spike.docs.dist.length) + ' && cd ' + spike.docs.dist.substring(2, spike.docs.dist.length) + ' && ';
    spike.docs.commandDirs += 'mkdir ' + spike.docs.rootDir + ' && cd ' + spike.docs.rootDir + ' && ';

    for (var i = 0; i < spike.docs.dirs.length; i++) {

        spike.docs.commandDirs += 'mkdir ' + spike.docs.dirs[i];

        if (i < spike.docs.dirs.length - 1) {
            spike.docs.commandDirs += ' && ';
        }

    }

    console.log(spike.docs.commandDirs);

    //spike.docs.command += ' cd .. && cd .. && '

    for (var i = 0; i < spike.modules.length; i++) {

        spike.docs.commandGenerate += 'dox < ' + spike.modules[i].substring(2, spike.modules[i].length) + ' > ' + spike.docs.dist.substring(2, spike.docs.dist.length) + spike.modules[i].substring(1, spike.modules[i].length).replace('.js', '') + '.json';

        if (i < spike.modules.length - 1) {
            spike.docs.commandGenerate += ' && ';
        }

    }

    console.log(spike.docs.commandGenerate);

}

crateDocsCommand();
spike.output.uglify[spike.output.prod] = spike.output.prod;

module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.initConfig({

        clean: {
            dist: ['./dist'],
            docs: ['./docs']
        },

        copy: {

            starter: {
                files: [
                    {
                        expand: true,
                        cwd: './dist',
                        src: ['spike-framework.js', 'spike-framework.min.js'],
                        dest: 'D:/xampp/htdocs/spike-framework-starter/dist/libs/spike-framework-core/dist'
                        //dest: 'F:/spike-framework-starter/dist/libs/spike-framework-core/dist'
                    }
                ],
            }

        },

        concat: {

            options: {
                separator: '',
            },

            prod: {
                src: spike.modules,
                dest: spike.output.prod,
            },

            dev: {
                src: spike.modules,
                dest: spike.output.dev,
            },

        },

        watch: {
            dev: {
                files: spike.modules,
                tasks: ['build', 'copy:starter'],
                options: {
                    nospawn: true
                }
            }
        },

        uglify: {
            options: {
                mangle: false
            },
            prod: {
                files: spike.output.uglify
            }
        },

        shell: {
            options: {
                stderr: true
            },
            docsDirs: {
                command: spike.docs.commandDirs
            },
            docsGenerate: {
                command: spike.docs.commandGenerate
            }
        },

        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            dev: {
                tasks: ["watch:dev"]
            }
        }

    });

    grunt.registerTask('docs', ['clean:docs', 'shell:docsDirs', 'shell:docsGenerate']);
    grunt.registerTask('build', ['clean:dist', 'concat:prod', 'concat:dev', 'uglify:prod']);
    grunt.registerTask('dev', ['build', 'concurrent:dev']);
};