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
     * @param abstractFunction
     */
    add: function (abstractName, abstractFunction) {
        this.register(abstractName, abstractFunction);
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
    register: function (abstractName, abstractFunction) {

        //Checks if name is not restricted
        app.system.__filterRestrictedNames(abstractName);

        if(app.abstract[abstractName]){
            app.system.__throwError(app.system.__messages.ABSTRACT_ALREADY_REGISTRED,[abstractName]);
        }

        app.abstract[abstractName] = {
            abstractFunction: abstractFunction,
            __name: abstractName
        }
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
    __tryExtend: function(extendObjectName, abstractObjectsList, extendedObject){

        app.debug('Invoking app.abstract.__tryExtend with params {0}', [extendObjectName]);

        // If extending abstracts defined, then extend @extendedObject and returns it
        if($.isArray(abstractObjectsList)){

            app.log('Extending {0} named {1} ', [extendedObject.__type, extendObjectName, app.abstract.__getNames(abstractObjectsList)]);

            for(var i = 0; i < abstractObjectsList.length; i++){

                if(abstractObjectsList[i]){
                    extendedObject = app.abstract.__extend(abstractObjectsList[i].__name, extendedObject);
                }else{
                    app.system.__throwWarn(app.system.__messages.INHERIT_ABSTRACT_NOT_EXIST, [extendObjectName]);
                }


            }

        }

        return extendedObject;

    },

    /**
     * @private
     *
     * Converts abstractObjectList into list of abstract names
     *
     * @param abstractObjectsList
     */
    __getNames: function(abstractObjectsList){

        var names = [];

        $.each(abstractObjectsList, function(i, abstractObject){

            if(abstractObject){
                names.push(abstractObject.__name);
            }

        });

        return names;

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
        return app.abstract[extendObjectName].abstractFunction(extendedObject);
    }

};