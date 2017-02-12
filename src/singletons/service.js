/**
 * @public
 *
 * Service module
 * Module designed for usage as singleton during application lifecycle.
 * Can be used in any of another components
 *
 * Only one active instance in time is available
 *
 * @functions
 * @public  {add}
 * @public  {register}
 *
 */
app.service = {

    /**
     * @public
     *
     * Substitute method for register
     *
     * @param serviceName
     * @param serviceObject
     */
    add: function (serviceName, serviceObjectOrExtending, serviceObject) {
        this.register(serviceName, serviceObjectOrExtending, serviceObject);
    },


    /**
     * @public
     *
     * Registering new service in application
     * Creates service object
     *
     * @param serviceName
     * @param serviceObject
     */
    register: function (serviceName, serviceObjectOrExtending, serviceObject) {

        // Filter if name is invalid (can break application)
        app.system.__filterRestrictedNames(serviceName);

        // Apply extending from abstracts
        serviceObject = app.abstract.__tryExtend(serviceName, serviceObjectOrExtending, serviceObject);

        app.service[serviceName] = serviceObject;

        console.log(app.service);

    }

};