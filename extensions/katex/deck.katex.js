/*!
Deck JS - deck.katek.js
Copyright (c) 2015 Rémi Emonet,
Formatting "latex" maths using the katek library (lighter than mathjax)
*/

/*
This module provides a support for latex equation syntax.
http://khan.github.io/KaTeX/
*/

(function($, deck, undefined) {
    var $d = $(document);
    var may = function(f) {return f ? f : function() {}};
    
    $d.bind('deck.init', function() {
        var container = $[deck]('getContainer');
        $('.latex', container).each(function() {
            var it = this;
            var v = $(it).text();
            v = "\\displaystyle "+v+"";
            //console.log(v);
            katex.render(v, it, {breakOnUnsupportedCmds: false});
        });
    });
})(jQuery, 'deck');
