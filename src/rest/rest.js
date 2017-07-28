/**
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


};