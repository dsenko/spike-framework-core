/**
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
