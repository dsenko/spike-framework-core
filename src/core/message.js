/**
 * @public
 *
 * Message module
 * Module designed for usage as singleton during application lifecycle.
 * Can be used in any other modules.
 *
 * Only one active instance in time is available
 *
 * @functions
 * @public  {add}
 * @public  {register}
 * @public  {get}
 *
 * @private {__replace}
 *
 * @fields
 * @private __messages
 *
 */
app.message = {

    /**
     * @private
     * Information if translations has been downloaded
     */
    __waitingForTranslations: {},

    /**
     * @private
     * Storage for translation data
     */
    __messages: {},

    /**
     * @public
     *
     * Substitute method for register
     *
     * @param languageName
     * @param languageFilePath
     */
    add: function (languageName, languageFilePath) {
        this.register(languageName, languageFilePath);
    },

    /**
     * @public
     *
     * Registering new language translation from hosted file
     * File can be hosted locally or from server
     *
     * @param languageName
     * @param languageFilePath
     */
    register: function (languageName, languageFilePath) {

        app.log('register translation {0}', [languageName]);

        app.message.__waitingForTranslations[languageName] = false;

        $.ajax({
            url: languageFilePath,
            type: 'GET',
            success: function (data) {

                app.log('AJAX loaded');

                app.message.__setTranslation(languageName, data);

            },
            error: function (error){

                app.log('AJAX error {0} ',[error]);

                if(error.status == 200){
                    app.message.__setTranslation(languageName, error.responseText);
                }else{
                    app.message.__messages[languageName] = {};
                    app.system.__throwWarn(app.system.__messages.TRANSLATION_LOAD_WARN, [languageName, error.status]);
                }

            }
        });

    },

    __setTranslation: function(languageName, translationData){

        if(typeof translationData === 'string'){

            try {
                translationData = JSON.parse(translationData);
            }catch (err){
                app.system.__throwError(app.system.__messages.TRANSLATION_PARSING, [languageName]);
            }

        }

        app.message.__messages[languageName] = translationData;
        app.message.__waitingForTranslations[languageName] = true;
    },


    /**
     * @public
     *
     * Function to retrieve single translation for named message
     * using existing language from @app.config.lang
     *
     * @param messageName
     */
    get: function (messageName) {
        return app.message.__messages[app.config.lang][messageName];
    },

    /**
     * @private
     *
     * Function to translate all existing messages in DOM
     * Wait's until translation file is downloaded
     *
     *
     * @param html
     */
    __translate: function () {

        if (app.message.__waitingForTranslations[app.config.lang] == undefined) {
            app.system.__throwError(app.system.__messages.TRANSLATION_NOT_EXIST, [app.config.lang])
        }

        setTimeout(function () {

            if (app.message.__waitingForTranslations[app.config.lang] == true) {
                app.message.__translateDOM();
            } else if (app.message.__waitingForTranslations[app.config.lang] == false) {
                app.message.__translate();
            }

        }, 100);

    },

    /**
     * @private
     *
     * Function to translate all existing messages in DOM based on @attr spike-translation
     *
     * @param html
     */
    __translateDOM: function () {

        app.log('__translateDOM');

        $(document).ready(function(){

            $('[' + app.__attributes.TRANSLATION + ']').each(function () {

                var messageName = $(this).attr(app.__attributes.TRANSLATION);
                $(this).html(app.message.__messages[app.config.lang][messageName] || messageName);

            });

        });

    }

};