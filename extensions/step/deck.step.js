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
    // undo the defaults (to be sure jquery behaves properly when overriding it)
    $.extend(true, $[deck].defaults, { keys: {next:null, previous:null}});
    // and go on
    $.extend(true, $[deck].defaults, {
        selectors: {
            subslidesToNotify: ".slide,.onshowtoplevel"
        },
        // TODO previousActsAtTopLevel: false, <<<< to make left arrow got to the beginning of previous slide
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
    var myInArray = function(el, arr) {
        for (i in arr) if (el.is(arr[i])) return i*1; // cast to int
        return -1;
    };
    $[deck]('extend', 'previousTopLevelSlide', function() {
        var opts = $[deck]('getOptions');
        var slideTest = slideTestDelayed(opts);
        var topLevelOf = function(node) {
            var $parentSlides = $(node).parentsUntil(opts.selectors.container, slideTest);
            return $parentSlides.length ? $parentSlides.last() : node;
        };
        /* Find the real previous parent */
        var current = $[deck]('getSlide');
        var currentParent = topLevelOf(current);
        var toGo = myInArray(currentParent, $[deck]('getSlides'));
        if (current.is(currentParent) && toGo > 0) {
            // This is already toplevel slide, just go to the previous toplevel one (parent of the previous one)
            toGo = myInArray(topLevelOf($[deck]('getSlide', toGo-1)), $[deck]('getSlides'));
        }
        $[deck]('go', toGo);
        
    });
    $[deck]('extend', 'nextTopLevelSlide', function() {
        var opts = $[deck]('getOptions');
        var slideTest = slideTestDelayed(opts);
        var topLevelOf = function(node) {
            var $parentSlides = $(node).parentsUntil(opts.selectors.container, slideTest);
            return $parentSlides.length ? $parentSlides.last() : node;
        };
        /* Find the real next parent */
        var current = $[deck]('getSlide');
        var currentParent = topLevelOf(current);
        var icur = myInArray(current, $[deck]('getSlides'));
        for (; icur < $[deck]('getSlides').length; icur++) {
            var cursorParent = topLevelOf($[deck]('getSlide', icur));
            if (!currentParent.is(cursorParent)) {
                $[deck]('go', icur);
                break;
            }
        }
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
    // we will init the subslides (in case they are animations), in a backward order
    $d.bind('deck.change', function(e, from, to) {
        var opts = $[deck]('getOptions');
        var slideTest = slideTestDelayed(opts);
        var topLevelOf = function(node) {
            var $parentSlides = $(node).parentsUntil(opts.selectors.container, slideTest);
            return $parentSlides.length ? $parentSlides.last() : node;
        };
        // consider only the case where we actually changed slide
        if (topLevelOf($[deck]('getSlide', to)).is(topLevelOf($[deck]('getSlide', from)))) {
            return;
        }
        var direction = "forward";
        if (from > to){
            direction = "reverse";
        }
        $(topLevelOf($[deck]('getSlide', to)).find(opts.selectors.subslidesToNotify).get().reverse()).trigger('deck.toplevelBecameCurrent', direction);
    });
})(jQuery, 'deck');
