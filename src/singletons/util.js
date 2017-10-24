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

                if(obj.indexOf('e') > -1 || obj.indexOf('E') > -1){
                    return obj;
                }

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
        removeUndefinedPathParams: function (url) {
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
              text = text.replace(/"/g, "&quot;").replace(/'/g, "&quot;");
            } catch (err) {
                app.warn('Could not escape single quotes in string: ' + text);
            }

            return text;

        }


    },

    /**
     * @public
     *
     * Function to extending and overriding
     *
     */
    extend: function (utilObject) {

        for (var prop in utilObject) {
            this[prop] = utilObject[prop];
        }

    }

};
