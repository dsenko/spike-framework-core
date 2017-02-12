/**
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

};