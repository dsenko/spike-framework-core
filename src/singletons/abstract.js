/**
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
    __tryExtend: function(extendObjectName, abstractNamesOrModuleObject, extendedObject){

        // If extending abstracts defined, then extend @extendedObject and returns it
        if($.isArray(abstractNamesOrModuleObject)){

            app.log('Extending {0} named {1} with {2} abstracts', [extendedObject.__type, extendObjectName, abstractNamesOrModuleObject]);

            $.each(abstractNamesOrModuleObject, function(abstractName){

                if(app.abstract[abstractName]){
                    extendedObject = app.abstract.__extend(abstractName, extendedObject);
                }

            });

            return extendedObject;
        }

        return abstractNamesOrModuleObject;

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
        return $.extend(app.abstract[extendObjectName], extendedObject);
    }

};