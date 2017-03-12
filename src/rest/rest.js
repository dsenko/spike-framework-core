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

            // promise.__chains = [];
            //
            // promise.chain = function(processFunction){
            //
            //     promise.__chains.push(processFunction);
            //
            //     return promise;
            //
            // }
            //
            // promise.__processChains = function(){
            //
            //     for(var i = 0; i < promise.__chains.length; i++){
            //         promise.result = promise.__chains[i](promise.result);
            //     }
            //
            // }

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


};