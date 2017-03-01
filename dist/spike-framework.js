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
 * @public  {obj}
 * @public  {log}
 * @public  {error}
 * @public  {debug}
 * @public  {warn}
 * @public  {ok}
 *
 * @private {__print}
 *
 * @fields
 * @public {version}
 * @public {con}
 * @public {mod}
 * @public {com}
 * @public {online}
 * @public {langChanged}
 *
 */
var app = {

    /**
     * @private
     *
     * Information if application is rendering first
     * controller rather than next ones
     */
    __starting: true,

    /**
     * @private
     *
     * Stores DOM elements attributes
     */
    __attributes: {

        TRANSLATION: 'spike-translation',
        VIEW: 'spike-view',
        MODALS: 'spike-modals',

        LISTER_EVENT: 'event',
        LISTER_TEXT: 'text',

    },

    /**
     * @private
     *
     * Declares Spike template engine
     */
    __globalTemplates: '_spike_templates',

    /**
     * @public
     *
     * Spike framework version
     */
    version: '1.8',


    /**
     * @public
     *
     * Stores name of current rendered controller
     */
    currentController: null,

    getCurrentController: function(){
        return app.currentController || app.config.mainController;
    },

    /**
     * @public
     * @object
     *
     * Reference to current rendered controller context
     * Value is an object of current controller
     */
    ctx: null,

    /**
     * @public
     * @map
     * Reference to current rendered modals contexts
     * Value is an map with keys as modal names and values as current hidden/visible
     * modal objects
     */
    mCtx: {},

    /**
     * @public
     *
     * Shortcut with references to components from @app.component
     * as component has context based on controller (it's transparent)
     */
    com: {},

    /**
     * @public
     *
     * Variable contains information if application is in @online or @offline state
     */
    online: false,

    /**
     * @public
     *
     * Function prints JavaScript @object in console
     *
     * @param jsObject
     */
    obj: function (jsObject) {

        if (app.config.showObj) {
            console.log(jsObject);
        }

    },

    /**
     * @public
     *
     * Function prints log message
     *
     * @param logMessage
     * @param logData -- optional
     */
    log: function (logMessage, logData) {

        if (app.config.showLog) {
            app.__print(logMessage, logData, 'LOG');
        }

    },

    /**
     * @public
     *
     * Function prints error message
     *
     * @param errorMessage
     * @param errorData -- optional
     */
    error: function (errorMessage, errorData) {

        if (app.config.showError) {
            app.__print(errorMessage, errorData, 'ERROR');
        }
    },

    /**
     * @public
     *
     * Function prints debug message
     * If @app.config.debug is false then
     * debug message is not print
     *
     * @param debugMessage
     * @param debugData -- optional
     */
    debug: function (debugMessage, debugData) {

        if (app.config.showDebug) {
            app.__print(debugMessage, debugData, 'DEBUG');
        }

    },

    /**
     * @public
     *
     * Function prints warn message
     *
     * @param warnMessage
     * @param warnData -- optional
     */
    warn: function (warnMessage, warnData) {

        if (app.config.showWarn) {
            app.__print(warnMessage, warnData, 'WARN');
        }

    },

    /**
     * @public
     *
     * Function prints ok message
     *
     * @param okMessage
     * @param okData -- optional
     */
    ok: function (okMessage, okData) {

        if (app.config.showOk) {
            app.__print(okMessage, okData, 'OK');
        }

    },

    /**
     * @public
     *
     * Function prints message in console
     * with custom colors
     *
     * @param message
     * @param data -- optional
     * @param type
     */
    __print: function (message, data, type) {

        if (typeof message !== 'string') {
            message = JSON.stringify(message);
        }

        if (data) {
            message = app.util.System.bindStringParams(message, data);
        }

        var color = '';
        switch (type) {
            case 'LOG' :
                color = 'blue';
                break;
            case 'ERROR' :
                color = 'red';
                break;
            case 'DEBUG' :
                color = 'gray';
                break;
            case 'WARN' :
                color = 'orange';
                break;
            case 'OK' :
                color = 'green';
                break;
            default:
                color = 'black';
        }

        if (type == 'ERROR') {

            var stack = new Error().stack;
            var lineAccessingLogger = stack.split("\n");

            var stackStr = '';
            for (var i = 0; i < lineAccessingLogger.length; i++) {
                if(i == lineAccessingLogger.length -1){
                    stackStr += "\n ERROR HERE: "+lineAccessingLogger[i];
                }else{
                    stackStr += "\n"+lineAccessingLogger[i];
                }
            }

            console.log('%c' + app.util.System.currentDateLog() + ' Spike Framework: ' + message + ' stacktrace: ', 'color: ' + color);
            console.log('%c' +stackStr, 'color: ' + color);

        } else {
            console.log('%c' + app.util.System.currentDateLog() + ' Spike Framework: ' + message, 'color: ' + color);
        }

    }

};

/**
 * @public
 *
 * System core object
 * Object designed as main object of Spike framework with most important functions
 * to rendering views and initializing whole application and Cordova
 *
 * @functions
 * @public  {obj}
 *
 * @private {__filterRestrictedNames}
 * @private {__createSelectors}
 * @private {__filterRestrictedNames}
 * @private {__filterRestrictedNames}
 * @private {__filterRestrictedNames}
 *
 * @fields
 * @private {__messages}
 *
 */
