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
        return this.register(languageName, languageFilePath);
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

        var promise = $.ajax({
            url: languageFilePath,
            type: 'GET'
        });

        promise.then(function (data) {

            app.message.__setTranslation(languageName, data);

            return data;

        });

        promise.catch(function (error) {

            if (error.status == 200) {
                app.message.__setTranslation(languageName, error.responseText);
            } else {
                app.message.__messages[languageName] = {};
                app.system.__throwWarn(app.system.__messages.TRANSLATION_LOAD_WARN, [languageName, error.status]);
            }

            return error;

        });

        return promise;

    },

    __setTranslation: function (languageName, translationData) {

        if (typeof translationData === 'string') {

            try {
                translationData = JSON.parse(translationData);
            } catch (err) {
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
    get: function (messageName, arrayOrMapParams) {

        var message = app.message.__messages[app.config.lang][messageName];
        if(!message){
            message = messageName;
            app.system.__throwWarn(app.system.__messages.TRANSLATION_MESSAGE_NOT_FOUND, [messageName])
        }

        if(arrayOrMapParams && message){
            message = app.message.__bindParams(message, arrayOrMapParams);
        }

        return message || messageName;
    },

    /**
     * @private
     *
     * Replaces all occurences of translation keys to translations
     * in template html
     * @param templateHtml
     */
    __replaceTemplateKeys: function (templateHtml) {

        for (var messageName in app.message.__messages[app.config.lang]) {

            templateHtml = templateHtml.split('>' + messageName + '<').join('>' + app.message.__messages[app.config.lang][messageName] + '<');

        }

        return templateHtml;
    },

    __bindParams: function (string, objectOrArrayParams) {

        if(!string){
            return '';
        }

        if(string.indexOf('{') == -1 || !objectOrArrayParams){
            return string;
        }

        if (objectOrArrayParams instanceof Array) {

            for (var i = 0; i < objectOrArrayParams.length; i++) {
                string = string.replace('{' + i + '}', objectOrArrayParams[i])
            }

        } else {

            for (var paramName in objectOrArrayParams) {
                string = string.replace('{' + paramName + '}', objectOrArrayParams[paramName]);
            }

        }

        return string;

    },

};