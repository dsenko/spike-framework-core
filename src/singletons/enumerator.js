/**
 * @public
 *
 * Enumerator module
 * Module designed for usage as singleton during application lifecycle.
 * Can be used in any other modules.
 *
 * Only one active instance in time is available
 *
 * @functions
 * @public  {add}
 * @public  {register}
 *
 */
app.enumerator = {

    /**
     * @public
     *
     * Substitute method for register
     *
     * @param enumeratorName
     * @param enumeratorObject
     */
    add: function(enumeratorName, enumeratorObject){
        this.register(enumeratorName, enumeratorObject);
    },

    /**
     * @public
     *
     * Registering new enumerators in application
     *
     * @param enumeratorName
     * @param enumeratorObject
     */
    register: function(enumeratorName, enumeratorObject){

        if(app.enumerator[enumeratorName]){
            app.system.__throwError(app.system.__messages.ENUMERATOR_ALREADY_REGISTRED,[enumeratorName]);
        }

        app.enumerator[enumeratorName] = enumeratorObject;
    }

};