app.system = {

    /**
     * @private
     *
     * Set of error/warn messages printed by Spike framework
     */
    __messages: {

        ENUMERATOR_ALREADY_REGISTRED: 'Enumerator {0{ is already registered',
        UTIL_ALREADY_REGISTRED: 'Util {0} is already registred',
        SERVICE_ALREADY_REGISTRED: 'Service {0} is already registred',
        INHERIT_ABSTRACT_NOT_EXIST: 'Inheriting abstracts into {0} - some abstracts not exists',
        ABSTRACT_ALREADY_REGISTRED: 'Abstract {0} is already registred',
        INTERCEPTOR_ALREADY_REGISTRED: 'Interceptor {0} is already registred',
        COMPONENT_NOT_DECLARED_IN_COMPONENTS: 'Component {0} is not declared in "components" property',
        COMPONENT_NOT_DECLARED_IN_VIEW: 'Component {0} is not declared in parent view',
        PARITAL_INCLUDE_NOT_DEFINED: 'Try including not existing partial',
        PARITAL_SELECTOR_NOT_DEFINED: 'Passed selector for Partial {0} is not defined',
        REDIRECT_NO_PATH: 'Try redirect to path but path argument is not defined',
        TRANSLATION_PARSING: 'Translation parsing error for language {0}',
        LISTER_DATA_NOT_ARRAY: 'Lister input data must be an Array object, error evaluating lister named {0}',
        LISTER_ELEMENT_EMPTY: 'Lister element {0} is empty',
        TEMPLATE_NOT_FOUND_ERROR: 'Template named {0} not found',
        INITIAL_VIEW_ERROR: 'No initial view with name: {0}',
        WEBSQL_SUPPORT: 'No WebSQL support in this browser',
        PATH_DEFINITION: 'Path URI and Path object cannot be empty',
        PATH_ALREADY_EXIST: 'Path {0} is already defined',
        PATH_PATTERN_ALREADY_EXIST: 'Path {0} is already defined. Pattern {1} is duplicated',
        MODULE_NOT_EXIST: 'Try rendering not existing module',
        RESTRICTED_NAME: 'Name {0} is restricted in usage in application',
        TRANSLATION_NOT_EXIST: 'No defined language: {0}',
        TRANSLATION_LOAD_WARN: 'Translation file for language: {0} cannot be downloaded, status: {1}',
        OUTSIDE_CONTEXT_COMPONENT_NOT_FOUND: 'Component {0} outside "spike-view" is not defined and cannot be rendered',
        OUTSIDE_CONTEXT_COMPONENT_NOT_GLOBAL: 'Component {0} outside "spike-view" cannot be rendered because is not GLOBAL',
        OUTSIDE_CONTEXT_COMPONENT_NO_NAME: 'One of global component has not defined name'

    },

    /**
     * @private
     *
     * Checks if passed @param name can break application
     *
     * @param name
     */
    __filterRestrictedNames: function (name) {

        var isInvalid = false;

        switch (name) {
            case 'list' :
                isInvalid = true;
                break;
            case 'add' :
                isInvalid = true;
                break;
            case 'register' :
                isInvalid = true;
                break;
            case 'get' :
                isInvalid = true;
                break;
            case 'extend' :
                isInvalid = true;
                break;
            case 'inherits' :
                isInvalid = true;
                break;
        }

        if (isInvalid) {
            this.__throwError(this.__messages.RESTRICTED_NAME, [name])
        }

    },

    /**
     * @private
     *
     * Counter for selectors cache for
     * debug proposes
     *
     */
    __cacheUsageCounter: 0,

    /**
     * @private
     *
     * Storage for cached once used selectors
     *
     */
    __selectorsCache: {},

    /**
     * @private
     *
     * Clears selectors cache, should be executed before
     * new controller rendering
     *
     */
    __clearSelectorsCache: function(){
        app.system.__selectorsCache = {};
    },

    /**
     * @private
     *
     * Function creates selectors for passed HTML @string based
     * on @attr id and @attr name.
     * Function returns set of methods as @jQuery selectors getters
     * and processed HTML @string with replaced attributes with
     * special hashes
     *
     * @param templateHtml
     *
     */
    __createSelectors: function (templateHtml) {

        var selectors = {};

        //Retrieving list of identifiers names
        var idList = app.util.System.findStringBetween(templateHtml, 'id="', '"');
        //Retrieving list of form elements names
        var nameList = app.util.System.findStringBetween(templateHtml, 'name="', '"');

        selectors.names = {};

        //Creating names selectors functions
        $.each(nameList, function (i, name) {

            selectors.names[name] = function () {
                return $('[name="' + name + '"]');
            }

        });

        //Creating identifiers selectors functions
        $.each(idList, function (i, id) {

            //Creating new hash for identifier
            var newId = id + '-' + app.util.System.hash();

            //Creating handler function for identifier with optional basic events binding by @jQuery
            selectors[id] = function (eventsToBind) {

                var selector = app.system.__selectorsCache[newId];

                if(!selector){
                    selector =  $('#' + newId);
                    selector.plainId = newId;
                    app.system.__selectorsCache[newId] = selector;
                }else{
                    app.system.__cacheUsageCounter++;
                }


                $.each(eventsToBind, function (eventName, eventCallback) {

                    if (eventName == 'click') {
                        selector.click(eventCallback);
                    } else if (eventName == 'change') {
                        selector.change(eventCallback);
                    } else {
                        selector.on(eventName, eventCallback);
                    }

                });

                return selector;

            };

            //Replacing identifier with generated hash
            templateHtml = templateHtml.replace('id="' + id + '"', 'id="' + newId + '"');

        });

        return {
            html: templateHtml,
            selectors: selectors
        };

    },


    /**
     * @private
     *
     * Invokes @app.events.onRender event if exist
     *
     **/
    __onRenderEvent: function () {
        if (app.events.onRender) {
            app.events.onRender();
        }
    },

    /**
     * @private
     *
     * Throws @error from Spike framework
     *
     * @param errorMessage
     * @param errorMessageBinding
     *
     **/
    __throwError: function (errorMessage, errorMessageBinding) {
        throw new Error('Spike Framework: ' + app.util.System.bindStringParams(errorMessage, errorMessageBinding));
    },

    /**
     * @private
     *
     * Throws @error from Spike framework
     *
     * @param errorMessage
     * @param errorMessageBinding
     *
     **/
    __throwWarn: function (warnMessage, warnMessageBinding) {
        app.warn('Spike Framework: ' + app.util.System.bindStringParams(warnMessage, warnMessageBinding));
    },

    /**
     * @private
     *
     * Function renders @modal object passed from @app.modal
     * Renders @modal with @modalInitialData and executes
     * @afterRenderCallback after rendering is done
     *
     * @param modalObject
     * @param modalInitialData
     * @param afterRenderCallback
     *
     */
    __renderModal: function (modalObject, modalInitialData, afterRenderCallback) {
        app.debug('Invoke system.__renderModal with params: {0} {1} {2}', [modalObject, modalInitialData, afterRenderCallback]);
        app.log('Rendering modal {0}', [modalObject.__name]);

        //Checks network status
        if (modalObject.checkNetwork == true) {
            app.__cordova.checkNetwork();
        }

        if (modalInitialData == undefined) {
            modalInitialData = null;
        }

        //Renders modal
        modalObject.__render(modalInitialData);

        app.system.__onRenderEvent();

        if (afterRenderCallback) {
            afterRenderCallback();
        }

    },

    /**
     * @private
     *
     * Function renders @controller object passed from @app.controller
     * Renders @controller with @controllerInitialData and executes
     * @afterRenderCallback after rendering is done
     *
     * @param controllerObject
     * @param controllerInitialData
     * @param afterRenderCallback
     *
     */
    __renderController: function (controllerObject, controllerInitialData, afterRenderCallback) {
        app.debug('Invoke system._renderController with params: {0} {1} {2}', [controllerObject, controllerInitialData, afterRenderCallback]);
        app.log('Rendering controller {0}', [controllerObject.__name]);

        //Scrolling to top of page
        $(window).scrollTop(0);

        //Invalidates all existing modals (even hidden)
        app.modal.invalidateAll();

        if (controllerObject.checkNetwork == true) {
            app.__cordova.checkNetwork();
        }

        if (controllerInitialData == undefined) {
            controllerInitialData = null;
        }

        //Clears selectors cache
        app.system.__clearSelectorsCache();

        //Renders controller
        controllerObject.__render(controllerInitialData);

        app.system.__onRenderEvent();

        if (afterRenderCallback) {
            afterRenderCallback();
        }

        app.ok('Selectors cache usage during app lifecycle: '+app.system.__cacheUsageCounter);

    },

    /**
     * @public
     *
     * Renders passed @module object with initial data.
     * If object not exists, then throw error.
     *
     * If object type is CONTROLLER then invoke @private __renderController
     * If object type is MODAL then invoke @private __renderModal
     *
     * @param moduleObject
     * @param moduleInitialData
     * @param afterRenderCallback
     */
    render: function (moduleObject, moduleInitialData, afterRenderCallback) {

        if (!moduleObject) {
            app.system.__throwError(app.system.__messages.MODULE_NOT_EXIST);
        }

        if (moduleObject.__type == 'CONTROLLER') {
            app.system.__renderController(moduleObject, moduleInitialData, afterRenderCallback);
        } else if (moduleObject.__type == 'MODAL') {
            app.system.__renderModal(moduleObject, moduleInitialData, afterRenderCallback);
        }

    },

    /**
     * @public
     *
     * Returns main view @jQuery selector
     *
     */
    getView: function () {
        return $('[' + app.__attributes.VIEW + ']');
    },

    /**
     * @private
     *
     * Sets plain (without Spike support) HTML template
     * before whole application start initializing with Cordova
     *
     * Can be used as loading screen, splash screen etc.
     *
     * View is defined in @app.config.initialView
     *
     */
    __initialView: function () {
        app.debug('Running system.initialView');

        var viewSelector = app.system.getView();

        if (app.config.initialView && app.config.initialView.trim().length > 0) {

            try {
                var templateHtml = window[app.__globalTemplates][app.config.initialView];
                viewSelector.html(templateHTML);
            } catch (err) {
                app.system.__throwError(app.system.__messages.INITIAL_VIEW_ERROR, [app.config.initialView])
            }

        }


    },

    /**
     * @private
     *
     * Main function initializing Spike framework and Cordova.
     * Switch debug mode and prints jQuery and Spike version.
     *
     * Waits for @document ready state and initialize Cordova and Spike
     * for local or device mode.
     *
     * @param callBack --optional
     *
     */
    init: function (callBack) {
        app.debug('Invoke system.init with params: {0}', [callBack]);

        app.ok('System initializing...');

        app.debug('veryfing views');
        app.modal.__verifyView();
        app.controller.__verifyView();

        app.warn('jQuery version: {0}', [jQuery.fn.jquery]);
        app.warn('Spike version: {0}', [app.version]);

        //Waits until document is ready
        $(document).ready(function () {

            //Renders global components defined outside 'spike-view'
            app.component.__initGlobalComponents();

            //Registreing router
            app.router.__registerRouter();

            //Renders defined initial view (loading, splash etc)
            app.system.__initialView();

            app.__cordova.__initializeCordova(function () {

                app.ok('Cordova initialized with app.config.mobileRun = {0}', [app.config.mobileRun]);

                if (app.config.mobileRun) {
                    app.__cordova.__deviceReadyCallBack = function () {
                        app.__database.__createDB(callBack);
                    };
                } else {
                    app.events.onDeviceReady();
                    app.__database.__createDB(callBack);
                }

            });


        });


    },

    /**
     *
     * @public
     *
     * Function changes whole application language translations.
     * Sets app.config.lang with passed new default language code
     *
     * Function replacing existing translations in DOM
     *
     * @param langCode
     */
    changeLanguage: function (langCode) {
        app.debug('Invoke system.changeLanguage with params: {0}', [langCode]);

        app.config.lang = langCode;

        app.message.__translate();

    },

    /**
     * @public
     *
     * Function exits application
     *
     */
    exit: function () {
        app.debug('Invoke system.exit');

        if (app.config.mobileRun) {
            navigator.app.exitApp();
        } else {
            console.warn('EXIT APP');
            app.modal.invalidateAll();
        }


    },

    /**
     * @public
     *
     * Function disables AJAX caching
     *
     */
    disableCache: function () {
        $.ajaxSetup({cache: false});
    },


    /**
     * @private
     *
     * Function executed when DOM is ready, database is created and Cordova
     * application is ready.
     *
     * Invokes @event ready and renders @app.config.mainController
     *
     * @params callBack
     */
    __mainRender: function (callBack) {
        app.debug('Invoke system.__mainRender with params: {0}', [callBack]);

        if (app.events.onReady) {
            app.events.onReady();
        }

        app.ok('Spike application ready to work...');

        app.debug('Try to invoke system.render with controller: {0}', [app.config.mainController]);

        if(!app.config.routingEnabled){
            app.system.render(app.controller[app.config.mainController], null, callBack);
            app.__starting = false;
        }

    },

    /**
     * @private
     *
     * Function executed when Spike cannot create SQLLite
     * database using WebSQL or cordova-sqlite-storage
     *
     * Practically Spike local testing works only with Chrome
     *
     */
    __noSupport: function () {

        var isChromium = window.chrome, winNav = window.navigator, vendorName = winNav.vendor, isOpera = winNav.userAgent.indexOf("OPR") > -1, isIEedge = winNav.userAgent.indexOf("Edge") > -1, isIOSChrome = winNav.userAgent.match("CriOS");

        if (!isIOSChrome && !isChromium && !isOpera) {
            $('body').append('<div class="no-browser">Sorry,</br>you can test mobile app only in Chrome</div>');
            app.system.__throwError(app.system.__messages.WEBSQL_SUPPORT);
        }

    }

};

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
    __getRouterFactory: function(){
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
    __otherFunction: function(pathObject){
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

            if(window.location.hash.substring(0,2) !== '#/'){
                window.location.hash = '#/';
            }

            app.router.__renderCurrentView();
            app.__starting = false;

            $(window).bind('hashchange', function (e) {
                app.router.__renderCurrentView();
                app.router.__fireRouteEvents(e);
            });

        }

    },

    /**
     * @private
     *
     * Function iterate all registred events and fire them
     */
    __fireRouteEvents: function(e){

        var currentRoute = app.router.getCurrentRoute();

        $.each(app.router.__events, function(eventName, eventFunction){

            if(eventFunction){
                eventFunction(e, currentRoute, app.currentController);
            }

        });

    },


    /**
     * @public
     *
     * Function registers new route event fired when route changing
     */
    onRouteChange: function(eventName, eventFunction){

        if(app.router.__events[eventName]){
            app.system.__throwWarn(app.system.__messages.ROUTE_EVENT_ALREADY_REGISTRED, [eventName]);
        }

        app.router.__events[eventName] = eventFunction;

    },

    /**
     * @public
     *
     * Function unregisters route event
     */
    offRouteChange: function(eventName){

        if(app.router.__events[eventName]){
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
     * @private
     *
     * Function returns object with params stored in current browser URL
     *
     */
    __getURLParams: function () {

        var params = {};

        if(window.location.href.indexOf('?') > -1){
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
        }else{
            currentEndpointData.__controller = currentEndpoint.controller;
            currentEndpointData.routingParams =  currentEndpoint.routingParams;
            currentEndpointData.__onRouteEvent =  currentEndpoint.onRouteEvent;
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
    setPathParams: function(pathParams){

        var currentViewData = app.router.__getCurrentViewData();

        for(var pathParam in pathParams){

            if(currentViewData.data.pathParams[pathParam]
            && !app.util.System.isNull(pathParams[pathParam])){
                currentViewData.data.pathParams[pathParam] = pathParams[pathParam];
            }

        }

        app.router.__redirectToView(currentViewData.endpoint.__pathValue, currentViewData.data.pathParams, currentViewData.data.urlParams);



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
    setURLParams: function(urlParams){

        var currentViewData = app.router.__getCurrentViewData();

        for(var urlParam in urlParams){

            if(currentViewData.data.urlParams[urlParam]
                && !app.util.System.isNull(urlParams[urlParam])){
                currentViewData.data.urlParams[urlParam] = urlParams[urlParam];
            }

        }

        app.router.__redirectToView(currentViewData.endpoint.__pathValue, currentViewData.data.pathParams, currentViewData.data.urlParams);

    },

    /**
    * @public
    *
    * Function returns current URI
    *
    */
    getCurrentRoute: function () {
       return window.location.hash.replace('#/','');
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
    __redirectToView: function(path, pathParams, urlParams){

        if(!path){
            app.system.__throwError(app.system.__messages.REDIRECT_NO_PATH);
        }

        path = path.replace('#/','/');

        if(path[0] !== '/'){
            path = '/'+path;
        }

        path = app.util.System.preparePathDottedParams(path, pathParams);
        path = app.util.System.prepareUrlParams(path, urlParams);

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
    redirect: function(path, pathParams, urlParams){
        app.router.__redirectToView(path, pathParams, urlParams);
    },

    /**
     * @public
     *
     * Prepares passed @path as relative link accepted by router
     *
     * @param path
     */
    createLink: function(path){

        if(path.substring(0,1) == '/'){
            path = '#'+path;
        }else if(path.substring(0,1) !== '#'){
            path = '#/'+path;
        }

        return path;

    },

    /**
     * @public
     *
     * Function forces going to previous page
     *
     */
    back: function(){
        window.history.back();
    }

}/**
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

};/**
 * @public
 *
 * Events module
 * Module designed for implementing Cordova default events
 *
 * Allowed events overriding :
 *
 * render
 * offline
 * online
 * dom
 * back
 * ready
 *
 * You can add own custom events to use by your application li
 *
 * @functions
 * @public {domEvents}
 * @public {onOnline}
 * @public {onOffline}
 * @public {onBack}
 * @public {onDeviceReady}
 * @public {onReady}
 * @public {extend}
 *
 * @private {__functionName}
 * @private {__extend}
 *
 */
app.events = {


  /**
   * @public
   * @toImplement
   *
   * Additional @event function executed when Spike
   * controller or modal is rendered
   *
   */
  onRender: function () {
  },


  /**
   * @public
   * @toImplement
   *
   * Additional @event function executed when Cordova is initializing
   * Can contain any global events registred via @window.addEventListener
   * or @document.addEventListener
   *
   */
  domEvents: function () {
  },


  /**
   * @public
   * @toImplement
   *
   * Additional @event function executed when application is in @online state
   *
   */
  onOnline: function () {
  },

  /**
   * @public
   * @toImplement
   *
   * Additional @event function executed when application is in @offline state
   *
   */
  onOffline: function () {
  },

  /**
   * @public
   * @toImplement
   *
   * Additional @event function executed when @back event happens
   *
   * If there aren't rendered modals and current controller has not
   * overriden @onBack function then application invokes this function
   *
   * More info in @app.__cordova.__onBack function
   *
   */
  onBack: function () {
  },

  /**
   * @public
   * @toImplement
   *
   * Additional @event function executed when Cordova application is ready (device)
   *
   */
  onDeviceReady: function () {
  },

  /**
   * @public
   * @toImplement
   *
   * Additional @event function executed when Spike application is ready
   * Invokes before rendering @app.config.mainController
   *
   */
  onReady: function () {
  },


  /**
   * @public
   *
   * Function to extending and overriding default events with new implementations defined by user
   *
   * @param eventsMap
   *
   */
  extend: function (eventsMap) {

    $.each(eventsMap, function (eventName, eventCallback) {
      app.events.__extend(eventName, eventCallback);
    })

  },

  /**
   * @private
   *
   * Returns mapped event name to function name
   *
   * @param eventName
   */
  __functionName: function (eventName) {

    switch (eventName) {
      case 'render':
        return 'onRender';
      case 'offline':
        return 'onOffline';
      case 'online':
        return 'onOnline';
      case 'dom':
        return 'domEvents';
      case 'back':
        return 'onBack';
      case 'ready':
        return 'onReady';
      default:
        return eventName;
    }

  },

  /**
   * @private
   *
   * Function to saving new event implementation
   *
   * @param eventName
   * @param eventCallback
   */
  __extend: function (eventName, eventCallback) {

    app.events[app.events.__functionName(eventName)] = eventCallback;

  }


};/**
 * @private
 *
 * Cordova module
 * Module designed for usage as cordova provider.
 * Should be used only by framework
 *
 * Only one active instance in time is available
 *
 * @functions
 * @private {__initializeCordova}
 * @private {__bindDOMEvents}
 * @private {__checkNetwork}
 * @private {__onBack}
 * @private {__onDeviceReady}
 * @private {__onOnline}
 * @private {__onOffline}
 *
 * @fields
 * @private {__deviceReadyCallBack}
 *
 */
app.__cordova = {

    /**
     * @private
     *
     * Callback executed when device is ready
     */
    __deviceReadyCallBack: null,

    /**
     * @private
     *
     * Function to initialize Cordova application
     * Invokes passed callback function if initialization ends
     * @param callBack
     */
    __initializeCordova: function (callBack) {
        app.debug('Invoke cordova.__initializeCordova with params: {0}', [callBack]);
        app.__cordova.__bindDOMEvents();
        callBack();
    },

    /**
     * @private
     *
     * Function binding Cordova events
     * If @app.events.domEvents exitst then executes
     *
     */
    __bindDOMEvents: function () {
        app.debug('Invoke cordova.__bindDOMEvents');

        document.addEventListener('deviceready', app.__cordova.__onDeviceReady, false);
        document.addEventListener('backbutton', app.__cordova.__onBack, false);

        if (app.events.domEvents !== undefined) {
            app.events.domEvents();
        }

    },

    /**
     * @private
     *
     * Function to initialize Cordova application
     *
     * @param callBack
     */
    __checkNetwork: function () {
        app.debug('Invoke cordova.__checkNetwork');

        app.plugins.wrapper.network.connection(function () {
            app.__cordova.__onOnline();
        }, function () {
            app.__cordova.__onOffline();
        });

    },


    /**
     * @private
     *
     * Function to realize back @event
     *
     * If modal is rendered and has overriden @onBack function
     * then invoke overriden @onBack
     *
     * If modal is rendered and has not overriden @onBack function
     * then invoke @app.modal.invalidateAll() function to hide modal
     *
     * if controller is rendered and has overriden @onBack function
     * then invoke  @app.modal.invalidateAll() function to hide modal
     * and then invoke overriden @onBack
     *
     * If there aren't rendered modals and current controller has not
     * overriden @onBack function then invoke @app.events.onBack
     *
     * @param e
     *
     */
    __onBack: function (e) {
        app.debug('Invoke cordova.__onBack');

        if (e) {
            e.preventDefault();
        }

        if (app.mCtx !== null && app.mCtx.onBack !== undefined) {
            app.mCtx.onBack();
        } else if (app.mCtx !== null && app.mCtx.onBack == undefined) {
            app.modal.invalidateAll()
        } else if (app.ctx !== null && app.ctx.onBack !== undefined) {
            app.modal.invalidateAll()
            app.ctx.onBack();
        } else {

            if (app.events.onBack) {
                app.events.onBack();
            }

        }

    },

    /**
     * @private
     *
     * Function executed when Cordova app is ready
     * Invokes @private __deviceReadyCallBack
     *
     */
    __onDeviceReady: function () {
        app.debug('Invoke cordova.__onDeviceReady');

        if (app.__cordova.__deviceReadyCallBack) {
            app.__cordova.__deviceReadyCallBack();
        }

    },

    /**
     * @private
     *
     * Function executes when application is in @online state
     * Invokes @app.events.onOnline
     *
     */
    __onOnline: function () {
        app.debug('Invoke cordova.__onOnline');

        app.online = true;

        if (app.events.onOnline) {
            app.events.onOnline();
        }

    },

    /**
     * @private
     *
     * Function executes when application is in @offline state
     * Invokes @app.events.onOffline
     *
     */
    __onOffline: function () {
        app.debug('Invoke cordova.__onOffline');

        app.online = false;

        if (app.events.onOffline) {
            app.events.onOffline();
        }

    },

};/**
 * @public
 *
 * Message module
 * Module designed for usage as singleton during application lifecycle.
 * Can be used in any other modules.
 *
 * Only one active instance in time is available
 *
 * @functions
 * @public  {add}
 * @public  {register}
 * @public  {get}
 *
 * @private {__replace}
 *
 * @fields
 * @private __messages
 *
 */
app.message = {

  /**
   * @private
   * Information if translations has been downloaded
   */
  __waitingForTranslations: {},

  /**
   * @private
   * Storage for translation data
   */
  __messages: {},

  /**
   * @public
   *
   * Substitute method for register
   *
   * @param languageName
   * @param languageFilePath
   */
  add: function (languageName, languageFilePath) {
    this.register(languageName, languageFilePath);
  },

  /**
   * @public
   *
   * Registering new language translation from hosted file
   * File can be hosted locally or from server
   *
   * @param languageName
   * @param languageFilePath
   */
  register: function (languageName, languageFilePath) {

    app.log('register translation {0}', [languageName]);

    app.message.__waitingForTranslations[languageName] = false;

    $.ajax({
      url: languageFilePath,
      type: 'GET',
      success: function (data) {

        app.log('AJAX loaded');

        app.message.__setTranslation(languageName, data);

      },
      error: function (error) {

        app.log('AJAX error {0} ', [error]);

        if (error.status == 200) {
          app.message.__setTranslation(languageName, error.responseText);
        } else {
          app.message.__messages[languageName] = {};
          app.system.__throwWarn(app.system.__messages.TRANSLATION_LOAD_WARN, [languageName, error.status]);
        }

      }
    });

  },

  __setTranslation: function (languageName, translationData) {

    if (typeof translationData === 'string') {

      try {
        translationData = JSON.parse(translationData);
      } catch (err) {
        app.system.__throwError(app.system.__messages.TRANSLATION_PARSING, [languageName]);
      }

    }

    app.message.__messages[languageName] = translationData;
    app.message.__waitingForTranslations[languageName] = true;
  },


  /**
   * @public
   *
   * Function to retrieve single translation for named message
   * using existing language from @app.config.lang
   *
   * @param messageName
   */
  get: function (messageName) {
    return app.message.__messages[app.config.lang][messageName] || messageName;
  },

  /**
   * @private
   *
   * Function to translate all existing messages in DOM
   * Wait's until translation file is downloaded
   *
   *
   * @param html
   */
  __translate: function () {

    if (app.message.__waitingForTranslations[app.config.lang] == undefined) {
      app.system.__throwError(app.system.__messages.TRANSLATION_NOT_EXIST, [app.config.lang])
    }

    setTimeout(function () {

      if (app.message.__waitingForTranslations[app.config.lang] == true) {
        app.message.__translateDOM();
      } else if (app.message.__waitingForTranslations[app.config.lang] == false) {
        app.message.__translate();
      }

    }, 100);

  },

  /**
   * @private
   *
   * Function to translate all existing messages in DOM based on @attr spike-translation
   *
   * @param html
   */
  __translateDOM: function () {

    app.log('__translateDOM');

    $(document).ready(function () {

      $('[' + app.__attributes.TRANSLATION + ']').each(function () {

        var messageName = $(this).attr(app.__attributes.TRANSLATION);
        $(this).html(app.message.__messages[app.config.lang][messageName] || messageName);

      });

    });

  },

  /**
   * @private
   *
   * Replaces all occurences of translation keys to translations
   * in template html
   * @param templateHtml
   */
  __replaceTemplateKeys: function (templateHtml) {

    for(var messageName in app.message.__messages[app.config.lang]){

      templateHtml = templateHtml.split('>'+messageName+'<').join('>'+app.message.__messages[app.config.lang][messageName]+'<');

    }

    return templateHtml;
  }

};/**
 * @public
 *
 * Component module
 * Reusable module designed for usage in controllers and modals. Also can be used in another components.
 *
 * @functions
 * @public  {add}
 * @public  {register}
 * @private {__initComponents}
 *
 * @fields
 * @private {__dataArchive}
 *
 */
app.component = {

    /**
     * @private
     * Storage for components instances
     */
    __dataArchive: {},

    /**
     * @public
     *
     * Substitute method for register
     *
     * @param componentName
     * @param componentObject
     */
    add: function (componentName, componentObject) {
        this.register(componentName, componentObject);
    },


    /**
     * @public
     *
     * Registering new component in application
     * Creates component object
     *
     * @param componentName
     * @param componentObject
     */
    register: function (componentName, componentObject) {

        // Filter if name is invalid (can break application)
        app.system.__filterRestrictedNames(componentName);

        if(componentObject.inherits){
            // Apply extending from abstracts
            componentObject = app.abstract.__tryExtend(componentName, componentObject.inherits, componentObject);
        }

        app.log('Registering component {0}', [componentName]);
        app.debug('Invoke component.register with params: {0} {1}', [componentName, componentObject]);


        //Setting type of module
        componentObject.__type = 'COMPONENT';

        //Setting self helper
        componentObject.self = function() {
            return app.component[componentName];
        }

        //Setting original name of module
        componentObject.__name = componentName;

        //Setting name starting from lower case, used with templates and directories names of component
        componentObject.__lowerCaseName = componentName.substring(0, 1).toLowerCase() + componentName.substring(1, componentName.length);

        //Setting variable which is setted to true once if component is global
        componentObject.__globalRendered = false;

        //Setting @private global variable on component
        if(componentObject.global){
            componentObject.__global = true;
        }else{
            componentObject.__global = false;
        }

        /**
         * @private
         *
         * Function that renders component
         * Creates new component object based ond __dataArchive and assign reference to shortcut app.com[componentName]
         * Creates component HTML template using @function @private __loadTemplate()
         * Passing component processed template to DOM element @element component with it's @attr name attribute
         * Rendering components used in rendered component
         * Initializing component with componentDataPassed
         * @param componentDataPassed
         * @private
         */
        componentObject.__render = function (componentDataPassed) {
            app.debug('Invoke componentObject.__render on {0} component with params: {1}', [componentObject.__name, componentDataPassed]);

            if(app.component[componentObject.__name] && app.component[componentObject.__name].__global == true && app.component[componentObject.__name].__globalRendered == true){
                app.debug('Component {0} is already globally rendered. Returning from _render...', [componentObject.__name]);
                return;
            }else if(app.component[componentObject.__name] && app.component[componentObject.__name].__global == true && app.component[componentObject.__name].__globalRendered == false){
                app.debug('Component {0} will be rendered globally', [componentObject.__name]);
                app.component[componentObject.__name].__globalRendered = true;
            }

            app.component[componentObject.__name] = $.extend(true, {}, app.component.__dataArchive[componentObject.__name]);
            app.com[componentObject.__name] = app.component[componentObject.__name];

            app.com[componentObject.__name].__loadTemplate();

            if(!componentDataPassed){
                componentDataPassed = {};
            }

            app.debug('Binding component {0} template to DOM', [app.com[componentObject.__name].__name]);

            var componentSelector = $('component[name="' + app.com[componentObject.__name].__lowerCaseName + '"]');

            //Throws exception if component was declared in some module ex. controller, but is not declared in it's view
            if(!componentSelector){
                app.system.__throwError(app.system.__messages.COMPONENT_NOT_DECLARED_IN_VIEW, [componentObject.__name]);
            }

            app.debug('Reading component {0} inline params', [app.com[componentObject.__name].__name]);

            var inlineAttributes = componentSelector.attrs();
            componentDataPassed = $.extend(true, componentDataPassed, inlineAttributes);

            componentSelector.replaceWith(app.com[componentObject.__name].__template);

            //Translate DOM
            app.message.__translate();

            componentDataPassed = $.extend(true, componentDataPassed, app.router.__getCurrentViewData().data);

            app.component.__initComponents(app.com[componentObject.__name].components);
            app.debug('Invoke component {0} init() function', [componentObject.__name]);

            app.com[componentObject.__name].init(componentDataPassed);

        }

        /**
         * @private
         *
         * Creating path to component view HTML file
         * Creates path based on html2js template file and directories structure
         * @param componentObject
         */
        componentObject.__createComponentViewPath = function (componentObject) {
            app.debug('Invoke componentObject.__createComponentViewPath with params: {0}', [componentObject]);

            componentObject.__view = app.config.rootPath + "/" + app.config.componentDirectory + "/" + componentObject.__lowerCaseName + "/" + componentObject.__lowerCaseName + ".view.html"
        }

        /**
         * @private
         *
         * Function retrieving component's template from global window[templates] variable based on generated view path
         * If template not specified, throw Error
         * Creating dynamic selectors binded to template using @private system.__createSelectors()
         *
         */
        componentObject.__loadTemplate = function () {
            app.debug('Invoke componentObject.__loadTemplate');

            var templateHtml = window[app.__globalTemplates][app.component[componentObject.__name].__view];

            if(!templateHtml){
                app.system.__throwError('No view found for component: {0}, view path: {1}', [componentObject.__name, componentObject.__view]);
            }

            var selectorsObj = app.system.__createSelectors(templateHtml);

            app.component[componentObject.__name].selector = selectorsObj.selectors;
            templateHtml = selectorsObj.html;

            if(app.config.replaceLangKeys){
              templateHtml = app.message.__replaceTemplateKeys(templateHtml);
            }

            app.component[componentObject.__name].__plainTemplate = templateHtml;
            app.component[componentObject.__name].__template = templateHtml;

        }

        //Creating view path once per application initialization
        componentObject.__createComponentViewPath(componentObject);

        //Creating copy of component object in @private __dataArchive and in component[componentName] variable
        app.component.__dataArchive[componentObject.__name] = $.extend(true, {}, componentObject);
        app.component[componentObject.__name] = $.extend(true, {}, componentObject);

    },

    /**
     * @private
     *
     * Function to rendering multiple components across DOM
     *
     * @param componentsArrayOrMap
     * componentsArrayOrMap is array of names of components
     * Example:
     * [ 'COMPONENT_NAME_1', 'COMPONENT_NAME_2' ]
     * or
     * map which has components names as keys and any data object as values to be passed to @function init invocation as argument
     * Example:
     * {
     *  'COMPONENT_NAME' : { id: 1111, name: 'Somebody' }
     * }
     */
    __initComponents: function (componentsArrayOrMap) {
        app.debug('Invoke component.__initComponents with params: {0}', [componentsArrayOrMap]);

        if(componentsArrayOrMap){

            if (componentsArrayOrMap instanceof Array) {

                $.each(componentsArrayOrMap, function (i, componentName) {

                    //Throws exception if component was declared in some view ex controller view, but is not defined
                    if(!app.component[componentName]){
                        app.system.__throwError(app.system.__messages.COMPONENT_NOT_DECLARED_IN_COMPONENTS, [componentName]);
                    }

                    app.component[componentName].__render(null);

                });

            } else {

                $.each(componentsArrayOrMap, function (componentName, componentParams) {

                    //Throws exception if component was declared in some view ex controller view, but is not defined
                    if(!app.component[componentName]){
                        app.system.__throwError(app.system.__messages.COMPONENT_NOT_DECLARED_IN_COMPONENTS, [componentName]);
                    }

                    app.component[componentName].__render(componentParams);
                });

            }

        }

    },

    /**
     * @private
     *
     * Function renders components outside "spike-view" context.
     * In prctice, when developer put <component> tag outside spike view container,
     * then component will be also rendered if is global component
     */
    __initGlobalComponents: function(){

        $('body').find('component').each(function(i, element){

            element = $(this);
            var componentName = element.attr('name');

            if(componentName.length == 0){
                app.system.__throwError(app.system.__messages.OUTSIDE_CONTEXT_COMPONENT_NO_NAME);
            }

            componentName = componentName.substring(0,1).toUpperCase()+componentName.substring(1,componentName.length);

            var component = app.component[componentName];

            if(component){

                if(component.__global == true){
                    component.__render(null);
                }else{
                    app.system.__throwError(app.system.__messages.OUTSIDE_CONTEXT_COMPONENT_NOT_GLOBAL, [componentName]);
                }

            }else{
                app.system.__throwError(app.system.__messages.OUTSIDE_CONTEXT_COMPONENT_NOT_FOUND, [componentName]);
            }

        });

    },

};
/**
 * @public
 *
 * Controller module
 * Module designed for usage as main view during application lifecycle.
 * Cannot be used in another components, modals or controllers.
 *
 * Only one active instance in time is available
 *
 * Redered every time when used @public syste.render()
 * Template is binded to DOM element having @attr view attribute
 *
 * Example:
 * <div view></div>
 *
 * @functions
 * @public  {add}
 * @public  {register}
 * @private {__verifyView}
 *
 * @fields
 * @private {__dataArchive}
 *
 */
app.controller = {

  /**
   * @private
   * Storage for controllers instances
   */
  __dataArchive: {},

  /**
   * @public
   *
   * Substitute method for register
   *
   * @param controllerName
   * @param controllerObject
   */
  add: function (controllerName, controllerObject) {
    this.register(controllerName, controllerObject);
  },

  /**
   * @public
   *
   * Registering new controller in application
   * Creates controller object
   *
   * @param controllerName
   * @param controllerObject
   */
  register: function (controllerName, controllerObject) {

    // Filter if name is invalid (can break application)
    app.system.__filterRestrictedNames(controllerName);

    if (controllerObject.inherits) {
      // Apply extending from abstracts
      controllerObject = app.abstract.__tryExtend(controllerName, controllerObject.inherits, controllerObject);
    }

    app.log('Registering controller {0}', [controllerName]);
    app.debug('Invoke controller.register with params: {0} {1}', [controllerName, controllerObject]);

    //Setting tyope of module
    controllerObject.__type = 'CONTROLLER';

    //Setting self helper
    controllerObject.self = function () {
      return app.controller[controllerName];
    }

    //Setting @public checkNetwork to false if not defined
    if (!controllerObject.checkNetwork) {
      controllerObject.checkNetwork = false;
    }

    //Setting @public components to empty array if not defined
    if (!controllerObject.components) {
      controllerObject.components = [];
    }

    //Setting original name of module
    controllerObject.__name = controllerName;

    //Setting name starting from lower case , used with templates and directories names of controller
    controllerObject.__lowerCaseName = controllerName.substring(0, 1).toLowerCase() + controllerName.substring(1, controllerName.length);


    /**
     * @private
     *
     * Function that renders controller
     * Creates new controller object based ond __dataArchive and assign reference to shortcut app.ctx
     * Creates controller HTML template using @function @private __loadTemplate()
     * Passing controller processed template to DOM element with @attr view attribute
     * Rendering components used in rendered controller
     * Invalidating existing modals
     * Initializing controller with controllerPassedData
     * @param controllerPassedData
     */
    controllerObject.__render = function (controllerPassedData) {
      app.debug('Invoke controllerObject.__render with params: {0}', [controllerPassedData]);

      app.controller[controllerObject.__name] = $.extend(true, {}, app.controller.__dataArchive[controllerObject.__name]);

      var __oldControllerName = app.ctx ? app.ctx.__name : null;

      app.ctx = app.controller[controllerObject.__name];

      app.ctx.__loadTemplate();

      app.currentController = controllerObject.__name.toLowerCase();

      app.debug('Binding controller {0} template to DOM element with "view" attribute ', [app.ctx.__name]);

      if (app.config.transitions && app.config.transitionAnimation) {

        var transitionViewId = 'transition-view' + app.util.System.hash();

        app.controller.__getView().before('<div style="display: none;" id="' + transitionViewId + '">' + app.controller.__getView().html() + '</div>');
        app.controller.__getView().html(app.ctx.__template);

        app.config.transitionAnimation($('#' + transitionViewId), app.controller.__getView(), app.__starting, __oldControllerName, app.ctx.__name, function () {
          $('#' + transitionViewId).remove();
        });

      } else {
        app.controller.__getView().html(app.ctx.__template);
      }

      //Translate DOM
      app.message.__translate();

      app.component.__initComponents(app.ctx.components);

      app.modal.invalidateAll();

      app.debug('Invoke controller {0} init() function', [app.ctx.__name]);
      app.ctx.init(controllerPassedData);

    };

    /**
     * @private
     *
     * Creating path to controller view HTML file
     * Creates path based on html2js template file and directories structure
     * @param controllerObject
     */
    controllerObject.__createControllerViewPath = function (controllerObject) {
      app.debug('Invoke controllerObject.__createControllerViewPath with params: {0}', [controllerObject]);

      controllerObject.__view = app.config.rootPath + "/" + app.config.controllerDirectory + "/" + controllerObject.__lowerCaseName + "/" + controllerObject.__lowerCaseName + ".view.html"

    }

    /**
     * @private
     *
     * Function retrieving controller's template from global window[templates] variable based on generated view path
     * If template not specified, throw Error
     * Creating dynamic selectors binded to template using @private system.__createSelectors()
     *
     */
    controllerObject.__loadTemplate = function () {
      app.debug('Invoke controllerObject.__loadTemplate');

      var templateHtml = window[app.__globalTemplates][app.ctx.__view];

      if (!templateHtml) {
        app.system.__throwError('No view found for controller: {0}, view path: {1}', [controllerObject.__name, controllerObject.__view]);
      }

      var selectorsObj = app.system.__createSelectors(templateHtml);
      app.ctx.selector = selectorsObj.selectors;
      templateHtml = selectorsObj.html;

      if (app.config.replaceLangKeys) {
        templateHtml = app.message.__replaceTemplateKeys(templateHtml);
      }

      app.ctx.__plainTemplate = templateHtml;
      app.ctx.__template = templateHtml;

      //Commented because of global translation by jQuery
      //app.ctx.__template = app.message.__replace(templateHtml);

    }

    //Creating view path once per application initialization
    controllerObject.__createControllerViewPath(controllerObject);

    //Creating copy of controller object in @private __dataArchive and in controller[controllerName]
    app.controller.__dataArchive[controllerName] = $.extend(true, {}, controllerObject);
    app.controller[controllerName] = $.extend(true, {}, controllerObject);

  },

  /**
   * @private
   *
   * Returns controller's DOM element with @attr view attribute
   *
   * @returns {jQuery|HTMLElement}
   */
  __getView: function () {
    return app.system.getView();
  },

  /**
   * @private
   *
   * Verify if DOM element with @attr view attribute exists
   *
   */
  __verifyView: function () {
    if (this.__getView().length == 0) {
      app.system.__throwError('No DOM element with {0} attribute specified', [app.__attributes.VIEW]);
    }
  }

};

/**
 * @public
 *
 * Modal module
 * Module designed for usage as independent modal window during application lifecycle.
 * Can be rendered in another modules.
 *
 * Only one active instance of the same modal is available in same time
 * Few instances of modals are available at one moment
 *
 * Redered once when used @public system.render() until another controller is rendered
 * because @private system.__renderController invokes @public modal.invalidateAll
 *
 * If once rendered, @public system.render only shows modal again if @private modalObject.__hidden
 *
 * Modals templates are binded to DOM element having @attr modals attribute
 * and wrapped with DIV element.
 *
 * Example:
 * <div modals></div>
 *
 * Modal events like HIDE and SHOW or INIT could be implemented with custom implementation
 * Spike allows to choose between plain jQuery implementation and Bootstrap 3 events implementation
 * using @public config.bootstrapModal variable
 *
 *
 * @functions
 * @public {implement}
 * @private {__onModalShowEventDefault}
 * @private {__onModalHideEventDefault}
 * @private {__onModalRegisterEvent}
 * @private {__onModalRenderwEvent}
 * @private {__onModalShowEvent}
 * @private {__onModalHideEvent}
 * @public  {add}
 * @public  {register}
 * @private {__getView}
 * @private {__verifyView}
 * @private {__invalidate}
 * @public {invalidateAll}
 *
 *
 * @fields
 * @private {__dataArchive}
 * @private {__modalWrappers}
 *
 */
app.modal = {

  /**
   * @private
   * Storage for wrapping DIVs
   * If modal wrapper @attr id not in @private __modalWrappers then modal not exist in DOM
   */
  __modalWrappers: {},

  /**
   * @private
   * Storage for modals instances
   */
  __dataArchive: {},

  /**
   * @public
   *
   * Function allows programmer to implement custom modals overriding
   * @private __onModalShowEvent
   * @private __onModalHideEvent
   * @private __onModalRegisterEvent
   * @private __onModalRenderEvent
   *
   * @param eventName
   * @param eventFunction
   */
  implement: function (eventName, eventFunction) {
    app.debug('Invoke modal.implement with params: {0} {1}', [eventName, eventFunction]);

    if (!eventName || !eventFunction) {
      app.system.__throwError('modal.implement(eventName, eventFunction) passed arguments not match required arguments');
    }

    if (eventName == 'hide') {
      app.modal.__onModalHideEvent = eventFunction;
    } else if (eventName == 'show') {
      app.modal.__onModalShowEvent = eventFunction;
    } else if (eventName == 'render') {
      app.modal.__onModalRenderEvent = eventFunction;
    } else if (eventName == 'register') {
      app.modal.__onModalRegisterEvent = eventFunction;
    } else {
      app.warn('Ignoring event: {0} implementation for modal, no event available', [eventName]);
    }

  },

  /**
   * @private
   *
   * Default jQuery implementation of modal show event
   *
   * @param modalSelector
   */
  __onModalShowEventDefault: function (modalSelector) {
    app.debug('Invoke modal.__onModalShowEventDefault');
    modalSelector.show(200);
  },

  /**
   * @private
   *
   * Default jQuery implementation of modal hide event
   *
   * @param modalSelector
   */
  __onModalHideEventDefault: function (modalSelector) {
    app.debug('Invoke modal.__onModalHideEventDefault');
    modalSelector.hide(200);
  },

  /**
   * @private
   * @toImplement
   *
   * Additional function executed when modal is registered
   * Executes once per Spike application initialization
   *
   * @param modalObject
   */
  __onModalRegisterEvent: function (modalObject) {
  },

  /**
   * @private
   * @toImplement
   *
   * Additional function executed when modal is rendered
   * Executes every time when new modal instance is rendered
   * Is not invoke if modal is already rendered and will be only showed
   *
   * @param modalSelector
   */
  __onModalRenderEvent: function (modalSelector, modalObject) {
  },

  /**
   * @private
   * @toImplement
   *
   * Function implements modal showing mechanics
   * By default invokes default implementation @private __onModalShowEventDefault
   *
   * @param modalSelector
   * @param modalObject
   * @param defaultImpl
   */
  __onModalShowEvent: function (modalSelector, modalObject, defaultImpl) {
    defaultImpl(modalSelector);
  },

  /**
   * @private
   * @toImplement
   *
   * Function implements modal hiding mechanics
   * By default invokes default implementation @private __onModalHideEventDefault
   *
   * @param modalSelector
   * @param modalObject
   * @param defaultImpl
   */
  __onModalHideEvent: function (modalSelector, modalObject, defaultImpl) {
    defaultImpl(modalSelector);
  },

  /**
   * @public
   *
   * Substitute method for register
   *
   * @param modalName
   * @param modalObject
   */
  add: function (modalName, modalObject) {
    this.register(modalName, modalObject);
  },

  /**
   * @public
   *
   * Registering new modal window in application
   * Creates modal object
   *
   * @param modalName
   * @param modalObject
   */
  register: function (modalName, modalObject) {

    // Filter if name is invalid (can break application)
    app.system.__filterRestrictedNames(modalName);

    if (modalObject.inherits) {
      // Apply extending from abstracts
      modalObject = app.abstract.__tryExtend(modalName, modalObject.inherits, modalObject);
    }

    app.debug('Invoke modal.register with params: {0} {1}', [modalName, modalObject]);

    //Setting tyope of module
    modalObject.__type = 'MODAL';

    //Setting self helper
    modalObject.self = function () {
      return app.modal[modalName];
    }

    //Setting default value (modal by default is hidden)
    modalObject.__hidden = false;

    //Setting original name of module
    modalObject.__name = modalName;

    //Setting name starting from lower case , used with templates and directories names of controller
    modalObject.__lowerCaseName = modalName.substring(0, 1).toLowerCase() + modalName.substring(1, modalName.length);

    //Invokes custom implementation of @private __onModalRegisterEvent
    app.modal.__onModalRegisterEvent(modalObject);

    /**
     * @private
     *
     * Creating path to modal view HTML file
     * Creates path based on html2js template file and directories structure
     * @param modalObject
     */
    modalObject.__createModalViewPath = function (modalObject) {
      app.debug('Invoke modalObject.__createModalViewPath with params: {0}', [modalObject]);

      modalObject.__view = app.config.rootPath + "/" + app.config.modalDirectory + "/" + modalObject.__lowerCaseName + "/" + modalObject.__lowerCaseName + ".view.html"

    }

    /**
     * @private
     *
     * Function retrieving modal's template from global window[templates] variable based on generated view path
     * If template not specified, throw Error
     * Creating dynamic selectors binded to template using @private system.__createSelectors()
     *
     */
    modalObject.__loadTemplate = function () {
      app.debug('Invoke modalObject.__loadTemplate');

      var templateHtml = window[app.__globalTemplates][app.mCtx[modalObject.__name].__view];

      if (!templateHtml) {
        app.system.__throwError('No view found for modal: {0}, view path: {1}', [modalObject.__name, modalObject.__view]);
      }

      var selectorsObj = app.system.__createSelectors(templateHtml);
      app.mCtx[modalObject.__name].selector = selectorsObj.selectors;

      templateHtml = selectorsObj.html;

      if (app.config.replaceLangKeys) {
        templateHtml = app.message.__replaceTemplateKeys(templateHtml);
      }

      app.mCtx[modalObject.__name].__plainTemplate = templateHtml;

      app.mCtx[modalObject.__name].__template = templateHtml;
      //Commented because of global translation by jQuery
      //app.mCtx[modalObject.__name].__template = app.message.__replace(templateHtml);

    }

    /**
     * @private
     *
     * Function that renders modal
     * Checking if modal is already rendered in DOM and if is hidden - then show again only
     * Checking if modal is already rendered in DOM and if is visible - then do nothing
     * In case modal is not rendered then
     * Creates new modal object based ond __dataArchive and assign reference to shortcut app.mCtx
     * Creates controller HTML template using @function @private __loadTemplate()
     * Wrapping modal with new DIV element and creating @attr id for modal wrapper and modal view fist child (main)
     * Passing modal processed and wrapped template to DOM element with @attr modals attribute
     * Rendering components used in rendered modal
     * Initializing modal with modalPassedData
     *
     * @param modalPassedData
     */
    modalObject.__render = function (modalPassedData) {
      app.debug('Invoke modalObject.__render with params: {0}', [modalPassedData]);

      app.modal[modalObject.__name] = $.extend(true, {}, app.modal.__dataArchive[modalObject.__name]);
      app.mCtx[modalObject.__name] = app.modal[modalObject.__name];

      app.mCtx[modalObject.__name].__loadTemplate();

      app.debug('Binding modal {0} template to DOM element with "modals" attribute ', [app.mCtx[modalObject.__name].__name]);

      app.mCtx[modalObject.__name].__wrapModal();

      app.component.__initComponents(app.mCtx[modalObject.__name].components);

      app.modal.__modalWrappers[modalObject.__name] = app.modal[modalObject.__name].__modalWrapperId;

      app.debug('Invoke modal {0} init() function', [app.mCtx[modalObject.__name].__name]);
      app.mCtx[modalObject.__name].init(modalPassedData);

    };

    /**
     * @private
     *
     * Function creates @private modalObject.__modalWrapperId as @attr id for DIV element wrapping modal template
     * Also first child of modal template has @private modalObject.__modalId as @attr id
     * Executing @private modal.__onModalRenderEvent for custom modal render implementation
     *
     */
    modalObject.__wrapModal = function () {

      app.mCtx[modalObject.__name].__modalWrapperId = 'modal-wrapper-' + app.util.System.hash();

      app.modal.__getView().append('<div id="' + app.mCtx[modalObject.__name].__modalWrapperId.replace('#', '') + '">' + app.mCtx[modalObject.__name].__template + '</div>');

      //Translate DOM
      app.message.__translate();

      app.mCtx[modalObject.__name].__modalId = 'modal-' + app.util.System.hash();

      var modalSelector = app.mCtx[modalObject.__name].__getWrapperModalSelector();
      modalSelector.attr('id', app.mCtx[modalObject.__name].__modalId);

      app.modal.__onModalRenderEvent(modalSelector, app.mCtx[modalObject.__name]);

    }

    /**
     * @private
     *
     * Returns modal wrapper DIV element
     *
     * @returns {jQuery|HTMLElement}
     */
    modalObject.__wrapperSelector = function () {
      return $('#' + app.modal[modalObject.__name].__modalWrapperId);
    }

    /**
     * @private
     *
     * Returns modal element (parent)
     *
     * @returns {jQuery|HTMLElement}
     */
    modalObject.__selfSelector = function () {
      return $('#' + app.modal[modalObject.__name].__modalId);
    }

    /**
     * @private
     *
     * Returns modal wrapper children - modal view parent element
     * Checks if modal template has more than one parent elements or if even has
     *
     * @returns {jQuery|HTMLElement}
     */
    modalObject.__getWrapperModalSelector = function () {

      var wrapperSelectorChildrens = app.modal[modalObject.__name].__wrapperSelector().children();

      if (wrapperSelectorChildrens.length == 1) {
        return wrapperSelectorChildrens;
      } else if (wrapperSelectorChildrens.length > 1) {
        app.system.__throwError('Modal {0} view can only have one parent DOM element, found {1}', [modalObject.__name, wrapperSelectorChildrens.length]);
      } else if (wrapperSelectorChildrens.length == 0) {
        app.system.__throwError('Modal {0} view must have one parent DOM element', [modalObject.__name]);
      }

    }

    /**
     * @public
     *
     * Sets @private modalObject.__hidden to false
     * Invokes @private modal.__onModalShowEvent for default or custom implementation of modal showing mechanics
     *
     */
    modalObject.show = function () {

      app.modal[modalObject.__name].__hidden = false;
      app.modal.__onModalShowEvent(app.mCtx[modalObject.__name].__selfSelector(), app.mCtx[modalObject.__name], app.modal.__onModalShowEventDefault);
    };

    /**
     * @public
     *
     * Sets @private modalObject.__hidden to true
     * Invokes @private modal.__onModalHideEvent for default or custom implementation of modal hidding mechanics
     *
     */
    modalObject.hide = function () {

      app.modal[modalObject.__name].__hidden = true;
      app.modal.__onModalHideEvent(app.mCtx[modalObject.__name].__selfSelector(), app.mCtx[modalObject.__name], app.modal.__onModalHideEventDefault);
    };

    modalObject.__createModalViewPath(modalObject);

    //Creating copy of modal object in @private __dataArchive and in modal[modalName] variable
    app.modal.__dataArchive[modalObject.__name] = $.extend(true, {}, modalObject);
    app.modal[modalObject.__name] = $.extend(true, {}, modalObject);


  },

  /**
   * @private
   *
   * Returns modal's DOM element with @attr modals attribute
   *
   * @returns {jQuery|HTMLElement}
   */
  __getView: function () {
    return $('[' + app.__attributes.MODALS + ']');
  },

  /**
   * @private
   *
   * Verify if DOM element with @attr modals attribute exists
   *
   */
  __verifyView: function () {
    if (this.__getView().length == 0) {
      app.system.__throwError('No DOM element with {0} attribute specified', [app.__attributes.MODALS]);
    }
  },

  /**
   * @private
   *
   * Function removes modal wrapper @attr id @private modalObject.__modalWrapperId from @private modal.__modalWrappers
   * Removes whole wrapper modal DOM element with selector @private modalObject.__wrapperSelector
   *
   */
  __invalidate: function (modalObject) {

    delete app.modal.__modalWrappers[modalObject.__name];
    modalObject.__wrapperSelector().remove();

  },

  /**
   * @public
   *
   * Function invalidates all rendered modals.
   * Iterates over @public modal executes @private modal.__invalidate function to remove modals from DOM and cache
   *
   */
  invalidateAll: function () {

    $.each(app.modal, function (modalName, modalObject) {

      if (modalObject instanceof Object && modalObject['__type']) {
        app.modal.__invalidate(modalObject);
      }

    });

  },

  /**
   * @public
   *
   * Function hides all rendered modals.
   * Iterates over @public app.mCtx executes @public modal.hide function to hide modals
   *
   */
  hideAll: function () {

    $.each(app.mCtx, function (modalName, modalObject) {
      modalObject.hide();
    });

  }

};/**
 * @public
 *
 * Lister module
 * Module designed for usage as list renderer.
 * Can be used in any another module ex. controller, component, modal.
 *
 * Template function can also handle another lister (beware of infinite loop if the same listers used in each others).
 *
 * Redered in normal code execution time.
 * Rendered template is binded to DOM element with passed selector.
 *
 * Example:
 * <ul id="listNameXXX"></ul>
 *
 * @functions
 * @public  {add}
 * @public  {register}
 *
 */
app.lister = {

    /**
     * @public
     *
     * Substitute method for register
     *
     * @param listerName
     * @param listerTemplate
     * @param configuration { renderPerContext, transform }
     */
    add: function (listerName, listerTemplate, configuration) {
        this.register(listerName, listerTemplate, configuration);
    },

    /**
     * @public
     *
     * Registering new lister in application
     * Creates lister object
     *
     * @param listerName
     * @param listerTemplate
     * @param configuration {
     *  renderPerContext -- additional but slower way to render list, passing item and index to rendering function
     *  transform  -- additional function to transform passed list items during rendering template, to modyfiy them
     * }
     */
    register: function (listerName, listerTemplate, configuration) {

        var htmlTemplate = null;

        //If no configuration passed, default options is applied
        if (!configuration) {
            configuration = {
                renderPerContext: false,
                transformSingle: null,
                transformArray: null
            }
        }

        //If no renderPerContext passed, setted by default to false
        if (!configuration.renderPerContext) {
            configuration.renderPerContext = false;
        }

        //If no transform function passed, setted by default to null
        if (!configuration.transformSingle) {
            configuration.transformSingle = null;
        }

        //If no transform function passed, setted by default to null
        if (!configuration.transformArray) {
            configuration.transformArray = null;
        }

        //If template is another than string version (simplest) and renderPerContext is false then
        if (typeof listerTemplate !== 'string' && configuration.renderPerContext == false) {
            htmlTemplate = listerTemplate('');
        } else {
            htmlTemplate = listerTemplate;
        }

        //Commented because of global translation by jQuery
        //htmlTemplate = app.message.__replace(htmlTemplate);

        /**
         * @private
         *
         * Lister object used to rendering lists
         *
         * @functions
         *
         * @public { render }
         * @private { __update }
         * @private { __renderElement }
         *
         *
         * @fields
         * @private { __renderPerContext }
         * @private { __template }
         * @private { __dataIds }
         * @private { __bindings }
         * @private { __listSelector }
         * @private { __data }
         *
         */
        var __listerObject = {

            __listerName: listerName,
            __renderPerContext: configuration.renderPerContext,
            __transformArray: configuration.transformArray,
            __transformSingle: configuration.transformSingle,
            __template: htmlTemplate,
            __dataIds: null,
            __bindings: null,
            __listSelector: null,
            __data: null,

            /**
             * @private
             *
             * Renders single list element based on passed params
             * Replacing plain @attr text and @attr event
             *
             * @param dataId
             * @param listElementId
             * @param html
             * @param element
             * @returns {string|*}
             * @private
             */
            __renderElement: function (dataId, listElementId, html, element) {

                if (!html || html.trim().length === 0) {
                    app.system.__throwWarn(app.system.__messages.LISTER_ELEMENT_EMPTY, [listElementId]);
                }

                html = html.replace('>', ' liId="' + listElementId + '" >');
                html = html.split(app.__attributes.LISTER_EVENT + '(').join(' dataId="' + dataId + '" ' + app.__attributes.LISTER_EVENT + '(');

                for (var prop in element) {
                    html = html.split(app.__attributes.LISTER_TEXT + '(' + prop + ')').join(element[prop]);
                }

                return html;

            },

            /**
             * @private
             *
             * Function gets template and process it with passed data
             *
             * @param templateName
             * @param localData
             */
            // __resolveListerTemplate: function(templateName, localData){
            //
            //     if(!window[app.__globalTemplates][templateName]){
            //         app.system.__throwError(app.system.__messages.TEMPLATE_NOT_FOUND_ERROR, [templateName])
            //     }
            //
            //     return window[app.__globalTemplates][templateName](localData);
            //
            // },

            /**
             * @public
             *
             * Main function to render whole lister data with passed template and binded events.
             * Also can handle additional callback realized after whole process is done.
             *
             * @param listSelector -- must be jQuery selector
             * @param data -- list of objects with fields names as used in text(fieldName) tags in template
             * @param bindings -- optional, object with functions named as used in event(functionName) tags in template
             * @param options -- optional
             *  - callback --optional
             */
            render: function (listSelector, data, bindings, options) {

                var __this = this;

                var elementsHtml = [];

                var dataIds = [];

                var templatehtml = __this.__template;

                var html = templatehtml;

                if (__this.__transformArray) {
                    data = __this.__transformArray(data, options);
                }

                if (__this.__transformSingle) {
                    $.each(data, function (i, item) {
                        data[i] = __this.__transformSingle(item, options);
                    });
                }

                $.each(data, function (i, element) {

                    if (__this.__renderPerContext) {
                        html = templatehtml(i, element, '', data);
                    }

                    var listElementId = 'li-' + app.util.System.hash() + '-' + app.util.System.hash() + '-' + app.util.System.hash();
                    var dataId = 'element-' + app.util.System.hash() + '-' + app.util.System.hash() + '-' + app.util.System.hash();

                    html = __this.__renderElement(dataId, listElementId, html, element);

                    dataIds.push({
                        __listElementId: listElementId,
                        __dataId: dataId,
                        __context: element
                    });

                    elementsHtml.push(html);

                    html = templatehtml;

                });

                html = '';

                for (var i = 0; i < elementsHtml.length; i++) {
                    html += elementsHtml[i];
                }

                for (var prop in bindings) {
                    html = html.split(app.__attributes.LISTER_EVENT + '(' + prop + ')').join(app.__attributes.LISTER_EVENT + '="' + prop + '"');
                }

                listSelector.html(html);

                //Translate DOM
                app.message.__translate();

                if (options && options.callBack) {
                    options.callBack();
                }

                __this.__bindings = bindings;
                __this.__listSelector = listSelector;
                __this.__data = data;
                __this.__bind(listSelector, dataIds, bindings, data);

            },

            __bind: function (listSelector, dataIds, bindings, dataList) {

                var dataIdsLocal = dataIds;

                listSelector.unbind();
                $.each(bindings, function (functionName, functionCallback) {

                    listSelector.on('click', '[event="' + functionName + '"]', function (e) {

                        var arrtributeDataId = $(e.currentTarget).attr('dataId');

                        $.each(dataIdsLocal, function (i, dataId) {

                            if (dataId.__dataId == arrtributeDataId) {
                                e.eCtx = dataId.__context;

                                var selector = $('*[dataId="' + dataId.dataId + '"]');
                                selector.dataId = dataId.__dataId;
                                e.eCtxSelector = function () {
                                    return selector;
                                }
                            }

                        });

                        e.eCtxList = dataList;

                        functionCallback(e);

                    });

                });

                this.__dataIds = dataIdsLocal;


            }

        }

        app.lister[listerName] = __listerObject;

    }

};/**
 * @public
 *
 * partial module
 * Module designed for usage as list renderer.
 * Can be used in any another module ex. partial, component, modal.
 *
 * Template function can also handle another partial (beware of infinite loop if the same partials used in each others).
 *
 * Redered in normal code execution time.
 * Rendered template is binded to DOM element with passed selector.
 *
 *
 * @functions
 * @public  {add}
 * @public  {register}
 *
 */
app.partial = {

    /**
     * @private
     * Storage for partial instances
     */
    __dataArchive: {},

    /**
     * Function returns processed given partial template
     * with passed data
     *
     * @param partial
     * @param data
     */
    include: function (partial, model) {

        if (!partial) {
            app.system.__throwError(app.system.__messages.PARITAL_INCLUDE_NOT_DEFINED, [partial.__name]);
        }

        app.debug('Invoke app.partial.include with params: {0} ', [partial.__name]);

        if (!model) {
            model = {};
        }

        app.partial[partial.__name] = $.extend(true, {}, app.partial.__dataArchive[partial.__name]);


        app.debug('Returning partial {0} template ', [partial.__name]);

        return partial.__template($.extend(true, partial, model));
    },

    /**
     * @public
     *
     * Substitute method for register
     *
     * @param partialName
     */
    add: function (partialName) {
        this.register(partialName);
    },

    /**
     * @public
     *
     * Registering new partial in application
     * Creates partial object
     *
     * @param partialName
     */
    register: function (partialName, partialObject) {

        // Filter if name is invalid (can break application)
        app.system.__filterRestrictedNames(partialName);


        if(partialObject.inherits){
            // Apply extending from abstracts
            partialObject = app.abstract.__tryExtend(partialName, partialObject.inherits, partialObject);
        }

        app.log('Registering partial {0}', [partialName]);
        app.debug('Invoke partial.register with params: {0} {1}', [partialName, partialObject]);

        //Setting tyope of module
        partialObject.__type = 'PARTIAL';

        //Setting original name of module
        partialObject.__name = partialName;

        //Setting name starting from lower case , used with templates and directories names of partial
        partialObject.__lowerCaseName = partialName.substring(0, 1).toLowerCase() + partialName.substring(1, partialName.length);

        /**
         * @public
         *
         * Function that renders partial
         * Creates new partial object based ond __dataArchive and assign reference to shortcut app.ctx
         * Creates partial HTML template using @function @private __loadTemplate()
         * Passing partial processed template to DOM element with @attr view attribute
         * Rendering components used in rendered partial
         * Invalidating existing modals
         * Initializing partial with partialPassedData
         * @param partialPassedData
         */
        partialObject.render = function (selector, model) {
          app.debug('Invoke partialObject.__render');

          var __partialObject = $.extend(true, {}, app.partial.__dataArchive[partialObject.__name]);

          if (!selector) {
            app.system.__throwError(app.system.__messages.PARITAL_SELECTOR_NOT_DEFINED, [__partialObject.__name]);
          }

          if(__partialObject.before && app.util.System.isFunction(__partialObject.before)){
              app.debug('Invokes partial  {0} before() function', [__partialObject.__name]);
              __partialObject.before();
          }

          app.debug('Binding partial {0} template to passed selector {1} ', [__partialObject.__name, selector]);

          var renderedTemplate = __partialObject.__template($.extend(true, __partialObject, model));

          if(app.config.replaceLangKeys){
            renderedTemplate = app.message.__replaceTemplateKeys(renderedTemplate);
          }

          selector.html(renderedTemplate);

          app.partial.__bindEvents(selector);

          //Translate DOM
          app.message.__translate();

        };

        /**
         * @private
         *
         * Creating path to partial view HTML file
         * Creates path based on html2js template file and directories structure
         * @param partialObject
         */
        partialObject.__createPartialViewPath = function (partialObject) {
            app.debug('Invoke partialObject.__createPartialViewPath with params: {0}', [partialObject]);

            partialObject.__view = app.config.rootPath + "/" + app.config.partialDirectory + "/" + partialObject.__lowerCaseName + "/" + partialObject.__lowerCaseName + ".partial.html"

        }

        /**
         * @private
         *
         * Function retrieving partial's template from global window[templates] variable based on generated view path
         * If template not specified, throw Error
         * Creating dynamic selectors binded to template using @private system.__createSelectors()
         *
         */
        partialObject.__loadTemplate = function () {
            app.debug('Invoke partialObject.__loadTemplate');

            var templateFunction = window[app.__globalTemplates][partialObject.__view];

            if (!templateFunction) {
                app.system.__throwError('No view found for partial: {0}, view path: {1}', [partialObject.__name, partialObject.__view]);
            }

            partialObject.__template = templateFunction;

        }

        //Creating view path once per application initialization
        partialObject.__createPartialViewPath(partialObject);

        //Sets partial template
        partialObject.__loadTemplate();

        //Creating copy of partial object in @private __dataArchive and in partial[partialName]
        app.partial.__dataArchive[partialName] = $.extend(true, {}, partialObject);
        app.partial[partialName] = $.extend(true, {}, partialObject);

    },

    /**
     * @private
     *
     * Finds all elements with attribute @spike-event
     * in given (root) selector.
     *
     * Gets event name and event function string, binds
     * jQuery event with created function.
     *
     * @param rootSelector
     */
    __bindEvents: function(rootSelector){

        rootSelector.find('[spike-event]').each(function(i, element){

            element = $(element);

            var eventName = element.attr('spike-event');
            element.removeAttr('spike-event');

            var eventFunctionBody = element.attr('spike-event-'+eventName);

            element.on(eventName, Function(eventFunctionBody));

        });

    }

};/**
 * @public
 *
 * Abstract module
 * Module handles abstract definitions (like abstract classes) to be extended
 * by normal modules like Service, Controller, Modal etc
 *
 * Module designed for usage as singleton during application lifecycle.
 * Can be used in any of another components
 *
 * Only one active instance in time is available
 *
 * @functions
 * @public  {add}
 * @public  {register}
 *
 * @private {__extend}
 * @private {__tryExtend}
 *
 */
app.abstract = {

    /**
     * @public
     *
     * Substitute method for register
     *
     * @param abstractName
     * @param abstractObject
     */
    add: function (abstractName, abstractObject) {
        this.register(abstractName, abstractObject);
    },


    /**
     * @public
     *
     * Registering new abstract in application
     * Creates abstract object
     *
     * @param abstractName
     * @param abstractObject
     */
    register: function (abstractName, abstractObject) {

        //Checks if name is not restricted
        app.system.__filterRestrictedNames(abstractName);

        if(app.abstract[abstractName]){
            app.system.__throwError(app.system.__messages.ABSTRACT_ALREADY_REGISTRED,[abstractName]);
        }

        abstractObject.__name = abstractName;

        app.abstract[abstractName] = abstractObject;

    },

    /**
     * @private
     *
     * Function return extended version of @extendedObject
     * with abstracts @abstractNamesOrModuleObject array
     *
     * If @abstractNamesOrModuleObject is array of Strings then
     * @extendedObject is extended via defined @app.abstract objects
     * with given names.
     *
     * If @abstractNamesOrModuleObject is object, then returns it because
     * extending is not defined
     *
     * @param extendObjectName
     * @param abstractNamesOrModuleObject
     * @param extendedObject
     *
     */
    __tryExtend: function(extendObjectName, abstractObjectsList, extendedObject){

        app.debug('Invoking app.abstract.__tryExtend with params {0}', [extendObjectName]);

        // If extending abstracts defined, then extend @extendedObject and returns it
        if($.isArray(abstractObjectsList)){

            app.log('Extending {0} named {1} ', [extendedObject.__type, extendObjectName, app.abstract.__getNames(abstractObjectsList)]);

            for(var i = 0; i < abstractObjectsList.length; i++){

                if(abstractObjectsList[i]){
                    extendedObject = app.abstract.__extend(abstractObjectsList[i].__name, extendedObject);
                }else{
                    app.system.__throwWarn(app.system.__messages.INHERIT_ABSTRACT_NOT_EXIST, [extendObjectName]);
                }


            }

            // $.each(abstractObjectsList, function(i, abstractObject){
            //
            //     if(abstractObject){
            //         extendedObject = app.abstract.__extend(abstractObject.__name, extendedObject);
            //     }else{
            //         app.system.__throwWarn(app.system.__messages.INHERIT_ABSTRACT_NOT_EXIST, [extendObjectName]);
            //     }
            //
            // });

        }

        return extendedObject;

    },

    /**
     * @private
     *
     * Converts abstractObjectList into list of abstract names
     *
     * @param abstractObjectsList
     */
    __getNames: function(abstractObjectsList){

        var names = [];

        $.each(abstractObjectsList, function(i, abstractObject){

            if(abstractObject){
                names.push(abstractObject.__name);
            }

        });

        return names;

    },

    /**
     * @private
     *
     * Function returns extended version of object from @extendedObject
     * and @app.abstract[@extendObjectName]
     *
     * @param extendObjectName
     * @param extendedObject
     *
     */
    __extend: function(extendObjectName, extendedObject){
        return $.extend(true, extendedObject, app.abstract[extendObjectName]);
    }

};/**
 * @public
 *
 * Enumerator module
 * Module designed for usage as singleton during application lifecycle.
 * Can be used in any other modules.
 *
 * Only one active instance in time is available
 *
 * @functions
 * @public  {add}
 * @public  {register}
 *
 */
app.enumerator = {

    /**
     * @public
     *
     * Substitute method for register
     *
     * @param enumeratorName
     * @param enumeratorObject
     */
    add: function(enumeratorName, enumeratorObject){
        this.register(enumeratorName, enumeratorObject);
    },

    /**
     * @public
     *
     * Registering new enumerators in application
     *
     * @param enumeratorName
     * @param enumeratorObject
     */
    register: function(enumeratorName, enumeratorObject){

        if(app.enumerator[enumeratorName]){
            app.system.__throwError(app.system.__messages.ENUMERATOR_ALREADY_REGISTRED,[enumeratorName]);
        }

        app.enumerator[enumeratorName] = enumeratorObject;
    }

};/**
 * @public
 *
 * Global module
 * Module designed for as globals storage instead of window global during application lifecycle.
 * Can be used anywhere.
 *
 * Only one active instance in time is available (singleton)
 *
 * @functions
 * @public  {add}
 * @public  {register}
 *
 * @fields
 * @private {__globals}
 *
 */
app.global = {

    /**
     * @public
     *
     * Substitute method for register
     *
     * @param controllerName
     * @param controllerObject
     */
    add: function(globalName, globalInitialValue){
        this.register(globalName, globalInitialValue);
    },

    /**
     * @public
     *
     * Registering new global variable in application
     *
     * @param globalName
     * @param globalInitialValue
     */
    register: function(globalName, globalInitialValue){

        // Filter if name is invalid (can break application)
        app.system.__filterRestrictedNames(globalName);

        /**
         * New global variable object
         *
         * @functions
         * @public  {get}
         * @public  {set}
         *
         * @fields
         * @private {__value}
         *
         */
        app.global[globalName] = {

            /**
             * @private
             * Variable to store global variable value
             */
            __value: null,

            /**
             * @public
             *
             * Function to retrieve global variable value
             * Optionally @param index can be passed when global variable value is an @Array object
             * then function returns value on passed index in this array
             *
             * @param index --optional
             */
            get: function(index){
                if(index){
                    return this.__value[index];
                }else{
                    return this.__value;
                }
            },

            /**
             * @public
             *
             * Function to setting global variable value
             *
             * Optionally @param index can be passed when global variable value is an @Array object
             * then function sets value on passed index in this array.
             *
             * If @param index is not passed and global variable value is an @Array object
             * then value is setted typical way
             *
             * For adding items to @Array object then use @push function instead
             *
             * @param index --optional
             */
            set: function(newGlobalValue, index){

                if(this.__value && index){
                    this.__value[index] = newGlobalValue;
                } else {
                    this.__value = newGlobalValue;
                }

            },

            /**
             * @public
             *
             * Function to setting global variable value for @Array object
             *
             * If global variable value is an @Array object
             * then function push new value into this array
             *
             * If global variable value is not @Array object
             * then value is not setted
             *
             * @param newGlobalValueArrayItem
             */
            push: function(newGlobalValueArrayItem){

                if(this.__value && this.__value instanceof Array){
                    this.__value.push(newGlobalValueArrayItem);
                }

            }

        };

        this.__value = value;

    },

    /**
     * @public
     *
     * Registering list of global objects variables in application
     *
     * @param globalObjectsList {
     *  @fields
     *  @public name - name of the global variable
     *  @public initial - initial value of the global variable
     * }
     */
    list: function(globalObjectsList){

        $.each(globalObjectsList, function(i, __global){
            app.global.add(__global.name, __global.initial);
        });

    }


};/**
 * @public
 *
 * Service module
 * Module designed for usage as singleton during application lifecycle.
 * Can be used in any of another components
 *
 * Only one active instance in time is available
 *
 * @functions
 * @public  {add}
 * @public  {register}
 *
 */
app.service = {

    /**
     * @public
     *
     * Substitute method for register
     *
     * @param serviceName
     * @param serviceObject
     */
    add: function (serviceName, serviceObject) {
        this.register(serviceName, serviceObject);
    },


    /**
     * @public
     *
     * Registering new service in application
     * Creates service object
     *
     * @param serviceName
     * @param serviceObject
     */
    register: function (serviceName, serviceObject) {

        // Filter if name is invalid (can break application)
        app.system.__filterRestrictedNames(serviceName);

        if(serviceObject.inherits){
            // Apply extending from abstracts
            serviceObject = app.abstract.__tryExtend(serviceName, serviceObject.inherits, serviceObject);
        }

        if(app.service[serviceName]){
            app.system.__throwError(app.system.__messages.SERVICE_ALREADY_REGISTRED,[serviceName]);
        }

        app.service[serviceName] = serviceObject;

    }

};/**
 * @public
 *
 * Plugins module
 * Module designed for usage as singleton during application lifecycle.
 * Can be used in any other modules.
 *
 * Only one active instance in time is available
 *
 * @functions
 * @public  {add}
 * @public  {register}
 *
 */
app.plugins = {

    /**
     * @public
     *
     * Substitute method for register
     *
     * @param pluginName
     * @param pluginWrapperFunction
     */
    add: function(pluginName, pluginWrapperFunction){
        this.register(pluginName, pluginWrapperFunction);
    },

    /**
     * @public
     *
     * Registering new wrapper for plugin
     *
     * @param pluginName
     * @param pluginWrapperFunction
     */
    register: function(pluginName, pluginWrapperFunction){

        app.plugins[pluginName] = pluginWrapperFunction;

    },

    /**
     * @public
     *
     * Registering map of wrapper functions in application
     *
     * @param pluginsWrapperFunctionsMap
     */
    list: function(pluginsWrapperFunctionsMap){

        $.each(pluginsWrapperFunctionsMap, function(pluginName, pluginWrapperFunction){
            app.global.add(pluginName, pluginWrapperFunction);
        });

    },



};
/**
 * @public
 *
 * Util module
 * Module designed for usage as singleton during application lifecycle.
 * Can be used in any other modules.
 *
 * Only one active instance in time is available
 *
 * @functions
 * @public  {add}
 * @public  {register}
 *
 * @fields
 * @public  System
 *
 */
app.util = {

    /**
     * @public
     *
     * Substitute method for register
     *
     * @param pluginName
     * @param pluginWrapperFunction
     */
    add: function (utilName, utilFunctions) {
        this.register(utilName, utilFunctions);
    },

    /**
     * @public
     *
     * Registering new utils object containing set of functions
     *
     * @param pluginName
     * @param pluginWrapperFunction
     */
    register: function (utilName, utilFunctions) {

        if(app.util[utilName]){
            app.system.__throwError(app.system.__messages.UTIL_ALREADY_REGISTRED,[utilName]);
        }

        app.util[utilName] = utilFunctions;

    },

    /**
     * System util used by application core
     */
    System: {

        /**
         * Transforms string into camel case notation
         * Example: category-id => categoryId
         * Example category id => categoryId
         *
         * @param str
         */
        toCamelCase: function (str) {

            if (app.util.System.isEmpty(str)) {
                return str;
            }

            str = str.split('-').join(' ');

            return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
                if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
                return index == 0 ? match.toLowerCase() : match.toUpperCase();
            });

        },

        /**
         * @public
         *
         * Copies array to another instance without reference
         *
         * @returns {string}
         */
        copyArray: function (oldArray) {
            return JSON.parse(JSON.stringify(oldArray));
        },

        /**
         * @public
         *
         * Returns date for logging module
         *
         * @returns {string}
         */
        currentDateLog: function () {
            return new Date().toLocaleTimeString();
        },

        /**
         * @public
         *
         * Function to bind values represented by map or array to special
         * formatted @string
         *
         * Example:
         *
         * var someString = "Mark of this car is {0}";
         * app.util.System.bindStringParams(someString, ["Ford"] );
         *
         * or
         *
         * var someString = "Mark of this car is {mark}";
         * app.util.System.bindStringParams(someString, { mark: "Ford" } );
         *
         *
         * @param string
         * @param objectOrArrayParams
         * @returns {*}
         */
        bindStringParams: function (string, objectOrArrayParams) {

            if (!objectOrArrayParams) {
                return string;
            }

            if (objectOrArrayParams instanceof Array) {

                for (var i = 0; i < objectOrArrayParams.length; i++) {
                    string = string.replace('{' + i + '}', JSON.stringify(objectOrArrayParams[i]))
                }

            } else {

                for (var paramName in objectOrArrayParams) {
                    string = string.replace('{' + paramName + '}', JSON.stringify(objectOrArrayParams[paramName]));
                }

            }

            return string;

        },

        /**
         * @public
         *
         * Checks if passed object is JavaScript @function
         *
         * @param functionToCheck
         * @returns {*|boolean}
         */
        isFunction: function (functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
        },

        /**
         * @public
         *
         * Function to parse JSON @string to JavaScript @object with replacing
         * whole whitespaces, tabs, new lines etc.
         *
         * @param s
         */
        parseJSON: function (s) {

            s = s.replace(/\\n/g, "\\n")
                .replace(/\\'/g, "\\'")
                .replace(/\\"/g, '\\"')
                .replace(/\\&/g, "\\&")
                .replace(/\\r/g, "\\r")
                .replace(/\\t/g, "\\t")
                .replace(/\\b/g, "\\b")
                .replace(/\\f/g, "\\f");
            s = s.replace(/[\u0000-\u0019]+/g, "");
            var o = JSON.parse(s);

            return o;
        },

        /**
         * @public
         *
         * Returns true if passed object is undefined or null or empty
         *
         * @param obj
         * @returns {boolean}
         */
        isEmpty: function (obj) {

            if (obj == undefined || obj == null) {
                return true;
            }

            if (typeof obj == 'string') {
                if (obj.trim().length == 0) {
                    return true;
                }
            }

            return false;

        },

        /**
         * @public
         *
         * If path param is numeric string, then making it just number - integer or float.
         * If not, returns passed object without modifications
         *
         * @param obj
         */
        tryParseNumber: function (obj) {

            if (!app.util.System.isEmpty(obj) && $.isNumeric(obj)) {

                if (app.util.System.isInt(parseFloat(obj))) {
                    return parseInt(obj, 10);
                } else  {
                    return parseFloat(obj);
                }

            }

            return obj;


        },

        /**
         * @public
         *
         * Checks if given number is integer
         * @param n
         */
        isInt: function (n) {
            return Number(n) === n && n % 1 === 0;
        },

        /**
         * @public
         *
         * Checks if given number is float
         * @param n
         */
        isFloat: function (n) {
            return Number(n) === n && n % 1 !== 0;
        },

        /**
         * @public
         *
         * Returns true if passed object is undefined or null
         *
         * @param obj
         * @returns {boolean}
         */
        isNull: function (obj) {

            if (obj == undefined || obj == null) {
                return true;
            }

            return false;

        },

        /**
         * @public
         *
         * Function to replacing whole URL path params (not typical) with passed
         * values from params map
         *
         * Example:
         *
         * var someURL = "http://www.someSite.com/person/{personId}"
         * "http://www.someSite.com/person/2" = app.util.System.preparePathParams(someUrl, { personId: 2 });
         *
         * @param url
         * @param params
         */
        preparePathDottedParams: function (url, params) {

            for (var prop in params) {
                url = url.replace(':' + prop, params[prop]);
            }

            return url;

        },

        /**
         * @public
         *
         * Function to adding URL params (typical) with passed
         * values from params map
         *
         * Example:
         *
         * var someURL = "http://www.someSite.com/person"
         * "http://www.someSite.com/person?id=2" = app.util.System.prepareUrlParams(someUrl, { id: 2 });
         *
         * @param url
         * @param params
         */
        prepareUrlParams: function (url, params) {

            var i = 0;
            for (var prop in params) {

                if (i == 0) {
                    url = url + '?' + prop + '=' + params[prop];
                } else {
                    url = url + '&' + prop + '=' + params[prop];
                }

                i++;

            }

            return url;

        },

        /**
         * @public
         *
         * Function to finding string occurence between another @string objects
         *
         * @param str - string which want to find
         * @param first
         * @param last
         * @returns {Array}
         */
        findStringBetween: function (str, first, last) {

            var r = new RegExp(first + '(.*?)' + last, 'gm');
            var arr = str.match(r);

            if (arr == null || arr.length == 0) {
                return [];
            }

            var arr2 = [];

            for (var i = 0; i < arr.length; i++) {
                arr2.push(arr[i].replace(first, '').replace(last, ''));
            }

            return arr2;

        },

        /**
         * @public
         *
         * Function to generating hashes for id creating
         *
         * @returns {string}
         */
        hash: function () {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 10; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }

    }
};
/**
 * @public
 *
 * Crud module
 * Module designed for as globals storage instead of window global during application lifecycle.
 * Can be used anywhere.
 *
 * Only one active instance in time is available (singleton)
 *
 * @functions
 * @private {__replaceBooleanToString}
 * @private {execute}
 *
 * @fields
 * @public builder
 *
 */
app.crud = {

    /**
     * @private
     *
     * Function converts passed sql @string into boolean value for DB operations
     *
     * @param sql
     */
    __replaceBooleanToString: function(sql){

        sql = sql.split("'true'").join("'bool_true'");
        sql = sql.split("'false'").join("'bool_false'");
        sql = sql.split(" true").join("'bool_true'");
        sql = sql.split(" false").join("'bool_false'");

        return sql;

    },

    /**
     * @public
     *
     * Function prepares and executes given sql @string or @function
     *
     *
     * @param sql can be @string or @function
     * @param successCallback
     * @param errorCallback
     *
     */
    execute: function (sql, successCallback, errorCallback) {

        //If @param sql is function, then execute it for final SQL string
        if(app.util.System.isFunction(sql)){
            sql = sql();
        }

        //Replace boolean values into special string equivalent
        sql = this.__replaceBooleanToString(sql);

        //Result array
        var array = [];

        //Result lastId for insert operation
        var lastId = null;

        //Executing query with transaction on database
        app.__database.__dbInstance.transaction(function (tx) {

            tx.executeSql(sql, [], function (tx, results) {

                //If operation is insert then sets lastId
                if(sql.toLowerCase().indexOf('insert') > -1){
                    lastId =  results.insertId;
                }else{
                    //Adding result objects into result array
                    var len = results.rows.length, i;
                    for (i = 0; i < len; i++) {
                        var item = results.rows.item(i);
                        array.push(item);
                    }
                }

            }, null);

        }, function (err) {

            //If errorCallback exist then invoke callback
            if (errorCallback !== undefined) {
                errorCallback();
            }

            app.error('Error executing query {0}', [sql]);

        }, function () {

            //If successCallback exist then invoke callback
            if(successCallback !== undefined){

                //If operation is insert then pass lastId as result
                if(sql.toLowerCase().indexOf('insert') != -1){
                    successCallback(lastId);
                }else{
                    //Pass array with result items
                    successCallback(array);
                }

            }

        });

    },

    /**
     * @public
     *
     * Builder object containing CRUD functions
     *
     */
    builder: {

        /**
         * @public
         *
         * Returns SQL query to find item by id in table
         *
         * @param tableName
         * @param id
         */
        findById: function(tableName, id){
            return "select * from "+tableName+" where id = "+id;
        },

        /**
         * @public
         *
         * Returns SQL query to delete item by id in table
         *
         * @param tableName
         * @param id
         */
        deleteById: function(tableName, id){
            return "delete from "+tableName+" where id = "+id;
        },

        /**
         * @public
         *
         * Returns SQL query to drop table
         *
         * @param tableName
         */
        drop: function (tableName) {
            return 'DROP TABLE IF EXISTS ' + tableName;
        },

        /**
         * @public
         *
         * Returns SQL query to count in table
         *
         * @param tableName
         */
        count: function(tableName){
            return 'select count(*) as count from '+tableName;
        },

        /**
         * @public
         *
         * Returns SQL query to create table with columns
         *
         * @param tableName
         * @param columns
         */
        create: function (tableName, columns) {

            var sql = 'CREATE TABLE IF NOT EXISTS ' + tableName + ' (id INTEGER PRIMARY KEY';

            for (var i = 0; i < columns.length; i++) {
                sql += ', ' + columns[i];
            }

            sql += ')';

            return sql;
        },


        /**
         * @public
         *
         * Returns SQL query to find all rows in table
         *
         * @param tableName
         */
        findAll: function (tableName) {
            return 'SELECT * FROM ' + tableName;
        },


        /**
         * @public
         *
         * Returns SQL query to select rows from table based on
         * specified columns names and its values
         *
         * @param tableName
         * @param values
         * @param columns
         */
        select: function (tableName, values, columns) {

            var sql = "";


                sql = "select * from " + tableName + " where ";


            for (var i = 0; i < values.length; i++) {

                if(typeof values[i] == 'string' || typeof values[i] == 'boolean'){
                    sql +=  ' '+columns[i]+"='"+values[i] + "' and ";
                }else{
                    sql +=  ' '+columns[i]+"="+values[i] + " and ";
                }

            }

            sql = sql.substr(0, sql.length - 4);

            return sql;

        },

        /**
         * @public
         *
         * Returns SQL query to insert row into table with
         * specified columns names and its values
         *
         * @param tableName
         * @param values
         * @param columns
         */
        insert: function (tableName, values, columns) {

            var sql = "";

            if(columns !== undefined){

                sql = "INSERT INTO " + tableName + " (";

                for (var i = 0; i < columns.length; i++) {
                    sql += columns[i] + ',';
                }

                sql = sql.substr(0, sql.length - 1);

                sql += ") VALUES (";

            }else{
                sql = "INSERT INTO " + tableName + " VALUES (";
            }


            for (var i = 0; i < values.length; i++) {

                if(typeof values[i] == 'string' || typeof values[i] == 'boolean'){
                    sql +=  " '"+values[i] + "',";
                }else{
                    sql +=  " "+values[i] + ",";
                }


            }

            sql = sql.substr(0, sql.length - 1);

            sql += ")";

            return sql;

        },

        /**
         * @public
         *
         * Returns SQL query to update rows in table with
         * specified columns names and its values by row id
         *
         * @param tableName
         * @param id
         * @param values
         * @param columns
         */
        update: function (tableName, id, values, columns) {

            var sql = "";

            sql = "UPDATE " + tableName + " SET ";


            for (var i = 0; i < values.length; i++) {

                if(typeof values[i] == 'string' || typeof values[i] == 'boolean'){
                    sql +=  ' '+ columns[i]+"= '"+values[i] + "',";
                }else{
                    sql += ' '+columns[i]+"= "+values[i] + ",";
                }


            }

            sql = sql.substr(0, sql.length - 1);

            sql += " where id = "+id;

            return sql;

        }


    }

};/**
 * @private
 *
 * Database module
 * Module designed for usage as local database (SQLLite) provider.
 * Should be used only by framework
 *
 * Only one active instance in time is available
 *
 * @functions
 * @private {__createDB}
 * @private {__dbLoadData}
 * @private {__dbCreate}
 * @private {__dbDrop}
 *
 * @fields
 * @private {__dbName}
 * @private {__dbVersion}
 * @private {__dbSize}
 *
 */
app.__database = {


    /**
     * @private
     *
     * Storage for current instance of database
     */
    __dbInstance: null,

    /**
     * @private
     *
     * Storage for counting tables
     */
    __tablesCount: 0,
    
    /**
     * @private
     *
     * Defines database name
     * Value is getted from @app.config.dbName on initialization
     */
    __dbName: '',

    /**
     * @private
     *
     * Defines database version
     */
    __dbVersion: '1.0',

    /**
     * @private
     *
     * Defines maximum database size
     */
    __dbSize: 2097152,

    /**
     * @private
     *
     *  Function initializes local sqllite database depending on device or local running
     *  and database create mode.
     *
     *  For local running WebSQL in Chrome is used
     *  For device running cordova-sqlite-storage is used
     *  https://www.npmjs.com/package/cordova-sqlite-storage
     *
     *  Invokes @app.system.__mainRender when database stuff done
     * @param callBack
     *
     */
    __createDB: function (callBack) {

        //Assing database name from config to private field
        app.__database.__dbName = app.config.dbName;

        //If database mode is not setted, database won't be created
        if (app.config.dbMode == 'none') {

            app.__database.__dbInstance = null;
            app.system.__mainRender(callBack);

        } else {

            //If device running then use @sqlitePlugin
            if (app.config.mobileRun) {
               app.__database.__dbInstance = window.sqlitePlugin.openDatabase({ name: app.__database.__dbName, location: 'default' });
            } else {

                //If local running then use @webSQL
                try {
                    app.__database.__dbInstance = openDatabase(app.__database.__dbName, app.__database.__dbVersion, app.__database.__dbName + '_manager', app.__database.__dbSize);
                } catch(error){
                    //No support for @webSQL in current browser
                    app.system.__noSupport();
                }
            }


            //If database mode is 'create-drop' then drop database, create new and insert data
            if (app.config.dbMode == 'create-drop') {

                app.__database.__dbDrop(function () {
                    app.__database.__dbCreate(function () {
                        app.__database.__dbLoadData(function () {
                            app.system.__mainRender(callBack);
                        });
                    });
                });

            } else if (app.config.dbMode == 'create') {
            //If database mode is 'create' then create database and insert data

                    app.__database.__dbCreate(function () {
                        app.__database.__dbLoadData(function () {
                            app.system.__mainRender(callBack);
                        });
                    });

            }

        }

    },

    /**
     * @private
     *
     *  Function loads SQL script defined in @app.config.dbTestScript and @app.config.dbProductionScript
     *  into database depending on @app.config.dbTestMode value
     *
     * @param callBack
     *
     */
    __dbLoadData: function (callBack) {
        app.debug('Invoke database.__dbLoadData');

        var finished = false;

        if (app.config.dbTestMode) {

            //Retrieve SQL script with test data
            $.get(app.config.dbTestScript, function (data) {

                if (data.trim().length == 0) {
                    finished = true;
                    callBack();
                } else {

                    var queries = [];
                    var splitted = data.split(';');

                    for (var i = 0; i < splitted.length; i++) {

                        if (splitted[i].trim().length > 0) {
                            queries.push(splitted[i].trim());
                        }

                    }


                    for (var i = 0; i < queries.length; i++) {

                        app.crud.execute(queries[i], function (data) {

                            app.__database.__tablesCount++;

                            if (app.__database.__tablesCount >= queries.length) {
                                app.__database.__tablesCount = 0;

                                if (!finished) {
                                    finished = true;
                                    callBack();

                                }

                            }

                        });

                    }

                }


            });

        } else {

            //Retrieve SQL script with production data
            $.get(app.config.dbProductionScript, function (data) {

                if (data.trim().length == 0) {
                    finished = true;
                    callBack();

                } else {

                    var queries = [];
                    var splitted = data.split(';');

                    for (var i = 0; i < splitted.length; i++) {
                        if (splitted[i].trim().length > 0) {
                            queries.push(splitted[i].trim());
                        }
                    }

                    for (var i = 0; i < queries.length; i++) {

                        app.crud.execute(queries[i], function (data) {

                            app.__database.__tablesCount++;

                            if (app.__database.__tablesCount >= queries.length) {
                                app.__database.__tablesCount = 0;

                                if (!finished) {
                                    finished = true;
                                    callBack();

                                }

                            }

                        });

                    }

                }


            });

        }

    },

    /**
     * @private
     *
     * Function executes create table scripts
     *
     * @param callBack
     *
     */
    __dbCreate: function (callBack) {
        app.debug('Invoke database.__dbCreate');

            if(app.model.__createScripts.length > 0){

                for (var i = 0; i < app.model.__createScripts.length; i++) {

                    app.crud.execute(app.model.__createScripts[i], function (data) {

                        app.__database.__tablesCount++;

                        if (app.__database.__tablesCount == app.model.__createScripts.length) {
                            app.__database.__tablesCount = 0;
                            callBack();
                        }

                    });

                }

            }else{
                callBack();
            }




    },

    /**
     * @private
     *
     * Function executes drop table scripts
     *
     * @param callBack
     *
     */
    __dbDrop: function (callBack) {
        app.debug('Invoke database.__dbDrop');


            if(app.model.__dropScripts.length > 0){

                for (var i = 0; i < app.model.__dropScripts.length; i++) {

                    app.crud.execute(app.model.__dropScripts[i], function (data) {

                        app.__database.__tablesCount++;

                        if (app.__database.__tablesCount == app.model.__dropScripts.length) {
                            app.__database.__tablesCount = 0;
                            callBack();
                        }

                    });

                }

            }else{
                callBack();
            }




    }


};
/**
 * @public
 *
 * Model module
 * Module designed for usage as class representation of database tables.
 * Can be used in another modules.
 *
 * Database representation is created directly from model classes during database initialization.
 *
 *
 * @functions
 * @public  {add}
 * @public  {register}
 * @private {__verifyView}
 *
 * @fields
 * @private {__dataArchive}
 *
 */
app.model = {

    /**
     * @private
     *
     * Storage for create table scripts generated during adding new @model
     */
    __createScripts: [],

    /**
     * @private
     *
     * Storage for drop table scripts generated during adding new @model
     */
    __dropScripts: [],

    /**
     * @public
     *
     * Substitute method for register
     *
     * @param modelName
     * @param modelColumns
     */
    add: function(modelName, modelColumns){
        this.register(modelName, modelColumns);
    },

    /**
     * @public
     *
     * Registering new model in application
     * Creates set of scripts for model
     *
     * @param modelName
     * @param modelColumns
     */
    register: function (modelName, modelColumns) {

        //Creates columns array without id column
        var _columns = app.util.System.copyArray(modelColumns);
        var columns = [];
        for(var i = 0;i<_columns.length;i++){
            if(_columns[i].toLowerCase() !== 'id'){
                columns.push(_columns[i]);
            }
        }

        var nameUpperCase = modelName.toUpperCase();

        //Creates set of scripts to drop table, create table and find all rows
        var dropTableSql =  app.crud.builder.drop(nameUpperCase);
        var createTableSql =  app.crud.builder.create(nameUpperCase, columns);
        var findAllSql =  app.crud.builder.findAll(nameUpperCase);

        app.model.__createScripts.push(createTableSql);
        app.model.__dropScripts.push(dropTableSql);

        var columnsAll = app.util.System.copyArray(columns).push("id");
        /**
         * @public
         *
         * @functions
         * @public {new}
         *
         * @fields
         * @public {table}
         * @public {columns}
         *
         * @private {__columnsAll}
         * @private {__dropSQL}
         * @private {__createSQL}
         *
         */
        var modelObject = {

            /**
             * @public
             * Name of the database table
             */
            table: nameUpperCase,

            /**
             * @public
             * List of columns (without identifier)
             */
            columns: columns,

            /**
             * @private
             * List of columns (with identifier)
             */
            __columnsAll: columnsAll,

            /**
             * @private
             * Script for dropping table
             */
            __dropSQL: dropTableSql,

            /**
             * @private
             * Script for creating table
             */
            __createSQL: createTableSql,

            /**
             * @public
             *
             * Returns new @model object with assigned values from @param valueList
             * Values are assigned without @column id and in order as @model object has been
             * defined.
             *
             * Example:
             *
             * model.add("SomeTable",  ["id", "name", "surname"]);
             *
             * {name: 'Patrick', surname: 'Jackson' } == model.SomeTable.new(['Patrick', 'Jackson']);
             *
             * @param valueList
             *
             */
            new: function (valueList) {

                var modelObj = {};

                for (var i = 0; i < this.columns; i++) {

                    if (valueList[this.columns[i]] !== undefined) {
                        modelObj[this.columns[i]] = valueList[this.columns[i]];
                    } else {
                        modelObj[this.columns[i]] = null;
                    }

                }

                return modelObj;

            },


        }

        //Create new modal instance
        app.model[modelName] = modelObject;

    }
};/**
 * @public
 *
 * Query module
 * Module designed for usage as singleton during application lifecycle.
 * Can be used in any other modules.
 *
 * Only one active instance in time is available
 *
 * @functions
 * @public  {add}
 * @public  {register}
 * @public  {list}
 *
 */
app.query = {

    /**
     * @public
     *
     * Registering @array of query @object
     *
     * @param queryObjectsList {
     *  @fields
     *  @public name
     *  @public sql
     *  @public group
     * }
     *
     */
    list: function(queryObjectsList){

        $.each(queryObjectsList, function(i, queryObj){
            app.query.register(queryObj.name, queryObj.sql, queryObj.group);
        });

    },

    /**
     * @public
     *
     * Substitute method for register
     *
     * @param languageName
     * @param laguageFilePath
     */
    add: function(queryName, querySQL, queryGroup){
        this.register(queryName, querySQL, queryGroup);
    },

    /**
     * @public
     *
     * Creates new @query object containing binding functions, SQL scripts,
     * execution function.
     *
     * @param queryName
     * @param querySQL
     * @param queryGroup
     *
     */
    register: function(queryName, querySQL, queryGroup){

        //If @param querySQL is function, then execute it for final SQL string
        if(app.util.System.isFunction(querySQL)){
            querySQL = querySQL();
        }

        /**
         * @public
         *
         * Query object with build-in functions to query operations
         *
         * @functions
         * @public {bind}
         * @public {execute}
         *
         * @private {__bindArrayParams}
         * @private {__bindMapParams}
         *
         * @fields
         * @private {__sql}
         */
        var queryObj = {

            /**
             * @private
             *
             * Variable to store plain SQL query
             */
            __sql: querySQL,

            /**
             * @public
             *
             * Function returns SQL query with binded params passed as @array or @object
             *
             * Example:
             *
             * if SQL is "select * from person where id = ? "
             *
             * "select * from person where id = 1 " = app.query.SomeQuery.bind([1])
             *
             * if SQL is "select * from person where id = :id "
             * "select * from person where id = 2 " = app.query.SomeQuery.bind({ id: 2 })
             *
             *
             * @param queryParamsListOrMap
             */
            bind: function(queryParamsListOrMap){

                var sql = this.__sql;

                //If @param queryParamsListOrMap is @array then bind as array params
                if(queryParamsListOrMap instanceof Array) {
                    sql = this.__bindArrayParams(queryParamsListOrMap, sql);
                }else{
                    sql = this.__bindMapParams(queryParamsListOrMap, sql);
                }


                return sql;

            },

            /**
             * @private
             *
             * Function binds @array of params to passed SQL query @string
             * and returns binded @string query
             *
             * @param paramsList
             * @param sql
             */
            __bindArrayParams: function(paramsList, sql){

                for (var i = 0; i < paramsList.length; i++) {

                    if (typeof paramsList[i] == 'string') {
                        sql = sql.replace('?', "'" + paramsList[i] + "'");
                    } else {
                        sql = sql.replace('?', paramsList[i]);
                    }

                }

                return sql;

            },

            /**
             * @private
             *
             * Function binds params @object to passed SQL query @string
             * and returns binded @string query
             *
             * @param paramsObject
             * @param sql
             */
            __bindMapParams: function(paramsObject, sql){

                for (var fieldName in paramsObject){

                    var fieldValue = paramsObject[fieldName];

                    if (typeof fieldValue == 'string') {
                        sql = sql.replace(':'+fieldName, "'" + fieldValue + "'");
                    } else {
                        sql = sql.replace(':'+fieldName, fieldValue);
                    }

                }

                return sql;

            },

            /**
             * @public
             *
             * Function executes query on local DB (SQLLite) and invokes
             * @param @function successCallback returning query result
             * or @param @function errorCallback returning database error
             *
             * Optionally can handle @param queryParamsListOrMap to bind
             * query params (see @bind)
             *
             * @param successCallback
             * @param errorCallback
             * @param queryParamsListOrMap -- optional for binding
             */
            execute: function(successCallback, errorCallback, queryParamsListOrMap){

                var sqlToExecute = this.__sql;

                //If @param queryParamsListOrMap exist then bind query params
                if(!app.util.System.isNull(queryParamsListOrMap)){
                    sqlToExecute = this.bind(queryParamsListOrMap);
                }

                //Execute query on CRUD @__execute method
                app.crud.execute(sqlToExecute, successCallback, errorCallback);
            }



        }

        //If query group not passed, then create typical query
        if(app.util.System.isNull(queryGroup)){

            app.query[queryName] = queryObj;

        }else{

            //If query group not exist yet, create empty object
            if(app.util.System.isNull(app.query[queryGroup])){
                app.query[queryGroup] = {};
            }

            //Assign query object to query group
            app.query[queryGroup][queryName] = queryObj;
        }

    }

};/**
 * @public
 *
 * Rest module
 * Module designed for usage as REST execution provider
 * Can be used in any other module.
 *
 * Only one active instance in time is available
 *
 * @functions
 * @public  {add}
 * @public  {register}
 * @public  {list}
 * @public  {spinnerShow}
 * @public  {spinnerHide}
 * @public  {isSpinnerExcluded}
 *
 * @public  {get}
 * @public  {delete}
 * @public  {update}
 * @public  {post}
 *
 * @private {__createCachedPromise}
 * @private {__isMock}
 * @private {__getDelete}
 * @private {__postPut}
 *
 * @private {__execByUrl}
 * @private {__execByName}
 * @private {__isEnabledMockByUrlAndMethod}
 *
 * @fields
 * @public {api}
 * @public {spinnerExclude}
 *
 */
app.rest = {


    /**
     * @public
     *
     * Storage for @rest objects to use in @rest execution
     *
     */
    api: {},

    /**
     * @public
     * List of URLs where spinner functions won't fire
     *
     */
    spinnerExclude: [],

    __interceptors: {},

    /**
     * @public
     *
     * Function saves new interceptor function which one
     * can be executed during rest api invoking and which one's
     * accepts @response and @promise arguments
     *
     * @param interceptorName
     * @param interceptorFunction
     */
    interceptor: function(interceptorName, interceptorFunction){

        //Check if interceptor exists, then throws error
        if(app.rest.__interceptors[interceptorName]){
            app.system.__throwError(app.system.__messages.INTERCEPTOR_ALREADY_REGISTRED, [interceptorName]);
        }

        //Saves interceptor function to @__interceptors
        app.rest.__interceptors[interceptorName] = interceptorFunction;

    },

    /**
     * @private
     *
     * Function iterates passed interceptors (names) and
     * invokes each interceptor function.
     *
     * If interceptor not exists, then throws warn
     *
     * @param response
     * @param promise
     * @param interceptors
     */
    __invokeInterceptors: function(response, promise, interceptors){

        for(var i = 0; i < interceptors.length; i++){

            if(!app.rest.__interceptors[interceptors[i]]){
                app.system.__throwWarn(app.system.__messages.INTERCEPTOR_NOT_EXISTS, [interceptors[i]]);
            }else{
                app.rest.__interceptors[interceptors[i]](response, promise);
            }

        }

    },

    /**
     * @public
     * @toImplement
     *
     * Function can be override.
     * Runs every time when request begins
     * Can be disabled by excluding some URLs setting them in @app.rest.spinnerExclude
     *
     * @param requestUrl
     */
    spinnerShow: function(requestUrl){
    },

    /**
     * @public
     * @toImplement
     *
     * Function can be override.
     * Runs every time when request completes
     * Can be disabled by excluding some URLs setting them in @app.rest.spinnerExclude
     *
     * @param requestUrl
     */
    spinnerHide: function(requestUrl){
    },

    /**
     * @public
     *
     * Function checks if spinner functions should executing
     *
     * @param requestUrl
     *
     */
    isSpinnerExcluded: function(requestUrl){

        for(var i = 0; i < app.rest.spinnerExclude.length;i++){
            if(requestUrl == app.rest.spinnerExclude[i]){
                return true;
            }
        }

        return false;

    },


    /**
     * @private
     *
     * Function return true if mock api with passed url and method is enabled
     *
     * @param url
     * @param method
     *
     */
    __isEnabledMockByUrlAndMethod: function(url, method){

        for(prop in app.rest.api){
            if(app.rest.api[prop].url == url && app.rest.api[prop].method == method.toLowerCase() && app.rest.api[prop].enabled){
                return true;
            }
        }

        return false;

    },


    /**
     * @private
     *
     * Function executes mock object @returning function
     * searching it by @param url and @param method.
     * @returning function is invokes with @param request data.
     *
     * @param url
     * @param method
     * @param request
     *
     */
    __execMockByUrl: function(url, method, request){

        for(prop in app.rest.api){
            if(app.rest.api[prop].url == url && app.rest.api[prop].method == method.toLowerCase() && app.rest.api[prop].enabled){
                return app.rest.api[prop].mockExec(request);
            }
        }

    },

    /**
     * @private
     *
     * Function executes mock object @returning function
     * searching it by @param name and @param method.
     * @returning function is invokes with @param request data.
     *
     * @param url
     * @param method
     * @param request
     *
     */
    __execMockByName: function(name, method, request){

        for(prop in app.rest.api){
            if((prop == name) && (app.rest.api[prop].method == method.toLowerCase()) && app.rest.api[prop].enabled){
                return app.rest.api[prop].mockExec(request);
            }
        }

    },

    /**
     * @private
     *
     * Function creates and returns basic promise object
     *
     * @param data
     *
     */
    __createCachedPromise: function(data, interceptors){

        var promise = {
            result: data,
            then: function(callback){

                if(promise.result){
                    data = promise.result;
                }

                var _result = callback(data);

                if(_result){
                    promise.result = _result;
                }

                return promise;

            },
            catch: function(){
                return promise;
            }
        }

        app.rest.__invokeInterceptors(data, promise, interceptors);

        return promise;


    },

    /**
     * @public
     *
     * Registering @array of rest @object
     *
     * @param restObjectsList {
     *  @fields
     *  @public name
     *  @public url
     *  @public method
     *  @public mock {
     *      @fields
     *      @public enabled
     *      @public returning
     *  }
     * }
     *
     */
    list: function(restObjectsList){

        $.each(restObjectsList, function(i, restObj){
            app.rest.register(restObj.name, restObj.url, restObj.method, restObj.mock.returning, restObj.mock.enabled);
        });

    },

    /**
     * @public
     *
     * Substitute method for register
     *
     * @param restName
     * @param restUrl
     * @param restMethod
     * @param mockReturningFunction
     * @param mockEnabled -- optional (default false)
     *
     */
    add: function(restName, restUrl, restMethod, mockReturningFunction, mockEnabled){
        this.register(restName, restUrl, restMethod, config, mockReturningFunction, mockEnabled);
    },

    /**
     * @public
     *
     * Creates new rest object
     * @param mockUrl can be string as well as function
     *
     * @param restName
     * @param restUrl
     * @param restMethod
     * @param mockReturningFunction
     * @param mockEnabled -- optional (default false)
     *
     */
    register: function(restName, restUrl, restMethod, mockReturningFunction, mockEnabled){

        if(app.util.System.isNull(mockEnabled)){
            mockEnabled = false;
        }

        var urlVal = null;

        if(typeof restUrl == 'string'){
            urlVal = restUrl;
        }else{
            urlVal = restUrl();
        }

        restMethod = restMethod.toLowerCase();

        app.rest.api[restName] = {
            url: urlVal,
            method: restMethod,
            mockExec: mockReturningFunction,
            mockEnabled: mockEnabled,
            promise: app.rest.__getExecFunction(urlVal, restMethod)
        }

    },

    __getExecFunction: function(url, method){

        if(method == 'get'){

            return function(config){
                return app.rest.get(url, config || {});
            }

        }else if(method == 'delete'){

            return function(config){
                return app.rest.delete(url, config || {});
            }

        }else if(method == 'post'){

            return function(request, config){
                return app.rest.post(url, request, config || {});
            }

        }else if(method == 'put'){

            return function(request, config){
                return app.rest.put(url, request, config || {});
            }

        }


    },

    /**
     * @public
     *
     * Function executes GET request
     * Function return promise with execution params for passed @param urlOrCachedData
     *
     * If @rest has @mock.enabled = true then use @mock
     *
     * @param urlOrCachedData
     * @param propertiesObject -- optional {headers, pathParams, urlParams, interceptors}
     *
     */
    get: function (urlOrCachedData, propertiesObject) {

        propertiesObject = propertiesObject || {};

        if(typeof urlOrCachedData == 'string'){
            return app.rest.__getDelete(urlOrCachedData, 'GET', propertiesObject.pathParams, propertiesObject.headers, propertiesObject.urlParams, propertiesObject.interceptors || []);
        }else{
           return this.__createCachedPromise(urlOrCachedData, propertiesObject.interceptors || []);
        }

    },

    /**
     * @public
     *
     * Function executes DELETE request
     * Function return promise with execution params for passed @param urlOrCachedData
     *
     * If @rest has @mock.enabled = true then use @mock
     *
     * @param urlOrCachedData
     * @param propertiesObject -- optional {headers, pathParams, urlParams, interceptors}
     *
     */
    delete: function (urlOrCachedData, propertiesObject) {

        propertiesObject = propertiesObject || {};

        if(typeof urlOrCachedData == 'string'){
            return  app.rest.__getDelete(urlOrCachedData, 'DELETE', propertiesObject.pathParams, propertiesObject.headers, propertiesObject.urlParams, propertiesObject.interceptors || []);
        }else{
            return this.__createCachedPromise(urlOrCachedData, propertiesObject.interceptors || []);
        }


    },

    /**
     * @public
     *
     * Function executes PUT request
     * Function return promise with execution params for passed @param urlOrCachedData
     *
     * If @rest has @mock.enabled = true then use @mock
     *
     * @param urlOrCachedData
     * @param propertiesObject -- optional {headers, pathParams, urlParams, interceptors}
     *
     */
    update: function (urlOrCachedData, request, propertiesObject) {

        propertiesObject = propertiesObject || {};

        if(typeof urlOrCachedData == 'string'){
            return  app.rest.__postPut(urlOrCachedData, 'PUT', request, propertiesObject.pathParams, propertiesObject.headers, propertiesObject.urlParams, propertiesObject.interceptors || []);
        }else{
            return this.__createCachedPromise(urlOrCachedData, propertiesObject.interceptors || []);
        }

    },

    /**
     * @public
     *
     * Function executes POST request
     * Function return promise with execution params for passed @param urlOrCachedData
     *
     * If @rest has @mock.enabled = true then use @mock
     *
     * @param urlOrCachedData
     * @param propertiesObject -- optional {headers, pathParams, urlParams, interceptors}
     *
     */
    post: function (urlOrCachedData, request, propertiesObject) {

        propertiesObject = propertiesObject || {};

        if(typeof urlOrCachedData == 'string'){
            return  app.rest.__postPut(urlOrCachedData, 'POST', request, propertiesObject.pathParams, propertiesObject.headers, propertiesObject.urlParams, propertiesObject.interceptors || []);
        }else{
            return this.__createCachedPromise(urlOrCachedData, propertiesObject.interceptors || []);
        }

    },

    /**
     * @private
     *
     * Function decides if endpoint is mocked and mock is enabled then
     * execute mock @returning function.
     *
     * If no mock available then process normal way using REST.
     *
     * Returns promise
     *
     * @param url
     * @param method
     * @param request
     * @param callBackIsnt
     *
     */
    __isMock: function(url, method, request, interceptors, callBackIsnt){

        var promise = null;
        if(app.rest.__isEnabledMockByUrlAndMethod(url, method)){

            var result = app.rest.__execMockByUrl(url, method, request);

            promise = {
                result: result,
                then: function(callBack){

                    var _result = callback(promise.result);

                    if(_result){
                        promise.result = _result;
                    }

                    callBack(promise.result);

                    return promise;

                },
                catch: function(callBack){
                    return promise;
                }
            };

            app.rest.__invokeInterceptors(result, promise, interceptors);

        }else{
            promise = callBackIsnt();
        }

        return promise;

    },

    /**
     * @private
     *
     * Function to realize GET and DELETE methods execution using AJAX
     * and preparing url params, path params, headers etc.
     *
     * Constructs promise and returns it.
     *
     * @param url
     * @param method
     * @param pathParams
     * @param headers
     * @param urlParams
     *
     */
    __getDelete: function (url, method, pathParams, headers, urlParams, interceptors) {

        return app.rest.__isMock(url, method, null, interceptors, function(){

            var preparedUrl = url;

            if(pathParams !== undefined && pathParams !== null){
                preparedUrl = app.util.System.preparePathDottedParams(url, pathParams);
            }

            if(urlParams !== undefined && urlParams !== null){
                preparedUrl = app.util.System.prepareUrlParams(url, urlParams);
            }

            var dataType =  "json";
            var contentType = "application/json; charset=utf-8";

            if(headers && headers['Content-Type']){
                contentType = headers['Content-Type'];
            }

            if(headers && headers.contentType){
                contentType = headers.contentType;
            }

            if(headers && headers.dataType){
                dataType = headers.dataType;
            }

            var promise = $.ajax({
                url: preparedUrl,
                type: method,
                beforeSend: function () {

                    if(!app.rest.isSpinnerExcluded(url)){
                        app.rest.spinnerShow(url);
                    }

                },
                complete: function () {

                    if(!app.rest.isSpinnerExcluded(url)){
                        app.rest.spinnerHide(url);
                    }

                },
                headers: headers,
                contentType: contentType,
                dataType: dataType
            });

            promise.result = null;

            promise.then = function(callback){

                promise.done(function(result){

                    if(promise.result){
                        result = promise.result;
                    }

                    app.rest.__invokeInterceptors(result, promise, interceptors);

                    var _result = callback(result, promise);

                    if(_result){
                        promise.result = _result;
                    }

                });

                return promise;
            };

            promise.catch = function(callback){
                promise.fail(function(error){
                    app.rest.__invokeInterceptors(error, promise, interceptors);
					callback(error, promise);
				});
                return promise;
            };

            return promise;

        });



    },

    /**
     * @private
     *
     * Function to realize POST and PUT methods execution using AJAX
     * and preparing request data, url params, path params, headers etc.
     *
     * Constructs promise and returns it.
     *
     * @param url
     * @param method
     * @param pathParams
     * @param headers
     * @param urlParams
     *
     */
    __postPut: function (url, method, request, pathParams, headers, urlParams, interceptors) {

        return app.rest.__isMock(url, method, request, interceptors, function(){

            var jsonData = JSON.stringify(request);

            var preparedUrl = url;

            if(pathParams !== undefined && pathParams !== null){
                preparedUrl = app.util.System.preparePathDottedParams(url, pathParams);
            }

            if(urlParams !== undefined && urlParams !== null){
                preparedUrl = app.util.System.prepareUrlParams(url, urlParams);
            }

            var dataType =  "json";
            var contentType = "application/json; charset=utf-8";

            if(headers && headers['Content-Type']){
                contentType = headers['Content-Type'];
            }

            if(headers && headers.contentType){
                contentType = headers.contentType;
            }

            if(headers && headers.dataType){
                dataType = headers.dataType;
            }

            var promise = $.ajax({
                url: preparedUrl,
                data: jsonData,
                type: method,
                beforeSend: function () {

                    if(!app.rest.isSpinnerExcluded(url)){
                        app.rest.spinnerShow(url);
                    }

                },
                complete: function () {

                    if(!app.rest.isSpinnerExcluded(url)){
                        app.rest.spinnerHide(url);
                    }

                },
                headers: headers,
                contentType: contentType,
                dataType: dataType
            });

           
            promise.then = function(callback){

                promise.done(function(result){

                    if(promise.result){
                        result = promise.result;
                    }

                    app.rest.__invokeInterceptors(result, promise, interceptors);

                    var _result = callback(result, promise);

                    if(_result){
                        promise.result = _result;
                    }

                });

                return promise;
            };

            promise.catch = function(callback){
                promise.fail(function(error){
                    app.rest.__invokeInterceptors(error, promise, interceptors);
					callback(error, promise);
				});
                return promise;
            };

            return promise;

        });

    }


};/**
 * @public
 *
 * jQuery extension to invoke on elements like forms
 * which one's have @attr name
 *
 * Creating object from jQuery.fn.serializeArray() result
 *
 */
jQuery.fn.extend({
    
    serializeObject: function() {
        
        var serializedArray = this.serializeArray();
        var serializedObject = {};
        
        for(var i = 0;i<serializedArray.length;i++){

            var value = serializedArray[i].value;

            if(value == 'on'){
                value = true;
            }else if(value == 'off'){
                value = false;
            }

            serializedObject[serializedArray[i].name] = value;
        }
        
        return serializedObject;
        
    }
    
});/**
 * @public
 *
 * jQuery extension to invoke specified jQuery method on HTML tags
 *
 * Example invoking set('www.someSite.com/image.png') on @image tag sets value for @attr src
 * Example invoking set('Name') on @span tag sets @innerHtml
 * Example invoking set('England') on @input tag sets value for @attr value
 *
 * Optional value can be passed by custom filter.
 *
 * @param value
 * @param filter --optional
 */
jQuery.fn.extend({

    set: function (_value, _filter) {

        if (_value === undefined || _value == null) {
            return;
        }

        if (_filter && _value !== undefined && _value !== null) {
            _value = _filter(_value);
        }

        var setFunction = function (selector, value) {

            var elementType = selector.prop('tagName');

            if (!elementType) {
                elementType = selector.prop('nodeName');
            }

            elementType = elementType.toLowerCase();

            if (elementType == 'label' || elementType == 'div' || elementType == 'span' || elementType == 'button' || elementType == 'p' || elementType.indexOf('h') > -1) {
                selector.html(value.toString());
            } else if (elementType == 'img') {
                selector.attr('src', value);
            } else if (selector.is(':checkbox')) {
                if (value == true || parseInt(value) == 1) {
                    selector.prop('checked', true);
                } else {
                    selector.prop('checked', false);
                }
            } else if (elementType == 'a') {
                selector.attr('href', value);
            } else {
                selector.val(value);
            }

        }

        setFunction($(this), _value);

    },


});/**
 * @public
 *
 * jQuery extension to receive all tag additional attributes
 *
 * Creating object from jQuery.fn.attrs() result
 *
 */
jQuery.fn.extend({

    attrs: function () {

        var attributesMap = {};

        jQuery.each(this[0].attributes, function () {
            if (this.specified) {

                this.name = this.name.replace('data-','');

                attributesMap[app.util.System.toCamelCase(this.name)] = this.value;
            }
        });

        return attributesMap;

    },

});/**
 * Added default @public config.bootstrapModal
 * configuration option for custom Bootstrap modal implementation
 *
 * @fields
 * @public {bootstrapModal}
 */
app.config.extend({
    bootstrapModal: false
});


/**
 * @annonymus
 * @overriding
 *
 * Custom implementation of register event for Bootstrap modals
 */
app.modal.implement('register', function(modalObject){

    if(app.config.bootstrapModal){

        if(modalObject.preventDismiss){
            modalObject.__preventDismiss = true;
        }else{
            modalObject.__preventDismiss = false;
        }

    }

});

/**
 * @annonymus
 * @overriding
 *
 * Custom implementation of render event for Bootstrap modals
 */
app.modal.implement('render', function(modalSelector, modalObject){

    if (app.config.bootstrapModal){

        if(modalObject.__preventDismiss) {

            modalSelector.modal({
                backdrop: 'static',
                keyboard: false
            });

        } else if(app.config.bootstrapModal) {
            modalSelector.modal();
        }

        modalSelector.on('hidden.bs.modal', function () {
            modalObject.__hidden = true;
        })
    }

});

/**
 * @annonymus
 * @overriding
 *
 * Custom implementation of show event for Bootstrap modals
 * If @public config.bootstrapModal is true, then use Bootstrap show event
 * In other case use default jQuery implementation
 */
app.modal.implement('show', function (modalSelector, modalObject, defaultImpl) {

    if(app.config.bootstrapModal){
        modalSelector.modal('show');
    }else{
        defaultImpl(modalSelector);
    }

});

/**
 * @annonymus
 * @overriding
 *
 * Custom implementation of register hide for Bootstrap modals
 * If @public config.bootstrapModal is true, then use Bootstrap hide event
 * In other case use default jQuery implementation
 */
app.modal.implement('hide', function (modalSelector, modalObject, defaultImpl) {

    if(app.config.bootstrapModal){
        modalSelector.modal('hide');
        $('body').removeClass('modal-open');
        $('div.modal-backdrop').remove();

    }else{
        defaultImpl(modalSelector);
    }



});