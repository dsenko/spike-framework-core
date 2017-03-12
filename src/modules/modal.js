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
            app.debug('Invoke modalObject.__render with params: {0}', [modalPassedData]);

            app.modal[modalObject.__name] = app.util.System.extend( {}, app.modal.__dataArchive[modalObject.__name]);
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
        app.modal.__dataArchive[modalObject.__name] = app.util.System.extend( {}, modalObject);
        app.modal[modalObject.__name] = app.util.System.extend( {}, modalObject);


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

};