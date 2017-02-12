/**
 * @public
 *
 * jQuery extension to invoke specified jQuery method on HTML tags
 *
 * Example invoking set('www.someSite.com/image.png') on @image tag sets value for @attr src
 * Example invoking set('Name') on @span tag sets @innerHtml
 * Example invoking set('England') on @input tag sets value for @attr value
 *
 * Optional value can be passed by custom filter.
 *
 * @param value
 * @param filter --optional
 */
jQuery.fn.extend({

    set: function(value, filter) {

        if(!value){
            return;
        }

        if(filter && value){
            value = filter(value);
        }

        var elementType = $(this).prop('tagName');

        if(!elementType){
            elementType = $(this).prop('nodeName');
        }

        elementType = elementType.toLowerCase();


        if(elementType == 'label' || elementType == 'div' || elementType == 'span' || elementType == 'button' || elementType == 'p' || elementType.indexOf('h') > -1){
            $(this).html(value.toString());
        }else if(elementType == 'img') {
            $(this).attr('src', value);
        }else if($(this).is(':checkbox')) {
            if(value == true || parseInt(value) == 1){
                $(this).prop('checked', true);
            }else{
                $(this).prop('checked', false);
            }
        }else if(elementType == 'a') {
            $(this).attr('href', value);
        }else{
            $(this).val(value);
        }


    },


});