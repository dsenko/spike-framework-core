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

    set: function (_value, _filter) {

        if (!_value) {
            return;
        }

        if (_filter && _value) {
            _value = _filter(_value);
        }

        var setFunction = function (selector, value) {

            var elementType = selector.prop('tagName');

            if (!elementType) {
                elementType = selector.prop('nodeName');
            }

            elementType = elementType.toLowerCase();

            if (elementType == 'label' || elementType == 'div' || elementType == 'span' || elementType == 'button' || elementType == 'p' || elementType.indexOf('h') > -1) {
                selector.html(value.toString());
            } else if (elementType == 'img') {
                selector.attr('src', value);
            } else if (selector.is(':checkbox')) {
                if (value == true || parseInt(value) == 1) {
                    selector.prop('checked', true);
                } else {
                    selector.prop('checked', false);
                }
            } else if (elementType == 'a') {
                selector.attr('href', value);
            } else {
                selector.val(value);
            }

        }

        setFunction($(this), _value);

    },


});