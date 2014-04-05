/*!
Deck JS - deck.container-styling
Copyright (c) 2014 Rémi Emonet
Licensed under the MIT license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
*/

/*
This module automatically adds/removes to the container the class specified in data-container-class (for toplevel slides).

This extension relies on the events extension.
*/

(function($, deck, undefined) {
    var $d = $(document);
    $d.bind('deck.init', function() {
        $('*[data-container-class]').each(function(i, el) {
            var toRemove = ""; // one 'toRemove' per element (that's why we do .each
            $(el).bind('deck.becameCurrent', function(_, direction) {
                var target = $(_.target);
                var toAdd = target.attr('data-container-class');
                $[deck]('getContainer').addClass(toAdd);
                toRemove = toAdd;
            }).bind('deck.lostCurrent', function(_, direction) {
                $[deck]('getContainer').removeClass(toRemove);
                toRemove = "";
            });
        });
    });
    $(document).bind('deck.init', function() { // force trigger even if no #slide-... is provided
        var current = $[deck]('getSlide')
        var icur = 0
        for (; icur < $[deck]('getSlides').length; icur++) {
            if ($[deck]('getSlides')[icur] == current) break;                
        }
        $(document).trigger("deck.change", [icur, icur]);
    });
})(jQuery, 'deck');
