/**
 * @public
 *
 * Config object
 * Object designed as storage for common and important variables for application
 * Can be extended by custom configuration.
 *
 * Can be used in another modules.
 *
 * @functions
 * @public  {extend}
 *
 * @fields
 * @public {mobileRun}
 * @public {debug}
 * @public {mainController}
 * @public {viewsPath}
 * @public {lang}
 * @public {dbMode}
 * @public {dbTestMode}
 * @public {dbCreateDropFromScript}
 * @public {dbCreateScript}
 * @public {dbDropScript}
 * @public {dbTestScript}
 * @public {dbProductionScript}
 * @public {dbName}
 * @public {componentDirectory}
 * @public {controllerDirectory}
 * @public {modalDirectory}
 *
 */
app.config = {

    /**
     * @public
     *
     * Defines routing object
     */
    routing: null,

    /**
     * @public
     *
     * Defines if router should be enabled
     */
    routingEnabled: true,

    /**
     * @public
     *
     * Defines if application runs locally (false) or on mobile device (true)
     */
    mobileRun: false,

    /**
     * @public
     *
     * Defines if debug logs shoud be printed in console
     */
    debug: false,

    /**
     * @public
     *
     * Defines controller name which one is rendered as first after application ready
     */
    mainController: "Home",

    /**
     * @public
     *
     * Defines application initial view (before Spike starts application initializing)
     */
    initialView: null,

    /**
     * @public
     *
     * Defines application main path (ex. project root/app)
     */
    rootPath: 'app',

    /**
     * @public
     *
     * Defines application default language
     */
    lang: "en",

    /**
     * @public
     *
     * Defines application database mode
     * Modes:
     * 'none' - database won't be created
     * 'create' - creates database once and never drop
     * 'create-drop' - drop and create database every time when application is reloaded (started again)
     */
    dbMode: 'none',

    /**
     * @public
     *
     * Defines if database should be filled with test data defined in @dbTestScript
     */
    dbTestMode: true,

    /**
     * @public
     *
     * Defines SQL script with test data executed when @dbTestMode is setted to true
     */
    dbTestScript: 'sql/test.sql',

    /**
     * @public
     *
     * Defines SQL script with initial production data executed when @dbTestMode is setted to false
     */
    dbProductionScript: 'sql/production.sql',

    /**
     * @public
     *
     * Defines SQLLite database name
     */
    dbName: 'local_db',

    /**
     * @public
     *
     * Defines main directory containing components directories structure
     * Ex.
     * - app/component
     * -- topNavbar
     * -- bottomTabs
     */
    componentDirectory: 'component',

    /**
     * @public
     *
     * Defines main directory containing controllers directories structure
     * Ex.
     * - app/controller
     * -- homePage
     * -- personList
     */
    controllerDirectory: 'controller',

    /**
     * @public
     *
     * Defines main directory containing modals directories structure
     * Ex.
     * - app/modal
     * -- loginModal
     * -- confirmModal
     */
    modalDirectory: 'modal',

    /**
     * @public
     *
     * Function to extending and overriding default config @object with new properties defined by user
     *
     * @param configObj
     */
    extend: function (configObj) {

        for (var prop in configObj) {
            app.config[prop] = configObj[prop];
        }

    }

};