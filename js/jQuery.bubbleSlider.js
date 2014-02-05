//Utils   Polyfill
if(typeof Object.create !== "function" ){
    Object.create = function(obj){
        function F(){};
        F.prototype = obj;
        return new F();
    };
}

;(function ( $, window, document, undefined ) {
    $.fn.bubbleSlider = function(options){
        options = $.extend({}, $.fn.bubbleSlider.options, options);


    };
    $.fn.bubbleSlider.options = {
        duration: 2000,


    };
})(jQuery, window, document);