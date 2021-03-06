/**
 * @public
 *
 * Events module
 * Module designed for implementing Cordova default events
 *
 * Allowed events overriding :
 *
 * render
 * offline
 * online
 * dom
 * back
 * ready
 *
 * You can add own custom events to use by your application li
 *
 * @functions
 * @public {domEvents}
 * @public {onOnline}
 * @public {onOffline}
 * @public {onBack}
 * @public {onDeviceReady}
 * @public {onReady}
 * @public {extend}
 *
 * @private {__functionName}
 * @private {__extend}
 *
 */
app.events = {


    /**
     * @public
     * @toImplement
     *
     * Additional @event function executed when Spike
     * controller or modal is rendered
     *
     */
    onRender: function () {
    },


    /**
     * @public
     * @toImplement
     *
     * Additional @event function executed when Cordova is initializing
     * Can contain any global events registred via @window.addEventListener
     * or @document.addEventListener
     *
     */
    domEvents: function () {
    },


    /**
     * @public
     * @toImplement
     *
     * Additional @event function executed when application is in @online state
     *
     */
    onOnline: function () {
    },

    /**
     * @public
     * @toImplement
     *
     * Additional @event function executed when application is in @offline state
     *
     */
    onOffline: function () {
    },

    /**
     * @public
     * @toImplement
     *
     * Additional @event function executed when @back event happens
     *
     * If there aren't rendered modals and current controller has not
     * overriden @onBack function then application invokes this function
     *
     * More info in @app.__cordova.__onBack function
     *
     */
    onBack: function () {
    },

    /**
     * @public
     * @toImplement
     *
     * Additional @event function executed when Cordova application is ready (device)
     *
     */
    onDeviceReady: function () {
    },

    /**
     * @public
     * @toImplement
     *
     * Additional @event function executed when Spike application is ready
     * Invokes before rendering @app.config.mainController
     *
     */
    onReady: function () {
    },


    /**
     * @public
     *
     * Function to extending and overriding default events with new implementations defined by user
     *
     * @param eventsMap
     *
     */
    extend: function (eventsMap) {

        $.each(eventsMap, function (eventName, eventCallback) {
            app.events.__extend(eventName, eventCallback);
        })

    },

    /**
     * @private
     *
     * Returns mapped event name to function name
     *
     * @param eventName
     */
    __functionName: function (eventName) {

        switch (eventName) {
            case 'render':
                return 'onRender';
            case 'offline':
                return 'onOffline';
            case 'online':
                return 'onOnline';
            case 'dom':
                return 'domEvents';
            case 'back':
                return 'onBack';
            case 'ready':
                return 'onReady';
            default:
                return eventName;
        }

    },

    /**
     * @private
     *
     * Function to saving new event implementation
     *
     * @param eventName
     * @param eventCallback
     */
    __extend: function (eventName, eventCallback) {

        app.events[app.events.__functionName(eventName)] = eventCallback;

    },


    /**
     * @private
     *
     * Storage for all events created by developer
     *
     */
    __applicationEvents: {},

    /**
     * @public
     *
     * Wrapper for @register function
     *
     * @param eventName
     */
    add: function (eventName) {
        app.events.register(eventName);
    },

    /**
     * @public
     *
     * Registers new event with given name.
     * Events should be registred manually to avoid events spagetti
     *
     * If event with given name exists, then throws error
     *
     * @param eventName
     */
    register: function (eventName) {

        if (!app.util.System.isNull(app.events.__applicationEvents[eventName])) {
            app.system.__throwError(app.system.__messages.APPLICATION_EVENT_ALREADY_EXIST, [eventName]);
        }

        app.events.__applicationEvents[eventName] = [];

    },

    /**
     * @public
     *
     * Broadcast event with given name and given data across
     * all registred and @on declared events
     *
     * If event with given name not exists, then throws error
     *
     * @param eventName
     * @param eventData
     */
    broadcast: function (eventName, eventData) {

        if (app.util.System.isNull(app.events.__applicationEvents[eventName])) {
            app.system.__throwErrorAndWarn(app.system.__messages.APPLICATION_EVENT_NOT_EXIST, [eventName]);
        }

        for(var i = 0; i < app.events.__applicationEvents[eventName].length; i++){
            app.events.__applicationEvents[eventName][i](eventData);
        }

    },

    /**
     * @public
     *
     * Catches all @broadcasted events with given name and executes
     * given event callback with @eventData as argument
     *
     * Checks if event listener is already reigstred, then
     * prevents duplicating it.
     *
     * If event with given name not exists, then throws error
     *
     * @param eventName
     * @param eventData
     */
    listen: function (eventName, eventCallback) {

        if (app.util.System.isNull(app.events.__applicationEvents[eventName])) {
            app.system.__throwError(app.system.__messages.APPLICATION_EVENT_NOT_EXIST, [eventName]);
        }

        if (app.util.System.isNull(eventCallback)) {
            app.system.__throwError(app.system.__messages.APPLICATION_EVENT_CALLBACK_NULL, [eventName]);
        }

        var isAlreadyRegistredListener = false;

        for(var i = 0; i < app.events.__applicationEvents[eventName].length; i++){

            if(app.events.__applicationEvents[eventName][i].toString() == eventCallback.toString()){
                isAlreadyRegistredListener = true;
            }

        }

        if(isAlreadyRegistredListener == false){
            app.events.__applicationEvents[eventName].push(eventCallback);
        }

    },

    /**
     * @public
     *
     * Removes all events listeners for given @eventName
     *
     * If event with given name not exists, then throws error
     *
     * @param eventName
     */
    destroy: function (eventName) {

        if (app.util.System.isNull(app.events.__applicationEvents[eventName])) {
            app.system.__throwError(app.system.__messages.APPLICATION_EVENT_NOT_EXIST, [eventName]);
        }

        app.events.__applicationEvents[eventName] = [];

    },


};