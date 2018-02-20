/**
 * @public
 *
 * Router object
 * Object designed as routing module for registreing and processing defined endpoints
 * Can be configured via @app.config.routing parameter
 *
 * @functions
 * @public  {create}
 * @public  {setPathParams}
 * @public  {setURLParams}
 * @public {getCurrentRoute}
 * @public {offRouteChange}
 * @public {onRouteChange}
 *
 * @private {__pathFunction}
 * @private {__registerPath}
 * @private {__pathPatternExist}
 * @private {__createPathPattern}
 * @private {__registerRouter}
 * @private {__checkPathIntegrity}
 * @private {__getURLParams}
 * @private {__getPathData}
 * @private {__getCurrentView}
 * @private {__redirectToView}
 * @private {__renderCurrentView}
 * @private {__fireRouteEvents}
 *
 * @fields
 * @private {__otherwiseReplacement}
 * @private {__pathParamReplacement}
 * @private {__endpoints}
 * @private {__events}
 *
 */
app.router = {

  /**
   * @private
   *
   * Stores information about last entered path
   */
  __lastPath: null,

  /**
   * @private
   *
   * Stores information about path which should be prevented
   * to reload page
   */
  __preventReloadPage: null,

  /**
   * @private
   *
   * List of registerd events to fire on route change
   */
  __events: {},

  /**
   * @private
   * Declares string which is used as 'OTHERWISE' URL
   */
  __otherwiseReplacement: '!',

  /**
   * @private
   * Declares pattern replacement for path params
   */
  __pathParamReplacement: '__var__',

  /**
   * @private
   * Storage of routing endpoints objects
   */
  __endpoints: {},

  /**
   * @private
   *
   * Defines if HTML5 mode is available
   */
  __routerHTML5Mode: false,

  /**
   * @private
   *
   * Returns factory object for creating routing endpoints
   * based on {path} and {other} functions mapped from
   * @private __pathFunction and @private __otherFunction
   *
   */
  __getRouterFactory: function () {
    return {
      path: app.router.__pathFunction,
      other: app.router.__otherFunction
    }
  },

  /**
   * @public
   *
   * Function creates starts creating new router and
   * Returns routing creator object.
   *
   */
  create: function () {
    return app.router.__getRouterFactory();
  },

  /**
   * @private
   *
   * Function registers otherwise endpoint.
   * Returns routing creator.
   *
   * @param pathObject
   */
  __otherFunction: function (pathObject) {
    return app.router.__pathFunction(app.router.__otherwiseReplacement, pathObject);
  },

  /**
   * @public
   * @ToImplement
   *
   * Function invokes before @__pathFunction registers new endpoint in routing
   * Developer can change path value using @pathValue nad @pathObject args
   *
   */
  pathFunctionHandler: null,

  /**
   * @private
   *
   * Function registers routing endpoint.
   * Checks if @pathValue and @pathObject are defined
   * If not throws error.
   * If defined, registers new endpoint via @private {__registerPath}
   *
   * Returns routing creator
   *
   * @param pathValue
   * @param pathObject
   */
  __pathFunction: function (pathValue, pathObject) {

    if (app.util.System.isEmpty(pathValue) || app.util.System.isNull(pathObject)) {
      app.system.__throwError(app.system.__messages.PATH_DEFINITION);
    }

    if (app.router.pathFunctionHandler) {
      pathValue = app.router.pathFunctionHandler(pathValue, pathObject);
    }

    app.router.__registerPath(pathValue, pathObject.controller, pathObject.routingParams, pathObject.onRoute, pathObject.name, pathObject.modal, pathObject.defaultController);

    return app.router.__getRouterFactory();

  },

  /**
   * @private
   *
   * Function registers new routing endpoint.
   * If endpoint with given @pathValue already exists then
   * throws error.
   * If not, creates given @pathValue pattern and checks
   * if endpoint with similar pattern already exist, if exist
   * throws error.
   *
   * Creates endpoint object.
   *
   * @param pathValue
   * @param pathController
   * @param routingParams
   * @param onRouteEvent
   *
   */
  __registerPath: function (pathValue, pathController, routingParams, onRouteEvent, routeName, pathModal, pathModalDefaultController) {

    if (app.router.__endpoints[pathValue]) {
      app.system.__throwError(app.system.__messages.PATH_ALREADY_EXIST, [pathValue]);
    }

    if(app.config.checkRoutesNamesUniqueness === true){
      if (routeName && typeof routeName !== 'function' && app.router.__routeNameExist(pathValue, routeName)) {
        app.system.__throwError(app.system.__messages.ROUTE_NAME_EXIST, [routeName]);
      }
    }

    var pathPattern = app.router.__createPathPattern(pathValue);

    //Checks if pattern exists in set of endpoints
    if (app.router.__pathPatternExist(pathPattern)) {
      app.system.__throwError(app.system.__messages.PATH_PATTERN_ALREADY_EXIST, [pathValue, pathPattern.join("").split(app.router.__pathParamReplacement).join("/PATH_PARAM")]);
    }

    app.router.__endpoints[pathValue] = {
      __pathValue: pathValue,
      controller: pathController,
      defaultController: pathModalDefaultController,
      modal: pathModal,
      routingParams: routingParams,
      onRouteEvent: onRouteEvent,
      __pathPattern: pathPattern,
      __routeName: routeName,
      __isModal: !app.util.System.isEmpty(pathModal)
    };

  },

  __initRouteFunctions: function () {

    for (var pathValue in app.router.__endpoints) {

      if (typeof app.router.__endpoints[pathValue].__routeName === 'function') {

        var routeNameFn = app.router.__endpoints[pathValue].__routeName;
        var routeName = routeNameFn();
        app.router.__endpoints[pathValue].__routeName = routeName;
      }

    }

  },

  /**
   * @public
   *
   * Finds endpoint full path by declared @routeName
   *
   * @param routeName
   */
  byName: function (routeName) {

    for (var pathValue in app.router.__endpoints) {

      if (app.router.__endpoints[pathValue].__routeName == routeName) {
        return pathValue;
      }

    }

    app.system.__throwError(app.system.__messages.ROUTE_NAME_NOT_EXIST, [routeName]);

  },

  /**
   * @private
   *
   * Function checks if given @routeName already exists in registred endpoints
   *
   * @param routeName
   */
  __routeNameExist: function (pathValueCurrent, routeName) {

    for (var pathValue in app.router.__endpoints) {

      if (pathValue == pathValueCurrent && app.router.__endpoints[pathValue].__routeName == routeName) {
        return true;
      }

    }

    return false;

  },

  /**
   * @private
   *
   * Function checks if path patterns already exists in set of endpoints
   *
   * @param pathPattern
   */
  __pathPatternExist: function (pathPattern) {

    for (var pathValue in app.router.__endpoints) {

      if (app.router.__endpoints[pathValue].__pathPattern.pattern.join("") == pathPattern.pattern.join("")) {
        return true;
      }

    }

    return false;

  },

  /**
   * @private
   *
   * Function creates path pattern from given @pathValue
   * Returns path pattern object containing pattern and
   * giver @pathValue path params set
   *
   * @param pathValue
   *
   */
  __createPathPattern: function (pathValue) {

    var pathPattern = {
      pattern: [],
      pathParams: []
    };

    //Avoid processing URL params
    var splitted = pathValue.substring(0, pathValue.indexOf('?') > -1 ? pathValue.indexOf('?') : pathValue.length).split('/');

    for (var i = 0; i < splitted.length; i++) {

      if (splitted[i].indexOf(':') > -1) {
        //Is path param
        pathPattern.pathParams.push(splitted[i].replace(':', ''));
        pathPattern.pattern.push(app.router.__pathParamReplacement)
      } else if (splitted[i].trim().length > 0) {
        pathPattern.pattern.push(splitted[i])
      }

    }

    return pathPattern;

  },

  /**
   * @private
   *
   * Detects history API exists and sets @__routerHTML5Mode to TRUE if exists
   *
   */
  __detectHTML5Mode: function () {

    if (window.history && window.history.pushState && app.config.html5Mode == true) {
      app.router.__routerHTML5Mode = true;
    }

  },

  /**
   * @private
   *
   * Function initializes router.
   * If @app.config.routingEnabled is setted, then
   * prepare browser URL to work with router.
   *
   * Binds hashchange event.
   *
   */
  __registerRouter: function () {

    if (app.config.routingEnabled) {

      app.ok('HTML5 router mode status: {0}', [app.router.__routerHTML5Mode]);

      if (app.util.System.isEmpty(app.config.routing)) {
        app.system.__throwError(app.system.__messages.ROUTING_ENABLED_NOT_DEFINED, []);
      }

      if (app.router.__routerHTML5Mode == false && window.location.hash.substring(0, 2) !== '#/') {
        window.location.hash = '#/';
      }

      app.router.__renderCurrentView();
      app.__starting = false;

      if (app.router.__routerHTML5Mode == false) {
        $(window).bind('hashchange', app.router.__onHashChanges);
      }

    }

  },

  /**
   * @private
   *
   * Event function executes when hash changes in not html5 mode
   */
  __onHashChanges: function (e) {

    app.debug('Executes app.router.__onHashChanges');

    if (window.location.hash.replace('#', '') == app.router.__preventReloadPage) {
      app.router.__preventReloadPage = null;
      app.router.__fireRouteEvents(e);
      return false;
    }

    app.router.__clearCacheViewData();

    app.router.__fireRouteEvents(e);
    app.router.__renderCurrentView();

  },

  /**
   * @private
   *
   * Event function executes when history changes in html5 mode
   */
  __onHistoryChanges: function () {

    if (app.router.__routerHTML5Mode == true) {

      app.debug('Executes app.router.__onHistoryChanges');

      if (app.router.getPathName() === app.router.__preventReloadPage) {
        app.router.__preventReloadPage = null;
        app.router.__fireRouteEvents({});
        return false;
      }

      app.router.__clearCacheViewData();

      app.router.__fireRouteEvents({});
      app.router.__renderCurrentView();

    }

  },

  /**
   * @private
   *
   * Function iterate all registred events and fire them
   */
  __fireRouteEvents: function (e) {

    var currentRoute = app.router.getCurrentRoute();

    $.each(app.router.__events, function (eventName, eventFunction) {

      if (eventFunction) {
        eventFunction(e, currentRoute, app.currentController);
      }

    });

  },


  /**
   * @public
   *
   * Function registers new route event fired when route changing
   */
  onRouteChange: function (eventName, eventFunction) {

    if (app.router.__events[eventName]) {
      app.system.__throwWarn(app.system.__messages.ROUTE_EVENT_ALREADY_REGISTRED, [eventName]);
    }

    app.router.__events[eventName] = eventFunction;

  },

  /**
   * @public
   *
   * Function unregisters route event
   */
  offRouteChange: function (eventName) {

    if (app.router.__events[eventName]) {
      app.router.__events[eventName] = null;
    }

  },

  /**
   * @private
   *
   *  Function checks if given @hashPattern so pattern created
   *  from current browser hash matches with @endpointPattern
   *  given from @private __endpoints set
   *
   * @param hashPattern
   * @param endpointPattern
   *
   */
  __checkPathIntegrity: function (hashPattern, endpointPattern) {

    for (var i = 0; i < endpointPattern.pattern.length; i++) {

      if (endpointPattern.pattern[i] !== app.router.__pathParamReplacement
        && endpointPattern.pattern[i] !== hashPattern.pattern[i]) {
        return false;
      }

    }

    return true;

  },

  /**
   * @public
   *
   * Function returns object with params stored in current browser URL
   *
   */
  getURLParams: function () {
    return app.router.__getURLParams();
  },

  /**
   * @private
   *
   * Function returns object with params stored in current browser URL
   *
   */
  __getURLParams: function () {

    var params = {};

    if (window.location.href.indexOf('?') > -1) {
      window.location.href.substring(window.location.href.indexOf('?'), window.location.href.length).replace(/[?&]+([^=&]+)=([^&]*)/gi, function (str, key, value) {
        params[key] = app.util.System.tryParseNumber(value);

        if (!app.util.System.isNull(params[key]) && typeof params[key] == 'string') {
          if (params[key].indexOf('#/') > -1) {
            params[key] = params[key].replace('#/', '');
          }
        }

      });
    }

    return params;

  },

  /**
   * @public
   *
   * Function returns current route routing params
   *
   */
  getRoutingParams: function () {
    return app.router.__getCurrentViewData().endpoint.routingParams || {};
  },

  /**
   * @public
   *
   * Function returns current route path params
   *
   */
  getPathParams: function () {
    return app.router.__getCurrentViewData().data.pathParams;
  },

  /**
   * @private
   *
   * Function returns object containing @urlParams and
   * @pathParams as objects. Data is retrieved from
   * given @hashPattern based on @endpointPattern
   *
   *
   *
   * @param hashPattern
   * @param endpointPattern
   */
  __getPathData: function (hashPattern, endpointPattern) {

    var urlParams = app.router.__getURLParams();
    var pathParams = {};
    var pathParamsIndex = 0;
    for (var i = 0; i < endpointPattern.pattern.length; i++) {

      if (endpointPattern.pattern[i] == app.router.__pathParamReplacement) {
        //If path param is numeric string, then making it just number. If not, returns passed object without modifications
        pathParams[endpointPattern.pathParams[pathParamsIndex]] = app.util.System.tryParseNumber(hashPattern.pattern[i]);
        pathParamsIndex++;
      }

    }

    return {
      urlParams: urlParams,
      pathParams: pathParams,
    };

  },

  /**
   * @private
   *
   * Clears cached current view data
   */
  __clearCacheViewData: function () {

    app.router.__getCurrentViewCache = null;
    app.router.__getCurrentViewDataCache = null;

  },

  __setCacheViewData: function (type, data) {

    if (type == 'DATA') {
      app.router.__getCurrentViewDataCache = data;
      app.router.__getCurrentViewDataRouteCache = app.router.getCurrentRoute();
    } else {
      app.router.__getCurrentViewCache = data;
      app.router.__getCurrentViewRouteCache = app.router.getCurrentRoute();
    }

  },

  /**
   * @private
   *
   * Stores cache of @__getCurrentView function result
   * Restores to null on history change
   */
  __getCurrentViewCache: null,

  /**
   * @private
   *
   * Stores cache of @__getCurrentView route
   */
  __getCurrentViewRouteCache: null,

  /**
   * @private
   *
   * Function gets current browser URL data
   *
   * Finally, for given endpoint data sets
   * global info like @private __controller, @public routingParams
   * and @private {__onRouteEfvent} properties.
   *
   * Returns those data.
   */
  __getCurrentView: function () {

    if (app.router.__getCurrentViewCache !== null && app.router.getCurrentRoute() != app.router.__getCurrentViewRouteCache) {
      app.debug('Using @__getCurrentViewCache cache');
      return app.router.__getCurrentViewCache;
    }

    var currentEndpointObject = app.router.__getCurrentViewData();

    var currentEndpointData = currentEndpointObject.data;
    var currentEndpoint = currentEndpointObject.endpoint;

    if (currentEndpointData == null && app.router.__endpoints[app.router.__otherwiseReplacement]) {

      currentEndpointData = {
        __controller: app.router.__endpoints[app.router.__otherwiseReplacement].controller,
        __modal: app.router.__endpoints[app.router.__otherwiseReplacement].modal,
        __defaultController: app.router.__endpoints[app.router.__otherwiseReplacement].defaultController,
        __isModal: app.router.__endpoints[app.router.__otherwiseReplacement].__isModal,
        routingParams: app.router.__endpoints[app.router.__otherwiseReplacement].routingParams,
        __onRouteEvent: app.router.__endpoints[app.router.__otherwiseReplacement].onRouteEvent,
        __onRouteEventWithModal: app.router.__endpoints[app.router.__otherwiseReplacement].onRouteEvent,
      };

    } else {

      if (currentEndpointData.__isModal == true && !app.util.System.isEmpty(app.previousController)) {
        currentEndpointData.__controller = app.previousController;
      } else {
        currentEndpointData.__controller = currentEndpoint.controller;
      }

      currentEndpointData.__defaultController = currentEndpoint.defaultController;
      currentEndpointData.__modal = currentEndpoint.modal;
      currentEndpointData.__isModal = currentEndpoint.__isModal;
      currentEndpointData.routingParams = currentEndpoint.routingParams;
      currentEndpointData.__onRouteEvent = currentEndpoint.onRouteEvent;
      currentEndpointData.__onRouteEventWithModal = function () {
        app.system.render(app.modal[currentEndpointData.__modal], currentEndpointData, currentEndpointData.__onRouteEvent);
      }

    }

    app.router.__setCacheViewData('VIEW', currentEndpointData);

    return currentEndpointData;

  },

  /**
   * @private
   *
   * Stores cache of @__getCurrentViewData function result
   * Restored to null when history change
   */
  __getCurrentViewDataCache: null,

  /**
   * @private
   *
   * Stores cache of @__getCurrentViewData route
   */
  __getCurrentViewDataRouteCache: null,

  /**
   * @private
   *
   * Function gets current browser URL and matches it
   * with @private __endpoints.
   *
   * If current URL matches with any of routing declarations from
   * @private __endpoints set, then gets endpoint data.
   *
   * If current URL not matches then endpoint data is null.
   *
   * Returns those data.
   */
  __getCurrentViewData: function () {

    if (app.router.__getCurrentViewDataCache !== null && app.router.getCurrentRoute() != app.router.__getCurrentViewDataRouteCache) {
      app.debug('Using @__getCurrentViewDataCache cache');
      return app.router.__getCurrentViewDataCache;
    }

    var hash = null;

    if (app.router.__routerHTML5Mode == false) {
      hash = window.location.hash.replace(/^#\//, '');
    } else if (app.router.getPathName().indexOf('/') > 0) {
      hash = '/' + app.router.getPathName();
    } else {
      hash = app.router.getPathName();
    }

    var hashPattern = app.router.__createPathPattern(hash);

    var viewData = {
      endpoint: null,
      data: null
    };

    for (var pathValue in app.router.__endpoints) {

      if (app.router.__endpoints[pathValue].__pathPattern.pattern.length == hashPattern.pattern.length
        && app.router.__checkPathIntegrity(hashPattern, app.router.__endpoints[pathValue].__pathPattern)) {
        var currentEndpoint = app.router.__endpoints[pathValue];
        var currentEndpointData = app.router.__getPathData(hashPattern, app.router.__endpoints[pathValue].__pathPattern);

        if (currentEndpoint.__isModal == true) {

          if (app.util.System.isEmpty(app.previousController)) {
            currentEndpoint.controller = currentEndpoint.defaultController;
          } else {
            currentEndpoint.controller = app.previousController;
          }

        }

        viewData = {
          endpoint: currentEndpoint,
          data: currentEndpointData
        };

        break;

      }

    }

    app.router.__setCacheViewData('DATA', viewData);

    return viewData;

  },

  /**
   * @public
   *
   * Function applies given @pathParams to the current
   * browser URL.
   *
   * If given @pathParams not contains or contains undefined
   * or null value for specified param, then function omits it
   *
   * @param pathParams
   */
  setPathParams: function (pathParams) {

    var currentViewData = app.router.__getCurrentViewData();

    for (var pathParam in pathParams) {

      if (currentViewData.data.pathParams[pathParam]
        && !app.util.System.isNull(pathParams[pathParam])) {
        currentViewData.data.pathParams[pathParam] = pathParams[pathParam];
      }

    }

    app.router.__redirectToView(currentViewData.endpoint.__pathValue, currentViewData.data.pathParams, currentViewData.data.urlParams, true);


  },

  /**
   * @public
   *
   * Function applies given @urlParams to the current
   * browser URL
   *
   * If given @urlParams not contains or contains undefined
   * or null value for specified param, then function omits it
   *
   *
   *
   * @param urlParams
   */
  setURLParams: function (urlParams) {

    var currentViewData = app.router.__getCurrentViewData();

    var newURLParams = {};

    for (var urlParam in urlParams) {

      if (urlParams[urlParam] !== null) {
        newURLParams[urlParam] = urlParams[urlParam];
      }

    }

    currentViewData.data.urlParams = newURLParams;

    app.router.__redirectToView(currentViewData.endpoint.__pathValue, currentViewData.data.pathParams, currentViewData.data.urlParams, true);

  },

  /**
   * @public
   *
   * Function returns current URI
   *
   */
  getCurrentRoute: function () {

    if (app.router.__routerHTML5Mode == true) {

      if (app.router.getPathName().indexOf('/') == 1) {
        return app.router.getPathName().substring(1, app.router.getPathName().length);
      }

      return app.router.getPathName();

    }

    return window.location.hash.replace('#/', '');

  },

  /**
   * @public
   * @ToImplement
   *
   * Function invokes after preparing path in @_redirectToView function
   * Developer can change @path value using given arguments
   */
  redirectToViewHandler: null,

  /**
   * @public
   * @ToImplement
   *
   */
  lastPathHandler: null,


  /**
   * @private
   *
   * Function redirects to given @path defined in @app.config.routing
   * object and applies given @pathParams and @urlParams to @path
   *
   * @param path
   * @param pathParams
   * @param urlParams
   */
  __redirectToView: function (path, pathParams, urlParams, preventReloadPage) {

    app.router.__clearCacheViewData();

    if (app.util.System.isNull(path)) {
      app.system.__throwError(app.system.__messages.REDIRECT_NO_PATH);
    }

    path = path.replace('#/', '/');

    if (path[0] !== '/') {
      path = '/' + path;
    }

    path = app.util.System.preparePathDottedParams(path, pathParams);
    path = app.util.System.prepareUrlParams(path, urlParams);

    if (app.router.redirectToViewHandler) {
      path = app.router.redirectToViewHandler(path, pathParams, urlParams, preventReloadPage);
    }

    if (preventReloadPage == true) {
      app.router.__preventReloadPage = path.length > 0 && path.charAt(0) === '/' ? path : '/' + path;
    }

    if (app.router.__routerHTML5Mode == true) {
      app.router.__lastPath = app.router.lastPathHandler ? app.router.lastPathHandler(window.location.pathname) : window.location.pathname;
      app.router.__pushState(path);
    } else {
      app.router.__lastPath = app.router.lastPathHandler ? app.router.lastPathHandler(window.location.hash.replace('#/', '/')) : window.location.hash.replace('#/', '/');
      window.location.hash = path;
    }

  },

  /**
   * @private
   *
   * Wrapper for history.pushState
   */
  __pushState: function (path) {
    history.pushState({state: path}, null, path);
  },

  /**
   * @public
   *
   * Substitute function to @getCurrentViewData
   */
  getViewData: function () {
    var currentViewData = app.router.__getCurrentViewData();
    return $.extend({}, currentViewData.endpoint, currentViewData.data);
  },

  /**
   * @public
   *
   * Substitute function to @renderCurrentView
   */
  reloadView: function () {
    app.router.__renderCurrentView();
  },

  /**
   * @private
   *
   * Function retrieves current view data from current browser URL
   * and renders matched endpoint  defined in @app.config.routing
   *
   */
  __renderCurrentView: function () {

    var currentEndpointData = app.router.__getCurrentView();
    app.debug('current view to render {0}', [currentEndpointData]);

    if (currentEndpointData.__isModal == true) {

      app.debug('rendering controller & modal, previous controller: ' + app.previousController);

      if (app.previousController == null) {

        app.debug('rendering controller & modal, default controller: ' + currentEndpointData.__defaultController);

        app.system.render(app.controller[currentEndpointData.__defaultController], currentEndpointData, currentEndpointData.__onRouteEventWithModal);
      } else {
        app.system.render(app.modal[currentEndpointData.__modal], currentEndpointData, currentEndpointData.__onRouteEvent);
        app.router.__refreshCurrentHyperlinkCache();
      }

    } else {
      app.system.render(app.controller[currentEndpointData.__controller], currentEndpointData, currentEndpointData.__onRouteEvent);
    }

    app.previousController = currentEndpointData.__controller;

  },

  /**
   * @private
   *
   * Refresh all hyperlinks on page redirecting to modals
   * Refresh for current route only
   *
   */
  __refreshCurrentHyperlinkCache: function () {

    var currentEndpoint = app.router.__getCurrentViewData();

    var timestamp = new Date().getTime();

    $('a[href*="' + app.router.__getPathValueWithoutParams(currentEndpoint.endpoint.__pathValue) + '"]').each(function () {

      var hyperLinkUrl = $(this).attr('href');

      if (hyperLinkUrl.indexOf('?') > -1) {
        hyperLinkUrl += '&t=' + timestamp;
      } else {
        hyperLinkUrl += '?t=' + timestamp;
      }

      $(this).attr('href', hyperLinkUrl);

    });

  },

  /**
   * @private
   *
   * Returns path value without path params
   *
   * @param pathValue
   */
  __getPathValueWithoutParams: function (pathValue) {

    if (pathValue.indexOf(':') > -1) {
      return pathValue.substring(0, pathValue.indexOf(':'));
    }

    return pathValue;

  },

  /**
   * @public
   *
   * Renders controller based on passed @path param
   * declared in @app.config.routing
   *
   * Optionally can apply @pathParams and @urlParams
   *
   * Window location will be set
   *
   * @param path
   * @param pathParams
   * @param urlParams
   */
  redirect: function (path, pathParams, urlParams, preventReloadPage) {
    app.router.__redirectToView(path, pathParams, urlParams, preventReloadPage);
  },

  /**
   * @public
   *
   * Renders controller based on passed @path param
   * declared in @app.config.routing
   *
   * Optionally can apply @pathParams and @urlParams
   *
   * Window location will be set
   *
   * @param routeName
   * @param pathParams
   * @param urlParams
   */
  redirectByName: function (routeName, pathParams, urlParams, preventReloadPage) {
    app.router.__redirectToView(app.router.byName(routeName), pathParams, urlParams, preventReloadPage);
  },

  /**
   * @public
   *
   * Opens given URL/URI using window.location or window.open
   * if @redirectType provided
   *
   * @param url
   * @param redirectType
   */
  location: function (url, redirectType) {

    app.router.__clearCacheViewData();

    if (redirectType) {

      redirectType = redirectType.toLowerCase();

      if (redirectType.indexOf('blank') > -1) {
        redirectType = '_blank';
      } else if (redirectType.indexOf('self') > -1) {
        redirectType = '_self';
      } else if (redirectType.indexOf('parent') > -1) {
        redirectType = '_parent';
      } else if (redirectType.indexOf('top') > -1) {
        redirectType = '_top';
      }

      window.open(url, redirectType);

    } else {
      window.location = url;
    }

  },

  /**
   * @public
   * @ToImplement
   *
   * Handler for @createLink function which is invoked before returning path
   */
  createLinkHandler: null,

  /**
   * @public
   *
   * Prepares passed @path as relative link accepted by router
   *
   * @param path
   */
  createLink: function (path, pathParams, urlParams) {

    if (app.router.__routerHTML5Mode == false) {

      if (path.substring(0, 1) == '/') {
        path = '#' + path;
      } else if (path.substring(0, 1) !== '#') {
        path = '#/' + path;
      }

    }

    path = app.util.System.preparePathDottedParams(path, pathParams);
    path = app.util.System.prepareUrlParams(path, urlParams);

    if (app.router.createLinkHandler) {
      path = app.router.createLinkHandler(path, pathParams, urlParams);
    }

    return path;

  },

  /**
   * @public
   *
   * Function forces going to previous page
   *
   */
  back: function () {
    window.history.go(-1);
  },

  /**
   * Return current pathname
   * Can be overriden for custom purposes
   *
   * @returns {string}
   */
  getPathName: function () {
    return window.location.pathname;
  },


  /**
   * Redirects to constroller
   * @param controllerName
   */
  redirectController: function (controllerName) {

    var controllerEndpoint = app.router.findClosestControllerEndpointForController(controllerName);
    if(controllerEndpoint != null){
      app.router.__redirectToView(controllerEndpoint.__pathValue, {}, {}, false);
    }

  },

  findClosestControllerEndpointForController: function (controllerName) {

    var controllers = [];
    for (var path in app.router.__endpoints) {

      if (app.router.__endpoints[path].controller === controllerName) {
        controllers.push(app.router.__endpoints[path]);
      }

    }

    controllers.sort(function (c1, c2) {
      return c1.__pathPattern.pattern.length > c2.__pathPattern.pattern.length ? 1 : -1;
    });

    if(controllers.length > 0){
      return controllers[0];
    }

    return null;

  }


};

(function (history) {

  var pushState = history.pushState;

  history.pushState = function (state) {

    if (typeof history.onpushstate == "function") {
      history.onpushstate({state: state});
    }

    var result = pushState.apply(history, arguments);
    app.router.__onHistoryChanges();

    return result;

  };

  window.addEventListener('popstate', function (e) {
    app.router.__onHistoryChanges();
  });

})(window.history);

