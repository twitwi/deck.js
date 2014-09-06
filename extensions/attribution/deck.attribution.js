/*!
Deck JS - deck.attribution
Copyright (c) 2014 Rémi Emonet
Licensed under the MIT license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
*/

/*
This module automatically adds some text and a link for elements having a "data-attribution" attributes.
*/

(function($, deck, undefined) {
    $.extend(true, $.deck.defaults, {
        classes: {
            attributionWrapper: 'attribution-wrap',
            attributionLink: 'attribution-link'
        },
        dataAttribution: "data-attribution",
        dataAttributionContent: "data-attribution-content",
        dataAttributionClass: "data-attribution-class"
    });

    var $d = $(document);
    $d.bind('deck.init', function() {
        var o = $.deck('getOptions');
        $('*['+o.dataAttribution+']').each(function(i, el){
            var c = $(el).attr(o.dataAttributionContent);
            var cc = $(el).attr(o.dataAttributionClass);
            var a = $(el).attr(o.dataAttribution);
            var w = $("<div>");
            w.addClass(o.classes.attributionWrapper);
            var link = $("<a>");
            link.addClass(o.classes.attributionLink);
            if (!! cc) link.addClass(cc);
            link.attr("href", a);
            link.attr("target", "_blank");
            if (!! c) {
                link.html(c);
            } else {
                link.html(a);
            }
            $(el).after(w);
            $(w).append(link);
        });
    });
})(jQuery, 'deck');
