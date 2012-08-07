/*!
Deck JS - deck.clone
Copyright (c) 2011 Remi BARRAQUAND
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
https://github.com/imakewebthings/deck.js/blob/master/GPL-license.txt
*/

/*
This module provides a support for cloning the deck.
*/

(function($, deck, undefined) {
    var $d = $(document);
    var clones = new Array();
        
    $.extend(true, $[deck].defaults, {	
        keys: {
            clone: 67 // c
        }
    });

    /*
	jQuery.deck('addClone')
	
	Create a clone of this window and add it to the clones list.
	*/
    $[deck]('extend', 'addClone', function() {
        clone = new DeckClone();
        clones.push(clone);
        return clone;
    });
    $[deck]('extend', 'pointerAt', function(x,y) {
        var parentPos = $(".deck-current").offset();
        var pos = {left: x + parentPos.left, top: y + parentPos.top};
        $(".clonepointer").show().appendTo(".deck-current").offset(pos);
        //alert("moved: "+x+" "+y);
    });
      
    /*
        jQuery.deck('Init')
        */
    $d.bind('deck.init', function() {
        var opts = $[deck]('getOptions');
        var container = $[deck]('getContainer');
        
        $(".clonepointer").hide();

        /* Bind key events */
        $d.unbind('keydown.deckclone').bind('keydown.deckclone', function(e) {
            if (e.which === opts.keys.clone || $.inArray(e.which, opts.keys.clone) > -1) {
                $[deck]('addClone');
                e.preventDefault();
            }
        });
    })
    /* Update current slide number with each change event */
    .bind('deck.change', function(e, from, to) {
        var opts = $[deck]('getOptions');
        var slideTo = $[deck]('getSlide', to);
        var container = $[deck]('getContainer');
        $.each(clones, function(index, clone) {
           clone.deck('go', to);
        });
    })
    /* Do the animations locally */
    .bind('deck.step', function(e, delta) {
        $.each(clones, function(index, clone) {
            if (delta == -1) clone.deck('stepPrev');
            else if (delta == 1) clone.deck('stepNext');
        });
    })
    /* Replicate mouse cursor */
    .bind('mousemove', function(e) {
        var parentPos = $(".deck-current").offset();
        $.each(clones, function(index, clone) {
            clone.deck('pointerAt', e.clientX - parentPos.left, e.clientY - parentPos.top);
        });
    });
    
    /*
        Simple Clone manager (must be improved, by for instance adding cloning
        option e.g. propagate change, etc.)
        */
    var DeckClone = function() {
        var clone = window.open(window.location);
        
        this.deck = function() {
            if (clone['$']) clone['$'].deck.apply(clone['$'], arguments)
        }
    }
})(jQuery, 'deck');