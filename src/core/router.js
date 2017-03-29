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

        app.router.__registerPath(pathValue, pathObject.controller, pathObject.routingParams, pathObject.onRoute);

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
     * Creates endpoint object.
     *
     * @param pathValue
     * @param pathController
     * @param routingParams
     * @param onRouteEvent
     *
     */
    __registerPath: function (pathValue, pathController, routingParams, onRouteEvent) {

        if (app.router.__endpoints[pathValue]) {
            app.system.__throwError(app.system.__messages.PATH_ALREADY_EXIST, [pathValue]);
        }

        var pathPattern = app.router.__createPathPattern(pathValue);

        //Checks if pattern exists in set of endpoints
        if (app.router.__pathPatternExist(pathPattern)) {
            app.system.__throwError(app.system.__messages.PATH_PATTERN_ALREADY_EXIST, [pathValue, pathPattern.join("").split(app.router.__pathParamReplacement).join("/PATH_PARAM")]);
        }

        app.router.__endpoints[pathValue] = {
            __pathValue: pathValue,
            controller: pathController,
            routingParams: routingParams,
            onRouteEvent: onRouteEvent,
            __pathPattern: pathPattern
        };

    },

    /**
     * @private
     *
     * Function checks if path patterns already exists in set of endpoints
     *
     * @param pathPattern
     */
    __pathPatternExist: function (pathPattern) {

        for (pathValue in app.router.__endpoints) {

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
     * Function initializes router.
     * If @app.config.routingEnabled is setted, then
     * prepare browser URL to work with router.
     *
     * Binds hashchange event.
     *
     */
    __registerRouter: function () {

        if (app.config.routingEnabled) {

            if (window.location.hash.substring(0, 2) !== '#/') {
                window.location.hash = '#/';
            }

            app.router.__renderCurrentView();
            app.__starting = false;

            $(window).bind('hashchange', function (e) {

              if(window.location.hash.replace('#','') == app.router.__preventReloadPage){
                app.router.__preventReloadPage = null;
                app.router.__fireRouteEvents(e);
                return false;
              }

                app.router.__renderCurrentView();

            });

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
            });
        }

        return params;

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
     * Function gets current browser URL data
     *
     * Finally, for given endpoint data sets
     * global info like @private __controller, @public routingParams
     * and @private {__onRouteEvent} properties.
     *
     * Returns those data.
     */
    __getCurrentView: function () {

        var currentEndpointObject = app.router.__getCurrentViewData();

        var currentEndpointData = currentEndpointObject.data;
        var currentEndpoint = currentEndpointObject.endpoint;


        if (currentEndpointData == null && app.router.__endpoints[app.router.__otherwiseReplacement]) {
            currentEndpointData = {
                __controller: app.router.__endpoints[app.router.__otherwiseReplacement].controller,
                routingParams: app.router.__endpoints[app.router.__otherwiseReplacement].routingParams,
                __onRouteEvent: app.router.__endpoints[app.router.__otherwiseReplacement].onRouteEvent,
            };
        } else {
            currentEndpointData.__controller = currentEndpoint.controller;
            currentEndpointData.routingParams = currentEndpoint.routingParams;
            currentEndpointData.__onRouteEvent = currentEndpoint.onRouteEvent;
        }


        return currentEndpointData;

    },

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

        var hash = window.location.hash.replace(/^#\//, '');

        var hashPattern = app.router.__createPathPattern(hash);

        for (var pathValue in app.router.__endpoints) {

            if (app.router.__endpoints[pathValue].__pathPattern.pattern.length == hashPattern.pattern.length
                && app.router.__checkPathIntegrity(hashPattern, app.router.__endpoints[pathValue].__pathPattern)) {
                var currentEndpoint = app.router.__endpoints[pathValue];
                var currentEndpointData = app.router.__getPathData(hashPattern, app.router.__endpoints[pathValue].__pathPattern);

                return {
                    endpoint: currentEndpoint,
                    data: currentEndpointData
                }

            }

        }

        return {
            endpoint: null,
            data: null
        };

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

        for (var urlParam in urlParams) {

            if (currentViewData.data.urlParams[urlParam]
                && !app.util.System.isNull(urlParams[urlParam])) {
                currentViewData.data.urlParams[urlParam] = urlParams[urlParam];
            }

        }

        app.router.__redirectToView(currentViewData.endpoint.__pathValue, currentViewData.data.pathParams, currentViewData.data.urlParams, true);

    },

    /**
     * @public
     *
     * Function returns current URI
     *
     */
    getCurrentRoute: function () {
        return window.location.hash.replace('#/', '');
    },

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

        if (!path) {
            app.system.__throwError(app.system.__messages.REDIRECT_NO_PATH);
        }

        path = path.replace('#/', '/');

        if (path[0] !== '/') {
            path = '/' + path;
        }

        path = app.util.System.preparePathDottedParams(path, pathParams);
        path = app.util.System.prepareUrlParams(path, urlParams);

        if(preventReloadPage == true){
            app.router.__preventReloadPage = path;
        }

        window.location.hash = path;
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

        app.log('current view to render {0}', [currentEndpointData]);

        app.system.render(app.controller[currentEndpointData.__controller], currentEndpointData, currentEndpointData.__onRouteEvent);

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
     * Opens given URL/URI using window.location or window.open
     * if @redirectType provided
     *
     * @param url
     * @param redirectType
     */
    location: function (url, redirectType) {

        if(redirectType){

            redirectType = redirectType.toLowerCase();

            if(redirectType.indexOf('blank') > -1){
                redirectType = '_blank';
            }else if(redirectType.indexOf('self') > -1){
                redirectType = '_self';
            }else if(redirectType.indexOf('parent') > -1){
                redirectType = '_parent';
            }else if(redirectType.indexOf('top') > -1){
                redirectType = '_top';
            }

            window.open(url, redirectType);

        } else {
            window.location = url;
        }

    },

    /**
     * @public
     *
     * Prepares passed @path as relative link accepted by router
     *
     * @param path
     */
    createLink: function (path) {

        if (path.substring(0, 1) == '/') {
            path = '#' + path;
        } else if (path.substring(0, 1) !== '#') {
            path = '#/' + path;
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
        window.history.back();
    }

}