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

            if(componentSelector.length === 0){
                componentSelector = $('[component-name="' + app.com[componentObject.__name].__name + '"]');
            }

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
            app.system.__bindLinks(componentSelector);

            componentDataPassed = $.extend( componentDataPassed, app.router.__getCurrentView());

            //Setting ready of module
            app.com[componentObject.__name].__rendered = true;

            app.component.__initComponents(app.com[componentObject.__name].components);
            app.debug('Invoke component {0} init() function', [componentObject.__name]);

            app.com[componentObject.__name].init(componentDataPassed);


        };


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
         //   try {
                templateHtml = templateHtml();
           // }catch (err){
          //      app.system.__throwError('Error occured when executing component {0} template {1}', [componentObject.__name, componentObject.__view], err);
          //  }

            if(app.config.usePlainTemplates){
              //Includes static templates
              templateHtml = app.system.__replacePlainTemplates(templateHtml);
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
     * @public
     *
     * Function reloads given component
     * Optionally can pass additional params
     *
     */
    reloadComponent: function(component, componentData){

        var componentMap = {};
        componentMap[component.__name] = componentData || {};

        app.component.__initComponents(componentMap);

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
