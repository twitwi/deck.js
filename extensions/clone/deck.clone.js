/*!
Deck JS - deck.clone
Copyright (c) 2011-2014 Rémi Emonet, original version from Rémi BARRAQUAND
Licensed under the MIT license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
*/

/*
This module provides a support for cloning the deck.
*/

(function($, deck, undefined) {
    var $d = $(document);
    var clones = new Array();
        
    $.extend(true, $[deck].defaults, {	
        selectors: {
            clonepointer: ".clonepointer"
        },
        classes: {
            isClone: 'is-clone',
            hasClones: 'has-clones'
        },
        keys: {
            clone: 67 // c
        },
        fitFollowsClone: true
    });

    var hadClones = false;
    var cleanClones = function() {
        var opts = $[deck]('getOptions');
        // remove closed windows
        $.each(clones, function(index, clone) {
            if (clone.closed()) {
                clones.splice(index, 1); // remove element "index"
            }
        });
        // tag/untag the current container depending on the presence of clones
        if (clones.length > 0) {
            $("body").addClass(opts.classes.hasClones);
            if (opts.fitFollowsClone && !hadClones) $[deck]('disableScale');
            hadClones = true;
        } else {
            $("body").removeClass(opts.classes.hasClones);
            if (opts.fitFollowsClone && hadClones) $[deck]('enableScale');
            hadClones = false;
        }
    };

    /*
      jQuery.deck('addClone')
      Create a clone of this window and add it to the clones list.
    */
    $[deck]('extend', 'addClone', function() {
        clone = new DeckClone();
        clones.push(clone);
        cleanClones();
        return clone;
    });
    $[deck]('extend', 'pointerAt', function(rx, ry) {
        var opts = $[deck]('getOptions');
        var current = $[deck]('getToplevelSlideOf', $[deck]('getSlide')).node; // actually uses the step extension
        var r = current.get(0).getBoundingClientRect();
        var x = r.left + r.width * rx;
        var y = r.top + r.height * ry;
        var pos = {left: x, top: y};
        var pointers = $(opts.selectors.clonepointer);
        if (!current.is(pointers.parent())) { // move them within the new slide if it changed
            pointers.show().appendTo(current);
        }
        pointers.offset(pos);
    });
    
    var isClone = false;
    var parentDeck = null;
    /*
      jQuery.deck('Init')
    */
    $d.bind('deck.init', function() {
        var opts = $[deck]('getOptions');
        var container = $[deck]('getContainer');
        
        $(opts.selectors.clonepointer).hide();

        isClone = window.opener && window.opener.___iscloner___;

        if (isClone) { // it's a clone!
            $("body").addClass(opts.classes.isClone);
            $(".anim-continue", container).removeClass("anim-continue"); // friend with anim extension
            window.___fromparent___ = false;
            parentDeck = function() {
                if (! window.___fromparent___) {
                    window.opener.$.deck.apply(window.opener.$, arguments);
                }
            }
        } else { // it is a normal window
            /* bind clone key events */
            $d.unbind('keydown.deckclone').bind('keydown.deckclone', function(e) {
                if (e.which === opts.keys.clone || $.inArray(e.which, opts.keys.clone) > -1) {
                    if (e.ctrlKey) return; // do not trigger on Ctrl+C (by default)
                    $[deck]('addClone');
                    window.___iscloner___ = true;
                    e.preventDefault();
                }
            });
        }
    })
    /* Update current slide number with each change event */
    .bind('deck.change', function(e, from, to) {
        if (isClone) {
            parentDeck('go', to);
        } else {
            cleanClones();
            $.each(clones, function(index, clone) {
                clone.deck('go', to);
            });
        }
    })
    /* Replicate mouse cursor */
    .bind('mousemove', function(e) {
        if (isClone) return;
        var current = $[deck]('getToplevelSlideOf', $[deck]('getSlide')).node; // actually uses the step extension (dependency can be removed if needed)
        var r = current.get(0).getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        cleanClones();
        $.each(clones, function(index, clone) {
            clone.deck('pointerAt', x, y);
        });
    });
    
    /*
        Simple Clone manager (must be improved, by for instance adding cloning
        option e.g. propagate change, etc.)
        */
    var DeckClone = function() {
        var clone = window.open(window.location);
        this.closed = function() {return clone.closed;}
        this.deck = function() {
            if (clone.closed) return;
            if (clone.$) {
                clone.___fromparent___ = true;
                clone.$.deck.apply(clone.$, arguments);
                clone.___fromparent___ = false;
            }
        }
    }
})(jQuery, 'deck');
