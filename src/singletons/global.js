/**
 * @public
 *
 * Global module
 * Module designed for as globals storage instead of window global during application lifecycle.
 * Can be used anywhere.
 *
 * Only one active instance in time is available (singleton)
 *
 * @functions
 * @public  {add}
 * @public  {register}
 *
 * @fields
 * @private {__globals}
 *
 */
app.global = {

    /**
     * @public
     *
     * Substitute method for register
     *
     * @param controllerName
     * @param controllerObject
     */
    add: function(globalName, globalInitialValue){
        this.register(globalName, globalInitialValue);
    },

    /**
     * @public
     *
     * Registering new global variable in application
     *
     * @param globalName
     * @param globalInitialValue
     */
    register: function(globalName, globalInitialValue){

        // Filter if name is invalid (can break application)
        app.system.__filterRestrictedNames(globalName);

        /**
         * New global variable object
         *
         * @functions
         * @public  {get}
         * @public  {set}
         *
         * @fields
         * @private {__value}
         *
         */
        app.global[globalName] = {

            /**
             * @private
             * Variable to store global variable value
             */
            __value: null,

            /**
             * @public
             *
             * Function to retrieve global variable value
             * Optionally @param index can be passed when global variable value is an @Array object
             * then function returns value on passed index in this array
             *
             * @param index --optional
             */
            get: function(index){
                if(index){
                    return this.__value[index];
                }else{
                    return this.__value;
                }
            },

            /**
             * @public
             *
             * Function to setting global variable value
             *
             * Optionally @param index can be passed when global variable value is an @Array object
             * then function sets value on passed index in this array.
             *
             * If @param index is not passed and global variable value is an @Array object
             * then value is setted typical way
             *
             * For adding items to @Array object then use @push function instead
             *
             * @param index --optional
             */
            set: function(newGlobalValue, index){

                if(this.__value && index){
                    this.__value[index] = newGlobalValue;
                } else {
                    this.__value = newGlobalValue;
                }

            },

            /**
             * @public
             *
             * Function to setting global variable value for @Array object
             *
             * If global variable value is an @Array object
             * then function push new value into this array
             *
             * If global variable value is not @Array object
             * then value is not setted
             *
             * @param newGlobalValueArrayItem
             */
            push: function(newGlobalValueArrayItem){

                if(this.__value && this.__value instanceof Array){
                    this.__value.push(newGlobalValueArrayItem);
                }

            }

        };

        this.__value = value;

    },

    /**
     * @public
     *
     * Registering list of global objects variables in application
     *
     * @param globalObjectsList {
     *  @fields
     *  @public name - name of the global variable
     *  @public initial - initial value of the global variable
     * }
     */
    list: function(globalObjectsList){

        $.each(globalObjectsList, function(i, __global){
            app.global.add(__global.name, __global.initial);
        });

    }


};