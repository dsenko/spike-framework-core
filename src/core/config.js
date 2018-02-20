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
   * Defines if transitions between controllers
   * are enabled
   *
   * Disabled by default to avoid user layout destroying
   * if not compatibile
   */
  transitions: false,

  /**
   * @public
   * @overriding
   *
   * Function to manage transitions effects during controllers
   * switching time.
   *
   * This is default implementation with from right to left transition
   * based on simple CSS and @jQuery.animate function
   *
   * In default implementation, showing first controller is free of effects
   *
   * @param oldViewSelector
   * @param newViewSelector
   * @param appStartup
   * @param fromController
   * @param toController
   * @param complete
   */
  transitionAnimation: function (oldViewSelector, newViewSelector, appStartup, fromController, toController, complete) {

    if (appStartup) {
      app.log('Transition disabled for app startup');
      complete();
    } else {

      app.log('Default transition from ' + fromController + ' to ' + toController);

      oldViewSelector
        .css('z-index', '2000')
        .css('position', 'fixed')
        .css('min-height', $(window).height() + 'px')
        .css('background', '#fff')
        .css('box-shadow', '2px 2px 8px #ccc')
        .css('border', '1px solid black')
        .css('width', '100%')
        .show();

      oldViewSelector.stop().animate({right: $(window).height() + 'px'}, "slow", complete);

    }

  },

  /**
   * @private
   *
   * Defined safe time after which closed/hidden modal is removed from DOM
   *
   */

  __safeModalRemove: 5000,

  /**
   * @public
   *
   * Defines routing object
   */
  routing: null,

  /**
   * Enabled plain templates processing
   */
  usePlainTemplates: true,

  /**
   * Enable if you use spike3 templates (spike transpiler)
   */
  useSpike3Templates: false,

  /**
   * @public
   *
   * Defines if router should be enabled
   */
  routingEnabled: true,

  /**
   * @public
   *
   * Defines if router should work in History API mode
   */
  html5Mode: false,

  /**
   * @public
   *
   * Defines if application runs locally (false) or on mobile device (true)
   */
  mobileRun: false,

  /**
   * @public
   *
   * Checks during router registration, if route names are unique
   */
  checkRoutesNamesUniqueness: true,

  /**
   * @public
   *
   * Defines if logs type 'LOG' shoud be printed in console
   */
  showLog: true,

  /**
   * @public
   *
   * Defines if logs type 'OBJ' shoud be printed in console
   */
  showObj: true,

  /**
   * @public
   *
   * Defines if logs type 'DEBUG' shoud be printed in console
   */
  showDebug: true,

  /**
   * @public
   *
   * Defines if logs type 'WARN' shoud be printed in console
   */
  showWarn: true,

  /**
   * @public
   *
   * Defines if logs type 'OK' shoud be printed in console
   */
  showOk: true,

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
   * Defines if Spike should replace keys maked
   * by spike-compiler to language translations
   */
  replaceLangKeys: false,

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
   * Defines main directory containing partials directories structure
   * Ex.
   * - app/partial
   * -- loginFormPartial
   * -- registerFormPartial
   */
  partialDirectory: 'partial',

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