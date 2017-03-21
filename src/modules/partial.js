/**
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

    if (partialObject.inherits) {
      // Apply extending from abstracts
      partialObject = app.abstract.__tryExtend(partialName, partialObject.inherits, partialObject);
    }

    app.log('Registering partial {0}', [partialName]);
    app.debug('Invoke partial.register with params: {0} {1}', [partialName, partialObject]);

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

      var __partialObject = $.extend(true, {}, app.partial.__dataArchive[partialObject.__name]);

      if (!selector) {
        app.system.__throwError(app.system.__messages.PARITAL_SELECTOR_NOT_DEFINED, [__partialObject.__name]);
      }

      __partialObject.rootSelector = selector;

      var partialModel = $.extend(true, __partialObject, model);

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

    var rootElementPart = templateHtml.substring(0, templateHtml.indexOf('>'))
    rootElementPart += ' id="' + selectorId + '" ';

    templateHtml = rootElementPart + templateHtml.substring(templateHtml.indexOf('>'), templateHtml.length);

    selector.replaceWith(templateHtml);

    app.system.__clearSelectorInCache(selectorId);

    return $('#' + selectorId);

  }


};