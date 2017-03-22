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

        //Setting @public scrollTop variable if not defined
        if (!controllerObject.scrollTop) {
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
            app.debug('Invoke controllerObject.__render with params: {0}', [controllerPassedData]);

            app.controller[controllerObject.__name] = $.extend(true,  {}, app.controller.__dataArchive[controllerObject.__name]);

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
        app.controller.__dataArchive[controllerName] = $.extend(true,  {}, controllerObject);
        app.controller[controllerName] = $.extend(true,  {}, controllerObject);

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

