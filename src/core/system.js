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
        SET_VAL: 'spike-val',

        TEMPLATE_INCLUDE: '@template',

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
    version: '2.0',


    /**
     * @public
     *
     * Stores name of current rendered controller
     */
    currentController: null,

    getCurrentController: function () {

        var endpoint = app.router.__getCurrentViewData().endpoint;

        if (endpoint) {
            return endpoint.controller;
        }

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

        if (!app.config.enableSecurity && app.config.showObj) {
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

        if (!app.config.enableSecurity && app.config.showLog) {
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

        if (!app.config.enableSecurity && app.config.showError) {
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

        if (!app.config.enableSecurity && app.config.showDebug) {
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

        if (!app.config.enableSecurity && app.config.showWarn) {
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

        if (!app.config.enableSecurity && app.config.showOk) {
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
                if (i == lineAccessingLogger.length - 1) {
                    stackStr += "\n ERROR HERE: " + lineAccessingLogger[i];
                } else {
                    stackStr += "\n" + lineAccessingLogger[i];
                }
            }

            console.log('%c' + app.util.System.currentDateLog() + ' Spike Framework: ' + message + ' stacktrace: ', 'color: ' + color);
            console.log('%c' + stackStr, 'color: ' + color);

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

        APPLICATION_EVENT_CALLBACK_NULL: 'Applicaton event listener {0} is null',
        APPLICATION_EVENT_NOT_EXIST: 'Application event {0} not exists',
        APPLICATION_EVENT_ALREADY_EXIST: 'Application event {0} already exists',
        ROUTING_ENABLED_NOT_DEFINED: 'Routing is enabled but not defined in app.config',
        ROUTE_NAME_NOT_EXIST: 'Route name {0} not exists',
        ROUTE_NAME_EXIST: 'Route name {0} already exists, must be unique',
        ENUMERATOR_ALREADY_REGISTRED: 'Enumerator {0} is already registered',
        UTIL_ALREADY_REGISTRED: 'Util {0} is already registred',
        SERVICE_ALREADY_REGISTRED: 'Service {0} is already registred',
        INHERIT_ABSTRACT_NOT_EXIST: 'Inheriting abstracts into {0} - some abstracts not exists',
        ABSTRACT_ALREADY_REGISTRED: 'Abstract {0} is already registred',
        INTERCEPTOR_ALREADY_REGISTRED: 'Interceptor {0} is already registred',
        COMPONENT_NOT_DECLARED: 'Component {0} is not registred',
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
        TRANSLATION_MESSAGE_NOT_FOUND: 'Translation for message {0} not found',
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
    __clearSelectorsCache: function () {
        app.system.__selectorsCache = {};
    },

    /**
     * @private
     *
     * Clears selector given id from cache
     *
     * @param selectorId
     */
    __clearSelectorInCache: function (selectorId) {
        if (app.system.__selectorsCache[selectorId]) {
            app.system.__selectorsCache[selectorId] = null;
        }
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

            //Creating new hash for identifier
            var newName = name + '-' + app.util.System.hash();

            selectors.names[name] = function () {
              return $('[spike-name="' + newName + '"]');
            }

            //Replacing identifier with generated hash
            templateHtml = templateHtml.replace('name="' + name + '"', 'spike-name="' + newName + '" name="' + name + '"');

          });


      //Creating identifiers selectors functions
        $.each(idList, function (i, id) {

            //Creating new hash for identifier
            var newId = id + '-' + app.util.System.hash();

            //Creating handler function for identifier with optional basic events binding by @jQuery
            selectors[id] = function (eventsToBind) {

                var selector = app.system.__selectorsCache[newId];

                if (!selector) {
                    selector = $('#' + newId);
                    selector.plainId = newId;
                    app.system.__selectorsCache[newId] = selector;
                } else {
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
     * Throws @error and @warn from Spike Framework
     *
     * @param errorMessage
     * @param errorMessageBinding
     */
    __throwErrorAndWarn: function(errorMessage, errorMessageBinding){
        app.system.__throwError(errorMessage, errorMessageBinding);
        app.system.__throwWarn(errorMessage, errorMessageBinding);
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
        app.debug('Invoke system.__renderModal', []);
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
        app.debug('Invoke system._renderController with params', []);
        app.log('Rendering controller {0}', [controllerObject.__name]);

        //Scrolling to top of page
        if (controllerObject.scrollTop == true) {
            $(window).scrollTop(0);
        }

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
        app.system.__checkComponentsIntegrity();


        if (afterRenderCallback) {
            afterRenderCallback();
        }

        app.ok('Selectors cache usage during app lifecycle: ' + app.system.__cacheUsageCounter);

    },

    /**
     * @private
     *
     * Checks if after controller render still exists some unrendered components
     * If exists, throw errors for all of them
     */
    __checkComponentsIntegrity: function () {

        $('component').each(function (i, element) {
            app.system.__throwError(app.system.__messages.COMPONENT_NOT_DECLARED_IN_COMPONENTS, [$(element).attr('name')]);
        });

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

        //Enables security if declared
        if (app.config.enableSecurity) {
            app.debug('Enabling JavaScript console security');
            app.security.__enableSecurity();
            app.security.f43gfd4();
        }

        app.debug('Invoke system.init with params', []);

        app.ok('System initializing...');

        app.debug('veryfing views');
        app.modal.__verifyView();
        app.controller.__verifyView();

        app.warn('jQuery version: {0}', [jQuery.fn.jquery]);
        app.warn('Spike version: {0}', [app.version]);

        //Waits until document is ready
        //$(document).ready(function () {

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


        // });


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
        app.debug('Invoke system.__mainRender with params', []);

        if (app.events.onReady) {
            app.events.onReady();
        }

        app.ok('Spike application ready to work...');

        app.debug('Try to invoke system.render with controller: {0}', [app.config.mainController]);

        if (!app.config.routingEnabled) {
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

    },

    /**
     * List of allowed events which can be binded by Spike Framework and compiled by Spike compiler
     */
    __allowedEvents: [
        'click',
        'change',
        'keyup',
        'keydown',
        'keypress',
        'blur',
        'focus',
        'dblclick',
        'die',
        'hover',
        'keydown',
        'mousemove',
        'mouseover',
        'mouseenter',
        'mousedown',
        'mouseleave',
        'mouseout',
        'submit',
        'trigger',
        'toggle',
        'load',
        'unload'
    ],

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
    __bindEvents: function (rootSelector) {

        rootSelector.find('[spike-unbinded]').each(function (i, element) {

            element = $(element);
            element.off();

            for (var i = 0; i < app.system.__allowedEvents.length; i++) {

                var eventFunctionBody = element.attr('spike-event-' + app.system.__allowedEvents[i]);

                if (eventFunctionBody) {
                    element.on(app.system.__allowedEvents[i], Function('event', eventFunctionBody));
                }

            }

            element.removeAttr('spike-unbinded');

        });

    },

    /**
     * @private
     *
     * Function searches and replaces all static templates in given HTML
     * Returns processed HTML
     *
     * @param templateHtml
     */
    __replacePlainTemplates: function (templateHtml) {

        var templatesIncludes = app.util.System.findStringBetween(templateHtml, app.__attributes.TEMPLATE_INCLUDE + '\\(', '\\)');

        for (var i = 0; i < templatesIncludes.length; i++) {
            templatesIncludes[i] = templatesIncludes[i].replace(app.__attributes.TEMPLATE_INCLUDE + '(', '').replace(')', '');
            templatesIncludes[i] = {
                templateFullName: app.system.__getStaticTemplateName(templatesIncludes[i]),
                templateInclude: templatesIncludes[i]
            }
        }

        for (var i = 0; i < templatesIncludes.length; i++) {

            if (window[app.__globalTemplates][templatesIncludes[i].templateFullName]) {
                templateHtml = templateHtml.split(app.__attributes.TEMPLATE_INCLUDE + '(' + templatesIncludes[i].templateInclude + ')').join(window[app.__globalTemplates][templatesIncludes[i].templateFullName]);
            }

        }

        return templateHtml;

    },

    /**
     * @private
     *
     * Returns static template from @__globalTemplates
     * @param templateName
     *
     */
    __getStaticTemplateName: function (templateName) {
        return '@template/' + templateName;
    },

};

/**
 * Added to using bind to provide $this context into jQuery events callbacks
 */
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {
            },
            fBound = function () {
                return fToBind.apply(this instanceof fNOP
                        ? this
                        : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        if (this.prototype) {
            // Function.prototype doesn't have a prototype property
            fNOP.prototype = this.prototype;
        }
        fBound.prototype = new fNOP();

        return fBound;
    };
}
