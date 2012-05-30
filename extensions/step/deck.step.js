/*!
Deck JS - deck.step
Copyright (c) 2011 Rémi Emonet
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
https://github.com/imakewebthings/deck.js/blob/master/GPL-license.txt
*/

/*
This module provides new methods for stepping without considering sub-slides.
It also overrides the defaults keybinding and countNested value (so it is better to include it after "goto" and "status" extensions).
*/

(function($, deck, undefined) {
    var $d = $(document);
    $.extend(true, $.deck.defaults, {
        // Here we redefined the defaults:
        //  - we avoid counting nested slides
        //  - we keep up/down for top-level slides
        //  - we still use pgup/pgdown for inner slides as they are sent by some pluggable remote controls
        keys: {
            // backspace, left arrow, page down
            previous: [8, 37, 34],
            // enter, space, right arrow, page up
            next: [13, 32, 39, 33],
            // up arrow
            previousTopLevel: [38],
            // down arrow,
            nextTopLevel: [40]
        },
        countNested: false
    });
    var slideTestDelayed = function(opts) {return $.map([
        opts.classes.before,
        opts.classes.previous,
        opts.classes.current,
        opts.classes.next,
        opts.classes.after
        ], function(el, i) {
            return '.' + el;
        }).join(', ');}
    
    $[deck]('extend', 'previousTopLevelSlide', function() {
        var opts = $[deck]('getOptions');
        var slideTest = slideTestDelayed(opts);
        /* Find the real next parent */
        var current = $[deck]('getSlide');
        var blackListForTopLevel = null;
        var toGo = null;
        var stillCounting = true;
        var slides = ([]).concat($[deck]('getSlides')); // copy the slide's list so we can safely reverse it
        $.each(slides.reverse(), function(ii, $el) {
            var $parentSlides = $el.parentsUntil(opts.selectors.container, slideTest);
            if (blackListForTopLevel == null) { // still not found the current
                if (current == $el) { // found it!
                    blackListForTopLevel = $el; // actually if $el is not toplevel then it won't be taken into account below'
                }
            } else if (stillCounting) { // it was already found
                toGo = slides.length - 1 - ii;
                if ($parentSlides.length == 0 && $el.get(0) !== blackListForTopLevel.get(0)) {
                    stillCounting = false;
                }
            }
        });
        $[deck]('go', toGo);
    });
    $[deck]('extend', 'nextTopLevelSlide', function() {
        var opts = $[deck]('getOptions');
        var slideTest = slideTestDelayed(opts);
        /* Find the real next parent */
        var current = $[deck]('getSlide');
        var topLevelFromCurrent = null;
        var toGo = null;
        var stillCounting = true;
        $.each($[deck]('getSlides'), function(i, $el) {
            var $parentSlides = $el.parentsUntil(opts.selectors.container, slideTest);
            if (topLevelFromCurrent == null) { // still not found the current
                if (current == $el) { // found it!
                    topLevelFromCurrent = $parentSlides.length ? $parentSlides.last() : $el;
                }
            } else if (stillCounting) { // it was already found
                toGo = i;
                var newTopLevel = $parentSlides.length ? $parentSlides.last() : $el;
                if (newTopLevel.get(0) !== topLevelFromCurrent.get(0)) {
                    stillCounting = false;
                }
            }
        });
        $[deck]('go', toGo);
    });
    $d.bind('deck.init', function() {
        $d.unbind('keydown.decknexttoplevel').bind('keydown.decknexttoplevel', function(e) {
            var $opts = $[deck]('getOptions');
            var key = $opts.keys.nextTopLevel;
            if (e.which === key || $.inArray(e.which, key) > -1) {
                e.preventDefault();
                $[deck]('nextTopLevelSlide');
            }
        });
        $d.unbind('keydown.deckprevioustoplevel').bind('keydown.deckprevioustoplevel', function(e) {
            var $opts = $[deck]('getOptions');
            var key = $opts.keys.previousTopLevel;
            if (e.which === key || $.inArray(e.which, key) > -1) {
                e.preventDefault();
                $[deck]('previousTopLevelSlide');
            }
        });
    });
})(jQuery, 'deck');
