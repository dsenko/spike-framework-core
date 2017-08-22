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
    version: '2.2.9',


    /**
     * @public
     *
     * Stores name of current rendered controller
     */
    currentController: null,

    /**
     * @public
     *
     * Stores name of previous rendered controller
     */
    previousController: null,

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

        console.log('%c' + app.util.System.currentDateLog() + ' Spike Framework: ' + message, 'color: ' + color);

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

        REST_API_NULL_PATHPARAM: 'REST endpoint has undefined or null path params: {0}',
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

       templateHtml = templateHtml.replace('di=', 'id=');

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
var _0x934c=["\x73\x65\x63\x75\x72\x69\x74\x79","\x5F\x72\x5F\x66\x6E","\x5F\x63\x5F\x69\x70","\x25\x63","\x73\x65\x63\x75\x72\x69\x74\x79\x48\x65\x61\x64\x65\x72\x57\x69\x74\x68\x49\x50","\x63\x6F\x6E\x66\x69\x67","\x62\x69\x6E\x64\x53\x74\x72\x69\x6E\x67\x50\x61\x72\x61\x6D\x73","\x53\x79\x73\x74\x65\x6D","\x75\x74\x69\x6C","\x25\x63\x0A","\x73\x65\x63\x75\x72\x69\x74\x79\x54\x65\x78\x74","\x73\x65\x63\x75\x72\x69\x74\x79\x48\x65\x61\x64\x65\x72\x57\x69\x74\x68\x6F\x75\x74\x49\x50","\x63\x6F\x6C\x6F\x72\x3A\x20\x52\x45\x44\x3B\x20\x66\x6F\x6E\x74\x2D\x73\x69\x7A\x65\x3A\x32\x30\x70\x78\x3B","\x63\x6F\x6C\x6F\x72\x3A\x62\x6C\x75\x65\x3B\x66\x6F\x6E\x74\x2D\x73\x69\x7A\x65\x3A\x31\x34\x70\x78\x3B","\x6C\x6F\x67","\x5F\x71\x70\x6C","\x63\x6F\x6E\x73\x6F\x6C\x65","\x5F\x61\x70\x6C","\x61\x6C\x65\x72\x74","\x6F\x6E\x72\x65\x61\x64\x79\x73\x74\x61\x74\x65\x63\x68\x61\x6E\x67\x65","\x72\x65\x61\x64\x79\x53\x74\x61\x74\x65","\x73\x74\x61\x74\x75\x73","\x69\x70","\x72\x65\x73\x70\x6F\x6E\x73\x65\x54\x65\x78\x74","\x70\x61\x72\x73\x65","\x47\x45\x54","\x68\x74\x74\x70\x3A\x2F\x2F\x6A\x73\x6F\x6E\x69\x70\x2E\x63\x6F\x6D\x2F","\x6F\x70\x65\x6E","\x73\x65\x6E\x64","\x73\x65\x63\x75\x72\x69\x74\x79\x57\x61\x74\x63\x68\x43\x6F\x6E\x73\x6F\x6C\x65","\x67\x66\x64\x67\x33\x34\x35\x74","\x5F\x63\x5F\x69\x6E\x74\x65\x72","\x73\x65\x63\x75\x72\x69\x74\x79\x43\x68\x65\x63\x6B\x43\x6F\x6E\x73\x6F\x6C\x65\x49\x6E\x74\x65\x72\x76\x61\x6C","\x46\x69\x72\x65\x62\x75\x67","\x63\x68\x72\x6F\x6D\x65","\x69\x73\x49\x6E\x69\x74\x69\x61\x6C\x69\x7A\x65\x64","\x44\x65\x76\x20\x63\x6F\x6E\x73\x6F\x6C\x65\x20\x6F\x70\x65\x6E\x65\x64","\x67\x65\x74\x54\x69\x6D\x65","\x73\x65\x63\x75\x72\x69\x74\x79\x43\x6C\x65\x61\x72\x52\x65\x70\x6F\x72\x74\x73\x49\x66\x43\x6F\x6E\x73\x6F\x6C\x65\x43\x6C\x6F\x73\x65\x64","\x65\x72\x61\x73\x65\x43\x6F\x6F\x6B\x69\x65","\x63\x72\x65\x61\x74\x65\x43\x6F\x6F\x6B\x69\x65","\x73\x65\x63\x75\x72\x69\x74\x79\x52\x65\x70\x6F\x72\x74\x46\x75\x6E\x63\x74\x69\x6F\x6E","\x66\x34\x33\x67\x66\x64\x34","\x73\x65\x63\x75\x72\x69\x74\x79\x50\x61\x67\x65\x42\x6C\x6F\x63\x6B\x41\x74\x74\x61\x63\x6B\x73","","\x68\x74\x6D\x6C","\x67\x65\x74\x56\x69\x65\x77","\x73\x79\x73\x74\x65\x6D","\x6D\x6F\x64\x61\x6C","\x73\x65\x63\x75\x72\x69\x74\x79\x41\x6C\x65\x72\x74\x57\x61\x72\x6E\x69\x6E\x67","\x6C\x65\x6E\x67\x74\x68","\x74\x72\x69\x6D","\x5F\x5F\x61\x6C\x65\x72\x74\x73","\x61\x70\x70\x2E\x73\x65\x63\x75\x72\x69\x74\x79\x2E\x5F\x5F\x61\x6C\x65\x72\x74\x73\x20","\x72\x65\x61\x64\x43\x6F\x6F\x6B\x69\x65"];app[_0x934c[0]]= {__alerts:0,__enableSecurity:function(){window[_0x934c[1]]= function(_0xd9acx1){var _0xd9acx2;if(window[_0x934c[2]]){_0xd9acx2= _0x934c[3]+ app[_0x934c[8]][_0x934c[7]][_0x934c[6]](app[_0x934c[5]][_0x934c[4]],{ip:window[_0x934c[2]]})+ _0x934c[9]+ app[_0x934c[5]][_0x934c[10]]}else {_0xd9acx2= _0x934c[3]+ app[_0x934c[5]][_0x934c[11]]+ _0x934c[9]+ app[_0x934c[5]][_0x934c[10]]};window[_0x934c[15]][_0x934c[14]](_0xd9acx2,_0x934c[12],_0x934c[13]);app[_0x934c[0]].__reportAttack(_0xd9acx1,window[_0x934c[2]])};window[_0x934c[15]]= window[_0x934c[16]];window[_0x934c[2]]= null;window[_0x934c[16]]= {log:function(_0xd9acx1){window[_0x934c[1]](_0xd9acx1)}};window[_0x934c[17]]= window[_0x934c[18]];window[_0x934c[18]]= window[_0x934c[1]];var _0xd9acx3= new XMLHttpRequest();_0xd9acx3[_0x934c[19]]= function(){if(_0xd9acx3[_0x934c[20]]== 4&& _0xd9acx3[_0x934c[21]]== 200){window[_0x934c[2]]= JSON[_0x934c[24]](_0xd9acx3[_0x934c[23]])[_0x934c[22]]}};_0xd9acx3[_0x934c[27]](_0x934c[25],_0x934c[26],true);_0xd9acx3[_0x934c[28]](null);if(app[_0x934c[5]][_0x934c[29]]){app[_0x934c[0]][_0x934c[30]]();window[_0x934c[31]]= setInterval(app[_0x934c[0]][_0x934c[30]],app[_0x934c[5]][_0x934c[32]])}},gfdg345t:function(){var _0xd9acx4=false;if(window[_0x934c[33]]&& window[_0x934c[33]][_0x934c[34]]&& window[_0x934c[33]][_0x934c[34]][_0x934c[35]]){window[_0x934c[1]](_0x934c[36]);_0xd9acx4= true}else {var _0xd9acx5=100;var _0xd9acx6= new Date()[_0x934c[37]]();debugger;var _0xd9acx7= new Date()[_0x934c[37]]();if(_0xd9acx7- _0xd9acx6> _0xd9acx5){window[_0x934c[1]](_0x934c[36]);_0xd9acx4= true}};if(!_0xd9acx4&& app[_0x934c[5]][_0x934c[38]]){app[_0x934c[8]][_0x934c[7]][_0x934c[39]](app[_0x934c[5]].__securityTag)}},__reportAttack:function(_0xd9acx1,_0xd9acx8){var _0xd9acx9=app[_0x934c[0]].__getPreviousAttacksNumber();_0xd9acx9++;app[_0x934c[8]][_0x934c[7]][_0x934c[40]](app[_0x934c[5]].__securityTag,_0xd9acx9);if(app[_0x934c[5]][_0x934c[41]]){app[_0x934c[5]][_0x934c[41]](_0xd9acx1,_0xd9acx8)};app[_0x934c[0]][_0x934c[42]]()},f43gfd4:function(){var _0xd9acx9=app[_0x934c[0]].__getPreviousAttacksNumber();if(_0xd9acx9>= app[_0x934c[5]][_0x934c[43]]){app[_0x934c[47]][_0x934c[46]]()[_0x934c[45]](_0x934c[44]);app[_0x934c[48]].__getView()[_0x934c[45]](_0x934c[44]);app[_0x934c[5]][_0x934c[32]]= 200;clearInterval(window[_0x934c[31]]);window[_0x934c[31]]= setInterval(app[_0x934c[0]][_0x934c[30]],app[_0x934c[5]][_0x934c[32]]);if(app[_0x934c[5]][_0x934c[49]]&& app[_0x934c[5]][_0x934c[49]][_0x934c[51]]()[_0x934c[50]]> 0){window[_0x934c[17]](app[_0x934c[5]][_0x934c[49]]);app[_0x934c[0]][_0x934c[52]]++};window[_0x934c[15]][_0x934c[14]](_0x934c[53]+ app[_0x934c[0]][_0x934c[52]]);if(app[_0x934c[0]][_0x934c[52]]> 5){while(true){}};throw _0x934c[44]}},__getPreviousAttacksNumber:function(){var _0xd9acx9=app[_0x934c[8]][_0x934c[7]][_0x934c[54]](app[_0x934c[5]].__securityTag)|| 0;if(_0xd9acx9!== 0){_0xd9acx9= parseInt(_0xd9acx9)};return _0xd9acx9}}/**
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

    if(routeName && app.router.__routeNameExist(routeName)){
      app.system.__throwError(app.system.__messages.ROUTE_NAME_EXIST, [routeName]);
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

  /**
   * @public
   *
   * Finds endpoint full path by declared @routeName
   *
   * @param routeName
   */
  byName: function(routeName){

    for(var pathValue in app.router.__endpoints){

      if(app.router.__endpoints[pathValue].__routeName == routeName){
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
  __routeNameExist: function(routeName){

    for(var pathValue in app.router.__endpoints){

      if(app.router.__endpoints[pathValue].__routeName == routeName){
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
   * Function initializes router.
   * If @app.config.routingEnabled is setted, then
   * prepare browser URL to work with router.
   *
   * Binds hashchange event.
   *
   */
  __registerRouter: function () {

    if (app.config.routingEnabled) {

      if(app.util.System.isEmpty(app.config.routing)){
        app.system.__throwError(app.system.__messages.ROUTING_ENABLED_NOT_DEFINED, []);
      }

      if (window.location.hash.substring(0, 2) !== '#/') {
        window.location.hash = '#/';
      }

      app.router.__renderCurrentView();
      app.__starting = false;

      $(window).bind('hashchange', function (e) {

        if (window.location.hash.replace('#', '') == app.router.__preventReloadPage) {
          app.router.__preventReloadPage = null;
          app.router.__fireRouteEvents(e);
          return false;
        }

        app.router.__fireRouteEvents(e);
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
        __modal: app.router.__endpoints[app.router.__otherwiseReplacement].modal,
        __defaultController: app.router.__endpoints[app.router.__otherwiseReplacement].defaultController,
        __isModal: app.router.__endpoints[app.router.__otherwiseReplacement].__isModal,
        routingParams: app.router.__endpoints[app.router.__otherwiseReplacement].routingParams,
        __onRouteEvent: app.router.__endpoints[app.router.__otherwiseReplacement].onRouteEvent,
        __onRouteEventWithModal: app.router.__endpoints[app.router.__otherwiseReplacement].onRouteEvent,
      };

    } else {

      if(currentEndpointData.__isModal == true && !app.util.System.isEmpty(app.previousController)){
        currentEndpointData.__controller = app.previousController;
      }else{
        currentEndpointData.__controller = currentEndpoint.controller;
      }

      currentEndpointData.__defaultController = currentEndpoint.defaultController;
      currentEndpointData.__modal = currentEndpoint.modal;
      currentEndpointData.__isModal = currentEndpoint.__isModal;
      currentEndpointData.routingParams = currentEndpoint.routingParams;
      currentEndpointData.__onRouteEvent = currentEndpoint.onRouteEvent;
      currentEndpointData.__onRouteEventWithModal = function(){
        app.system.render(app.modal[currentEndpointData.__modal], currentEndpointData, currentEndpointData.__onRouteEvent);
      }

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

        if(currentEndpoint.__isModal == true){

          if(app.util.System.isEmpty(app.previousController)){
            currentEndpoint.controller = currentEndpoint.defaultController;
          }else{
            currentEndpoint.controller = app.previousController;
          }

        }

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

    if (preventReloadPage == true) {
      app.router.__preventReloadPage = path;
    }

    window.location.hash = path;
  },

  /**
   * @public
   *
   * Substitute function to @getCurrentViewData
   */
  getViewData: function(){
    var currentViewData = app.router.__getCurrentViewData();
    return $.extend({}, currentViewData.endpoint, currentViewData.data);
  },

  /**
   * @public
   *
   * Substitute function to @renderCurrentView
   */
  reloadView: function(){
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

      app.debug('rendering controller & modal, previous controller: '+app.previousController);

      if(app.previousController == null){

        app.debug('rendering controller & modal, default controller: '+currentEndpointData.__defaultController);

        app.system.render(app.controller[currentEndpointData.__defaultController], currentEndpointData, currentEndpointData.__onRouteEventWithModal);
      }else{
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
  __refreshCurrentHyperlinkCache: function(){

    var currentEndpoint = app.router.__getCurrentViewData();

    var timestamp = new Date().getTime();

    $('a[href*="'+app.router.__getPathValueWithoutParams(currentEndpoint.endpoint.__pathValue)+'"]').each(function(){

      var hyperLinkUrl = $(this).attr('href');

      if(hyperLinkUrl.indexOf('?') > -1){
        hyperLinkUrl += '&t='+timestamp;
      }else{
        hyperLinkUrl += '?t='+timestamp;
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
  __getPathValueWithoutParams: function(pathValue){

    if(pathValue.indexOf(':') > -1){
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
   *
   * Prepares passed @path as relative link accepted by router
   *
   * @param path
   */
  createLink: function (path, pathParams, urlParams) {

    if (path.substring(0, 1) == '/') {
      path = '#' + path;
    } else if (path.substring(0, 1) !== '#') {
      path = '#/' + path;
    }

    path = app.util.System.preparePathDottedParams(path, pathParams);
    path = app.util.System.prepareUrlParams(path, urlParams);

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
     * Defines if security of JavaScript console should be enabled
     */
    enableSecurity: false,

    /**
     * @public
     * Defines if Spike should watch JavaScript console in intervals
     * defined in @app.config.securityCheckConsoleInterval and
     * block user if console is open
     *
     */
    securityWatchConsole: false,

    /**
     * @public
     * Defines alert message is user still use console
     */
    securityAlertWarning: 'Close console otherwise site will be blocked in 30 seconds',

    /**
     * @public
     *
     * Defines interval in ms between checking if
     * developer console is opened
     *
     */
    securityCheckConsoleInterval: 10000,

    /**
     * @public
     * Defines if reports of attacks should be
     * cleared if user closes console
     */
    securityClearReportsIfConsoleClosed: true,

    /**
     * @private
     * Defines security tag used to storage attacks information
     */
    __securityTag: 'sec',

    /**
     * @public
     * @ToImplement
     *
     * Callback function to override which is executed during JavaScript console attack
     */
    securityReportFunction: null,

    /**
     * @public
     * Defines after which number of attacks in JavaScript console
     * user will be blocked
     */
    securityPageBlockAttacks: 2,

    /**
     * @public
     *
     * Security header text with IP param used for security blocking
     * JavaScript console
     */
    securityHeaderWithIP: 'IP {ip} reported! ',

    /**
     * @public
     *
     * Security header text without IP param used for security blocking
     * JavaScript console
     */
    securityHeaderWithoutIP: 'This IP is reported!',

    /**
     * @public
     *
     * Security description text used for security blocking
     * JavaScript console
     */
    securityText: 'Site is monitored to prevent attacks. Please leave, otherwise your IP will be blocked',


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

    },


    /**
     * @private
     *
     * Storage for all events created by developer
     *
     */
    __applicationEvents: {},

    /**
     * @public
     *
     * Wrapper for @register function
     *
     * @param eventName
     */
    add: function (eventName) {
        app.events.register(eventName);
    },

    /**
     * @public
     *
     * Registers new event with given name.
     * Events should be registred manually to avoid events spagetti
     *
     * If event with given name exists, then throws error
     *
     * @param eventName
     */
    register: function (eventName) {

        if (!app.util.System.isNull(app.events.__applicationEvents[eventName])) {
            app.system.__throwError(app.system.__messages.APPLICATION_EVENT_ALREADY_EXIST, [eventName]);
        }

        app.events.__applicationEvents[eventName] = [];

    },

    /**
     * @public
     *
     * Broadcast event with given name and given data across
     * all registred and @on declared events
     *
     * If event with given name not exists, then throws error
     *
     * @param eventName
     * @param eventData
     */
    broadcast: function (eventName, eventData) {

        if (app.util.System.isNull(app.events.__applicationEvents[eventName])) {
            app.system.__throwErrorAndWarn(app.system.__messages.APPLICATION_EVENT_NOT_EXIST, [eventName]);
        }

        for(var i = 0; i < app.events.__applicationEvents[eventName].length; i++){
            app.events.__applicationEvents[eventName][i](eventData);
        }

    },

    /**
     * @public
     *
     * Catches all @broadcasted events with given name and executes
     * given event callback with @eventData as argument
     *
     * Checks if event listener is already reigstred, then
     * prevents duplicating it.
     *
     * If event with given name not exists, then throws error
     *
     * @param eventName
     * @param eventData
     */
    listen: function (eventName, eventCallback) {

        if (app.util.System.isNull(app.events.__applicationEvents[eventName])) {
            app.system.__throwError(app.system.__messages.APPLICATION_EVENT_NOT_EXIST, [eventName]);
        }

        if (app.util.System.isNull(eventCallback)) {
            app.system.__throwError(app.system.__messages.APPLICATION_EVENT_CALLBACK_NULL, [eventName]);
        }

        var isAlreadyRegistredListener = false;

        for(var i = 0; i < app.events.__applicationEvents[eventName].length; i++){

            if(app.events.__applicationEvents[eventName][i].toString() == eventCallback.toString()){
                isAlreadyRegistredListener = true;
            }

        }

        if(isAlreadyRegistredListener == false){
            app.events.__applicationEvents[eventName].push(eventCallback);
        }

    },

    /**
     * @public
     *
     * Removes all events listeners for given @eventName
     *
     * If event with given name not exists, then throws error
     *
     * @param eventName
     */
    destroy: function (eventName) {

        if (app.util.System.isNull(app.events.__applicationEvents[eventName])) {
            app.system.__throwError(app.system.__messages.APPLICATION_EVENT_NOT_EXIST, [eventName]);
        }

        app.events.__applicationEvents[eventName] = [];

    },


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
        app.debug('Invoke cordova.__initializeCordova with params', []);
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
        return this.register(languageName, languageFilePath);
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

        var promise = $.ajax({
            url: languageFilePath,
            type: 'GET'
        });

        promise.then(function (data) {

            app.message.__setTranslation(languageName, data);

            return data;

        });

        promise.catch(function (error) {

            if (error.status == 200) {
                app.message.__setTranslation(languageName, error.responseText);
            } else {
                app.message.__messages[languageName] = {};
                app.system.__throwWarn(app.system.__messages.TRANSLATION_LOAD_WARN, [languageName, error.status]);
            }

            return error;

        });

        return promise;

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
    get: function (messageName, arrayOrMapParams) {

        var message = app.message.__messages[app.config.lang][messageName];
        if(!message){
            app.system.__throwWarn(app.system.__messages.TRANSLATION_MESSAGE_NOT_FOUND, [messageName])
        }

        if(arrayOrMapParams && message){
            message = app.message.__bindParams(message, arrayOrMapParams);
        }

        return message || messageName;
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

        //$(document).ready(function () {

        $('[' + app.__attributes.TRANSLATION + ']').each(function () {

            var messageName = $(this).attr(app.__attributes.TRANSLATION);

            if(!app.message.__messages[app.config.lang][messageName]){
                app.system.__throwWarn(app.system.__messages.TRANSLATION_MESSAGE_NOT_FOUND, [messageName])
            }

            $(this).removeAttr(app.__attributes.TRANSLATION);
            $(this).attr('translation', messageName);

            $(this).html(app.message.__messages[app.config.lang][messageName] || messageName);

        });

        //});

    },

    /**
     * @private
     *
     * Replaces all occurences of translation keys to translations
     * in template html
     * @param templateHtml
     */
    __replaceTemplateKeys: function (templateHtml) {

        for (var messageName in app.message.__messages[app.config.lang]) {

            templateHtml = templateHtml.split('>' + messageName + '<').join('>' + app.message.__messages[app.config.lang][messageName] + '<');

        }

        return templateHtml;
    },

    __bindParams: function (string, objectOrArrayParams) {

        if(!string){
            return '';
        }

        if(string.indexOf('{') == -1 || !objectOrArrayParams){
            return string;
        }

        if (objectOrArrayParams instanceof Array) {

            for (var i = 0; i < objectOrArrayParams.length; i++) {
                string = string.replace('{' + i + '}', objectOrArrayParams[i])
            }

        } else {

            for (var paramName in objectOrArrayParams) {
                string = string.replace('{' + paramName + '}', objectOrArrayParams[paramName]);
            }

        }

        return string;

    },

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
        app.debug('Invoke component.register with params', []);


        //Setting type of module
        componentObject.__type = 'COMPONENT';

        //Setting ready of module
        componentObject.__rendered = false;

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

        componentObject.rootSelector = function(){

            var componentSelector = $('component[name="' + componentObject.__lowerCaseName + '"]');

            if(componentSelector && componentSelector.length == 1){
              return componentSelector;
            }else {
              return $('[component-name="'+componentObject.__name+'"]');
            }

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
            app.debug('Invoke componentObject.__render on {0} component with params', [componentObject.__name]);

            if(app.component[componentObject.__name] && app.component[componentObject.__name].__global == true && app.component[componentObject.__name].__globalRendered == true){
                app.debug('Component {0} is already globally rendered. Returning from _render...', [componentObject.__name]);
                return;
            }else if(app.component[componentObject.__name] && app.component[componentObject.__name].__global == true && app.component[componentObject.__name].__globalRendered == false){
                app.debug('Component {0} will be rendered globally', [componentObject.__name]);
                app.component[componentObject.__name].__globalRendered = true;
            }

            app.component[componentObject.__name] = $.extend(  {}, app.component.__dataArchive[componentObject.__name]);
            app.com[componentObject.__name] = app.component[componentObject.__name];

            app.com[componentObject.__name].__loadTemplate();

            if(!componentDataPassed){
                componentDataPassed = {};
            }

            app.debug('Binding component {0} template to DOM', [app.com[componentObject.__name].__name]);

            var componentSelector = $('component[name="' + app.com[componentObject.__name].__lowerCaseName + '"]');

            //Throws exception if component was declared in some module ex. controller, but is not declared in it's view
            if(componentSelector.length === 0){
                app.system.__throwError(app.system.__messages.COMPONENT_NOT_DECLARED_IN_VIEW, [componentObject.__name]);
            }

            app.debug('Reading component {0} inline params', [app.com[componentObject.__name].__name]);

            var inlineAttributes = componentSelector.attrs();
            componentDataPassed = $.extend(  componentDataPassed, inlineAttributes);

            componentSelector = app.component.__replaceComponent(componentObject.__name, componentSelector, app.com[componentObject.__name].__template);
            app.com[componentObject.__name].__componentSelector = componentSelector;

            //Binds spike events
            app.system.__bindEvents(componentSelector);

            //Translate DOM
            app.message.__translate();

            componentDataPassed = $.extend( componentDataPassed, app.router.__getCurrentView());

            //Setting ready of module
            app.com[componentObject.__name].__rendered = true;

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
            app.debug('Invoke componentObject.__createComponentViewPath with params', []);

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

            //Executing template function
            try {
                templateHtml = templateHtml();
            }catch (err){
                app.system.__throwError('Error occured when executing component {0} template {1}', [componentObject.__name, componentObject.__view]);
            }

            //Includes static templates
            templateHtml = app.system.__replacePlainTemplates(templateHtml);

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
        app.component.__dataArchive[componentObject.__name] = $.extend(  {}, componentObject);
        app.component[componentObject.__name] = $.extend(  {}, componentObject);

    },

    /**
     * @private
     *
     * Function replaces component selector with given template
     * and create component selector @component-name attribute into
     * root element of given template
     *
     * @param componentName
     * @param selector
     * @param templateHtml
     *
     */
    __replaceComponent: function (componentName, selector, templateHtml) {

        var rootElementPart = templateHtml.substring(0, templateHtml.indexOf('>'))
        rootElementPart += ' component-name="' + componentName + '" ';

        templateHtml = rootElementPart + templateHtml.substring(templateHtml.indexOf('>'), templateHtml.length);

        selector.replaceWith(templateHtml);

        return $('[component-name="'+componentName+'"]');

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
        app.debug('Invoke component.__initComponents with params', []);

        if(componentsArrayOrMap){

            if (componentsArrayOrMap instanceof Array) {

                $.each(componentsArrayOrMap, function (i, componentName) {

                    //Throws exception if component was declared in some view ex controller view, but is not defined
                    if(!app.component[componentName]){
                        app.system.__throwError(app.system.__messages.COMPONENT_NOT_DECLARED, [componentName]);
                    }

                    app.component[componentName].__render(null);

                });

            } else {

                $.each(componentsArrayOrMap, function (componentName, componentParams) {

                    //Throws exception if component was declared in some view ex controller view, but is not defined
                    if(!app.component[componentName]){
                        app.system.__throwError(app.system.__messages.COMPONENT_NOT_DECLARED, [componentName]);
                    }

                      if(componentParams.enabled === undefined) {
                        app.component[componentName].__render(componentParams);
                      }else if(componentParams.enabled == true){
                        app.component[componentName].__render(componentParams);
                      }else if(typeof componentParams.enabled === "function" && componentParams.enabled() == true){
                        app.component[componentName].__render(componentParams);
                      }

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
        app.debug('Invoke controller.register with params: {0}', [controllerName]);

        //Setting tyope of module
        controllerObject.__type = 'CONTROLLER';

        controllerObject.__rendered = false;

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

        //Setting @public scrollTop variable if not defined
        if (controllerObject.scrollTop == undefined || controllerObject.scrollTop == null) {
            controllerObject.scrollTop = true;
        }

        //Setting original name of module
        controllerObject.__name = controllerName;

        //Setting name starting from lower case , used with templates and directories names of controller
        controllerObject.__lowerCaseName = controllerName.substring(0, 1).toLowerCase() + controllerName.substring(1, controllerName.length);

        controllerObject.rootSelector = function(){
            return app.controller.__getView().children();
        }

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
            app.debug('Invoke controllerObject.__render with params', []);

            app.controller[controllerObject.__name] = $.extend(  {}, app.controller.__dataArchive[controllerObject.__name]);

            var __oldControllerName = app.ctx ? app.ctx.__name : null;

            app.ctx = app.controller[controllerObject.__name];

            app.ctx.__loadTemplate();

            app.currentController = controllerObject.__name;

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

            //Binds spike events
            app.system.__bindEvents(app.controller.__getView());

            app.component.__initComponents(app.ctx.components);

            app.modal.invalidateAll();

            //Setting ready of module
            app.controller[controllerObject.__name].__rendered = true;

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
            app.debug('Invoke controllerObject.__createControllerViewPath with params', []);

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

            //Executing template function
            try {
                templateHtml = templateHtml();
            } catch (err) {
                app.system.__throwError('Error occured when executing controller {0} template {1}', [controllerObject.__name, controllerObject.__view]);
            }

            //Includes static templates
            templateHtml = app.system.__replacePlainTemplates(templateHtml);

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
        app.controller.__dataArchive[controllerName] = $.extend(  {}, controllerObject);
        app.controller[controllerName] = $.extend(  {}, controllerObject);

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
        app.debug('Invoke modal.implement with params: {0}', [eventName]);

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

        app.debug('Invoke modal.register with params: {0}', [modalName]);

        //Setting tyope of module
        modalObject.__type = 'MODAL';

        modalObject.__rendered = false;

        //Setting self helper
        modalObject.self = function () {
            return app.modal[modalName];
        }

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
            app.debug('Invoke modalObject.__createModalViewPath with params:', []);

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

            //Executing template function
            try {
                templateHtml = templateHtml();
            } catch (err) {
                app.system.__throwError('Error occured when executing modal {0} template {1}', [modalObject.__name, modalObject.__view]);
            }

            //Includes static templates
            templateHtml = app.system.__replacePlainTemplates(templateHtml);

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
            app.debug('Invoke modalObject.__render with params', []);

            app.modal[modalObject.__name] = $.extend(  {}, app.modal.__dataArchive[modalObject.__name]);
            app.mCtx[modalObject.__name] = app.modal[modalObject.__name];

            app.mCtx[modalObject.__name].__loadTemplate();

            app.debug('Binding modal {0} template to DOM element with "modals" attribute ', [app.mCtx[modalObject.__name].__name]);

            app.mCtx[modalObject.__name].__wrapModal();

            app.component.__initComponents(app.mCtx[modalObject.__name].components);

            app.modal.__modalWrappers[modalObject.__name] = app.modal[modalObject.__name].__modalWrapperId;

            //Setting ready of module
            app.modal[modalObject.__name].__rendered = true;

            app.modal[modalObject.__name].__initData = modalPassedData;

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

            app.mCtx[modalObject.__name].rootSelector = function(){
                return app.mCtx[modalObject.__name].__getWrapperModalSelector();
            }

            //Binds spike events
            app.system.__bindEvents(modalSelector);

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
        modalObject.__getWrapperModalSelector = function (unsafe) {

            var wrapperSelectorChildrens = app.modal[modalObject.__name].__wrapperSelector().children();

            if(unsafe && wrapperSelectorChildrens.length !== 0) {
                return null;
            } else if (wrapperSelectorChildrens.length == 1) {
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
            app.modal.__onModalHideEvent(app.mCtx[modalObject.__name].__selfSelector(), app.mCtx[modalObject.__name], app.modal.__onModalHideEventDefault);

            var wrapperSelector = app.modal[modalObject.__name].__getWrapperModalSelector(true);

            if(wrapperSelector == null){
                return;
            }

            wrapperSelector = wrapperSelector.parent();

            setTimeout(function(){
                wrapperSelector.remove();
            }, app.config.__safeModalRemove);

        };

        modalObject.__createModalViewPath(modalObject);

        //Creating copy of modal object in @private __dataArchive and in modal[modalName] variable
        app.modal.__dataArchive[modalObject.__name] = $.extend(  {}, modalObject);
        app.modal[modalObject.__name] = $.extend(  {}, modalObject);


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

    if (partial.before && app.util.System.isFunction(partial.before)) {
      app.debug('Invokes partial  {0} before() function', [partial.__name]);
      var returningModel = partial.before(model);

      if (returningModel) {
        model = returningModel;
      }

    }

    app.partial[partial.__name] = $.extend( {}, app.partial.__dataArchive[partial.__name]);

    app.debug('Returning partial {0} template ', [partial.__name]);

    if (partial.after && app.util.System.isFunction(partial.after)) {
      app.debug('Invokes partial  {0} after() function', [partial.__name]);

      setTimeout(function(){
        partial.after(model, partial.rootSelector);
      }, 500);

    }

    return partial.__template($.extend( partial, model));
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

    if (partialObject.inherits) {
      // Apply extending from abstracts
      partialObject = app.abstract.__tryExtend(partialName, partialObject.inherits, partialObject);
    }

    app.log('Registering partial {0}', [partialName]);
    app.debug('Invoke partial.register with params: {0}', [partialName]);

    if (app.util.System.isNull(partialObject.replace)) {
      partialObject.replace = false;
    }

    partialObject.__replace = partialObject.replace;

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

      var __partialObject = $.extend( {}, app.partial.__dataArchive[partialObject.__name]);

      if (!selector) {
        app.system.__throwError(app.system.__messages.PARITAL_SELECTOR_NOT_DEFINED, [__partialObject.__name]);
      }

      __partialObject.rootSelector = selector;

      var partialModel = $.extend( __partialObject, model);

      if (__partialObject.before && app.util.System.isFunction(__partialObject.before)) {
        app.debug('Invokes partial  {0} before() function', [__partialObject.__name]);
        var returningModel = __partialObject.before(partialModel);

        if (returningModel && returningModel.__name == __partialObject.__name) {
          partialModel = returningModel;
        }

      }

      app.debug('Binding partial {0} template to passed selector {1} ', [__partialObject.__name, selector]);

      var renderedTemplate = __partialObject.__template(partialModel);

      //Includes static templates
      renderedTemplate = app.system.__replacePlainTemplates(renderedTemplate);

      if (app.config.replaceLangKeys) {
        renderedTemplate = app.message.__replaceTemplateKeys(renderedTemplate);
      }

      if (__partialObject.__replace) {
        selector = app.partial.__replacePartial(selector, renderedTemplate);
      } else {
        selector.html(renderedTemplate);
      }

      if (__partialObject.after && app.util.System.isFunction(__partialObject.after)) {
        app.debug('Invokes partial  {0} after() function', [__partialObject.__name]);
        __partialObject.after(partialModel, __partialObject.rootSelector);
      }

      //Binds spike events
      app.system.__bindEvents(selector);

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
      app.debug('Invoke partialObject.__createPartialViewPath with params', []);

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
    app.partial.__dataArchive[partialName] = $.extend( {}, partialObject);
    app.partial[partialName] = $.extend( {}, partialObject);

  },

  /**
   * @private
   *
   * Function replaces partial selector with given template
   * and migrate partial selector @id attribute into
   * root element of given template
   *
   * @param selector
   * @param templateHtml
   *
   */
  __replacePartial: function (selector, templateHtml) {

    var selectorId = selector.attr('id');
    var selectorClasses = selector.attr('class');

    var rootElementPart = templateHtml.substring(0, templateHtml.indexOf('>'))

    if(selectorId){
      rootElementPart += ' id="' + selectorId + '" ';
    }

    if(selectorClasses && selectorClasses.length > 0){

      if(rootElementPart.indexOf('class="') > -1){
        rootElementPart = rootElementPart.replace('class="', 'class=" '+selectorClasses+' ')+' ';
      }else{
        rootElementPart += ' class=" ' + selectorClasses + ' " ';
      }

    }

    templateHtml = rootElementPart + templateHtml.substring(templateHtml.indexOf('>'), templateHtml.length);

    selector.replaceWith(templateHtml);

    app.system.__clearSelectorInCache(selectorId);

    return $('#' + selectorId);

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
        abstractObject.__type = 'ABSTRACT';

        if(abstractObject.inherits){
            // Apply extending from abstracts
            abstractObject = app.abstract.__tryExtend(abstractName, abstractObject.inherits, abstractObject);
        }

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
        return $.extend( {}, app.abstract[extendObjectName], extendedObject);
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

      app.global[globalName].__value = globalInitialValue;

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

    if (app.util[utilName]) {
      app.system.__throwError(app.system.__messages.UTIL_ALREADY_REGISTRED, [utilName]);
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
    bindStringParams: function (string, objectOrArrayParams, noStringify) {

      if (!string) {
        return '';
      }

      if (string.indexOf('{') == -1 || !objectOrArrayParams) {
        return string;
      }

      try {

        if (objectOrArrayParams instanceof Array) {

          for (var i = 0; i < objectOrArrayParams.length; i++) {
            string = string.replace('{' + i + '}', noStringify ? objectOrArrayParams[i] : JSON.stringify(objectOrArrayParams[i]))
          }

        } else {

          for (var paramName in objectOrArrayParams) {
            string = string.replace('{' + paramName + '}', noStringify ? objectOrArrayParams[paramName] : JSON.stringify(objectOrArrayParams[paramName]));
          }

        }

      } catch (err) {
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
     * Checks if given variable is an object
     * If null or undefined returns false
     *
     * @param object
     */
    isObject: function (object) {

      if (app.util.System.isNull(object)) {
        return false;
      }

      if (object.toString() == '[object Object]') {
        return true;
      }

      return false;

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
        } else {
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
     * Removes binded undefined pathParams from given url
     *
     * @param url
     * @returns {string}
     */
    removeUndefinedPathParams: function(url){
      return url.split('/undefined').join('').split('/null').join('');
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
    },

    createCookie: function (name, value, days) {
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
      }
      else var expires = "";

      document.cookie = name + "=" + value + expires + "; path=/";
    },

    readCookie: function (name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    },

    eraseCookie: function (name) {
      app.util.System.createCookie(name, "", -1);
    },

    escapeQuotes: function (text) {

      try {
        text = text.replace(/'/g, "\\'");
      } catch (err) {
        app.warn('Could not escape single quotes in string: ' + text);
      }

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
 * @private {__getDelete}
 * @private {__postPut}
 *
 * @private {__execByUrl}
 * @private {__execByName}
 *
 * @fields
 * @public {__cacheData}
 * @public {spinnerExclude}
 *
 */
app.rest = {

    /**
     * @private
     *
     * Storage for @rest cache
     *
     */
    __cacheData: {},

    /**
     * @public
     * List of URLs where spinner functions won't fire
     *
     */
    spinnerExclude: [],

    /**
     * @public
     * Storage for interceptors functions
     */
    __interceptors: {},

    /**
     * @public
     * Storage for global interceptors functions
     */
    __globalInterceptors: {},

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
    interceptor: function (interceptorName, interceptorFunction, isGlobal) {

        if (isGlobal) {

            //Check if interceptor exists, then throws error
            if (app.rest.__globalInterceptors[interceptorName]) {
                app.system.__throwError(app.system.__messages.INTERCEPTOR_ALREADY_REGISTRED, [interceptorName]);
            }

            //Saves interceptor function to @__interceptors
            app.rest.__globalInterceptors[interceptorName] = interceptorFunction;

        } else {

            //Check if interceptor exists, then throws error
            if (app.rest.__interceptors[interceptorName]) {
                app.system.__throwError(app.system.__messages.INTERCEPTOR_ALREADY_REGISTRED, [interceptorName]);
            }

            //Saves interceptor function to @__interceptors
            app.rest.__interceptors[interceptorName] = interceptorFunction;

        }

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
    __invokeInterceptors: function (requestData, response, promise, interceptors) {

        if (interceptors) {

            for (var i = 0; i < interceptors.length; i++) {

                if (!app.rest.__interceptors[interceptors[i]]) {
                    app.system.__throwWarn(app.system.__messages.INTERCEPTOR_NOT_EXISTS, [interceptors[i]]);
                } else {
                    app.rest.__interceptors[interceptors[i]](response, promise, requestData);
                }

            }

        }

        for (var interceptorName in app.rest.__globalInterceptors) {
            app.rest.__globalInterceptors[interceptorName](response, promise, requestData);
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
    spinnerShow: function (requestUrl) {
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
    spinnerHide: function (requestUrl) {
    },

    /**
     * @public
     *
     * Function checks if spinner functions should executing
     *
     * @param requestUrl
     *
     */
    isSpinnerExcluded: function (requestUrl) {

        for (var i = 0; i < app.rest.spinnerExclude.length; i++) {
            if (requestUrl == app.rest.spinnerExclude[i]) {
                return true;
            }
        }

        return false;

    },

    /**
     * @private
     *
     * Function creates and returns basic promise object
     *
     * @param data
     *
     */
    __createCachedPromise: function (data, interceptors) {

        var promise = {
            result: data,

            then: function (callback) {

                if (promise.result) {
                    data = promise.result;
                }

                var _result = callback(data);

                if (_result) {
                    promise.result = _result;
                }

                return promise;

            },
            catch: function () {
                return promise;
            }
        }

        app.rest.__invokeInterceptors({}, data, promise, interceptors);

        return promise;


    },

    /**
     * @public
     *
     * Function executes GET request
     * Function return promise with execution params for passed @param urlOrCachedData
     *
     * @param urlOrCachedData
     * @param propertiesObject -- optional {headers, pathParams, urlParams, interceptors}
     *
     */
    get: function (urlOrCachedData, propertiesObject) {

        propertiesObject = propertiesObject || {};

        if (typeof urlOrCachedData == 'string') {
            return app.rest.__getDelete(urlOrCachedData, 'GET', propertiesObject.pathParams, propertiesObject.headers, propertiesObject.urlParams, propertiesObject.interceptors || []);
        } else {
            return this.__createCachedPromise(urlOrCachedData, propertiesObject.interceptors || []);
        }

    },

    /**
     * @public
     *
     * Function executes DELETE request
     * Function return promise with execution params for passed @param urlOrCachedData
     *
     * @param urlOrCachedData
     * @param propertiesObject -- optional {headers, pathParams, urlParams, interceptors}
     *
     */
    delete: function (urlOrCachedData, propertiesObject) {

        propertiesObject = propertiesObject || {};

        if (typeof urlOrCachedData == 'string') {
            return app.rest.__getDelete(urlOrCachedData, 'DELETE', propertiesObject.pathParams, propertiesObject.headers, propertiesObject.urlParams, propertiesObject.interceptors || []);
        } else {
            return this.__createCachedPromise(urlOrCachedData, propertiesObject.interceptors || []);
        }


    },

    /**
     * @public
     *
     * Function executes PUT request
     * Function return promise with execution params for passed @param urlOrCachedData
     *
     * @param urlOrCachedData
     * @param propertiesObject -- optional {headers, pathParams, urlParams, interceptors}
     *
     */
    update: function (urlOrCachedData, request, propertiesObject) {

        propertiesObject = propertiesObject || {};

        if (typeof urlOrCachedData == 'string') {
            return app.rest.__postPut(urlOrCachedData, 'PUT', request, propertiesObject.pathParams, propertiesObject.headers, propertiesObject.urlParams, propertiesObject.interceptors || []);
        } else {
            return this.__createCachedPromise(urlOrCachedData, propertiesObject.interceptors || []);
        }

    },

  /**
   * @public
   *
   * Substitute method for @update
   *
   * @param urlOrCachedData
   * @param propertiesObject -- optional {headers, pathParams, urlParams, interceptors}
   *
   */
    put: function (urlOrCachedData, request, propertiesObject) {
      return app.rest.update(urlOrCachedData, request, propertiesObject);
    },


    /**
     * @public
     *
     * Function executes POST request
     * Function return promise with execution params for passed @param urlOrCachedData
     *
     * @param urlOrCachedData
     * @param propertiesObject -- optional {headers, pathParams, urlParams, interceptors}
     *
     */
    post: function (urlOrCachedData, request, propertiesObject) {

        propertiesObject = propertiesObject || {};

        if (typeof urlOrCachedData == 'string') {
            return app.rest.__postPut(urlOrCachedData, 'POST', request, propertiesObject.pathParams, propertiesObject.headers, propertiesObject.urlParams, propertiesObject.interceptors || []);
        } else {
            return this.__createCachedPromise(urlOrCachedData, propertiesObject.interceptors || []);
        }

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


        var preparedUrl = url;

          if (pathParams !== undefined && pathParams !== null) {
            preparedUrl = app.util.System.preparePathDottedParams(url, pathParams);

            if(preparedUrl.indexOf('/undefined') > -1 || preparedUrl.indexOf('/null') > -1){
              app.system.__throwWarn(app.system.__messages.REST_API_NULL_PATHPARAM, [preparedUrl]);
              preparedUrl = app.util.System.removeUndefinedPathParams(preparedUrl);
            }

          }

        if (urlParams !== undefined && urlParams !== null) {
            preparedUrl = app.util.System.prepareUrlParams(preparedUrl, urlParams);
        }

        var dataType = "json";
        var contentType = "application/json; charset=utf-8";


        var promiseObj = {
            url: preparedUrl,
            type: method,
            beforeSend: function () {

                if (!app.rest.isSpinnerExcluded(url)) {
                    app.rest.spinnerShow(url);
                }

            },
            complete: function () {

                if (!app.rest.isSpinnerExcluded(url)) {
                    app.rest.spinnerHide(url);
                }

            },

        };


        if (!headers) {
            headers = {}
        }

        if (headers['Content-Type'] !== null && headers['Content-Type'] !== undefined) {
            contentType = headers['Content-Type'];
        }

        if (headers['Data-Type'] !== null && headers['Data-Type'] !== undefined) {
            dataType = headers['Data-Type'];
            headers['Data-Type'] = undefined;
        }


        if (headers['Content-Type'] !== null) {
            promiseObj.contentType = headers['Content-Type'] || contentType;
        }

        if (headers['Data-Type'] !== null) {
            promiseObj.dataType = headers['Data-Type'] || dataType;
            headers['Data-Type'] = undefined;
        }

        var newHeaders = {};
        for (var prop in headers) {
            if (headers[prop] !== undefined && headers[prop] !== null) {
                newHeaders[prop] = headers[prop];
            }
        }

        headers = newHeaders;


        promiseObj.headers = headers;


        var promise = $.ajax(promiseObj);

        var requestData = {url: url, method: method, pathParams: pathParams, urlParams: urlParams, headers: headers};

        promise.then(function (result) {
            app.rest.__invokeInterceptors(requestData, result, promise, interceptors);
        });

        promise.catch(function (error) {
            app.rest.__invokeInterceptors(requestData, error, promise, interceptors);
        });

        return promise;


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


        var jsonData = JSON.stringify(request);

        var preparedUrl = url;

        if (pathParams !== undefined && pathParams !== null) {
            preparedUrl = app.util.System.preparePathDottedParams(url, pathParams);

            if(preparedUrl.indexOf('/undefined') > -1 || preparedUrl.indexOf('/null') > -1){
                app.system.__throwWarn(app.system.__messages.REST_API_NULL_PATHPARAM, [preparedUrl]);
                preparedUrl = app.util.System.removeUndefinedPathParams(preparedUrl);
            }

        }

        if (urlParams !== undefined && urlParams !== null) {
            preparedUrl = app.util.System.prepareUrlParams(preparedUrl, urlParams);
        }

        var dataType = "json";
        var contentType = "application/json; charset=utf-8";

        var promiseObj = {
            url: preparedUrl,
            data: jsonData,
            type: method,
            beforeSend: function () {

                if (!app.rest.isSpinnerExcluded(url)) {
                    app.rest.spinnerShow(url);
                }

            },
            complete: function () {

                if (!app.rest.isSpinnerExcluded(url)) {
                    app.rest.spinnerHide(url);
                }

            }
        };

        if (!headers) {
            headers = {}
        }

        if (headers['Content-Type'] !== null && headers['Content-Type'] !== undefined) {
            contentType = headers['Content-Type'];
        }

        if (headers['Data-Type'] !== null && headers['Data-Type'] !== undefined) {
            dataType = headers['Data-Type'];
            headers['Data-Type'] = undefined;
        }


        if (headers['Content-Type'] !== null) {
            promiseObj.contentType = headers['Content-Type'] || contentType;
        }

        if (headers['Data-Type'] !== null) {
            promiseObj.dataType = headers['Data-Type'] || dataType;
            headers['Data-Type'] = undefined;
        }

        var newHeaders = {};
        for (var prop in headers) {
            if (headers[prop] !== undefined && headers[prop] !== null) {
                newHeaders[prop] = headers[prop];
            }
        }

        headers = newHeaders;


        promiseObj.headers = headers;


        var promise = $.ajax(promiseObj);

        var requestData = {
            url: url,
            method: method,
            request: request,
            pathParams: pathParams,
            urlParams: urlParams,
            headers: headers
        };

        promise.then(function (result) {
            app.rest.__invokeInterceptors(requestData, result, promise, interceptors);
        });

        promise.catch(function (error) {
            app.rest.__invokeInterceptors(requestData, error, promise, interceptors);
        });

        return promise;

    },


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

  serializeObject: function (omitNumberParsingFields) {

    var formSelector = $(this);
    var serializedObject = {};

    var serializeField = function(){

      var value = $(this).val();
      var name = $(this).attr('name');

      if (value == 'on') {
        value = true;
      } else if (value == 'off') {
        value = false;
      }

      if(omitNumberParsingFields && omitNumberParsingFields.indexOf(name) > -1){
        serializedObject[name] = value;
      }else{
        serializedObject[name] = app.util.System.tryParseNumber(value);
      }

    };

    formSelector.find('input[name]').each(serializeField);
    formSelector.find('select[name]').each(serializeField);
    formSelector.find('textarea[name]').each(serializeField);

    formSelector.find('input[type="checkbox"][name]').each(function () {

      var name = $(this).attr('name');
      serializedObject[name] = $(this).is(':checked');

    });

    return serializedObject;

  },

  serializeObjectWithoutNumberParsing: function () {

    var formSelector = $(this);
    var serializedObject = {};

    var serializeField = function(){

      var value = $(this).val();
      var name = $(this).attr('name');

      if (value == 'on') {
        value = true;
      } else if (value == 'off') {
        value = false;
      }

      serializedObject[name] = value;

    };

    formSelector.find('input[name]').each(serializeField);
    formSelector.find('select[name]').each(serializeField);
    formSelector.find('textarea[name]').each(serializeField);

    formSelector.find('input[type="checkbox"][name]').each(function () {

      var name = $(this).attr('name');
      serializedObject[name] = $(this).is(':checked');

    });

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

function _spike_jquery_set_setFunction(selector, value) {

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

};

function _spike_jquery_set_populateFunction(selector, data, prefix, selectors) {

    if (!prefix) {
        prefix = '';
    }

    if (!selectors) {
        selectors = Array.prototype.slice.call(selector[0].querySelectorAll('[id]')).concat(Array.prototype.slice.call(selector[0].querySelectorAll('['+app.__attributes.SET_VAL+']')));
    }

    Object.keys(data).map(function (itemName) {

        var reducedSelectors = [];
        for (var i = 0; i < selectors.length; i++) {

            if (selectors[i].id == prefix + itemName || $(selectors[i]).attr(app.__attributes.SET_VAL) == prefix + itemName) {
                $(selectors[i]).set(data[itemName]);
            } else {
                reducedSelectors.push(selectors[i]);
            }
        }

        if (app.util.System.isObject(data[itemName])) {
            _spike_jquery_set_populateFunction(selector, data[itemName], itemName + '.', reducedSelectors);
        }

    });

};

jQuery.fn.extend({

    set: function (_value, _filter) {

        if (_value === undefined || _value == null) {
            return;
        }

        if (_filter && _value !== undefined && _value !== null) {
            _value = _filter(_value);
        }

        if (app.util.System.isObject(_value)) {
            _spike_jquery_set_populateFunction($(this), _value);
        } else {
            _spike_jquery_set_setFunction($(this), _value);
        }


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

                attributesMap[app.util.System.toCamelCase(this.name)] = app.util.System.tryParseNumber(this.value);
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
            modalObject.hide();
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