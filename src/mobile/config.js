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

app.config.extend({

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
   * @public
   *
   * Defines if application runs locally (false) or on mobile device (true)
   */
  mobileRun: false,

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
  dbName: 'local_db'

});