/**
 * @public
 *
 * jQuery extension to invoke on elements like forms
 * which one's have @attr name
 *
 * Creating object from jQuery.fn.serializeArray() result
 *
 */
jQuery.fn.extend({
    
    serializeObject: function() {
        
        var serializedArray = this.serializeArray();
        var serializedObject = {};
        
        for(var i = 0;i<serializedArray.length;i++){

            var value = serializedArray[i].value;

            if(value == 'on'){
                value = true;
            }else if(value == 'off'){
                value = false;
            }

            serializedObject[serializedArray[i].name] = app.util.System.tryParseNumber(value);
        }
        
        return serializedObject;
        
    }
    
});