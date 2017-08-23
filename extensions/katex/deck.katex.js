/*!
Deck JS - deck.katex.js
Copyright (c) 2015-2017 Rémi Emonet,
Formatting "latex" maths using the katex library (lighter than mathjax)
*/

/*
This module provides a support for latex equation syntax.
http://khan.github.io/KaTeX/

current version twitwi/0.8.2-fordeckjs
*/

(function($, deck, undefined) {
    var $d = $(document);
    var may = function(f) {return f ? f : function() {}};
    
    $d.bind('deck.init', function() {
        var container = $[deck]('getContainer');
        $('.latex', container).each(function() {
            this.classList.remove('latex');
            var v = $(this).text();
            v = "\\displaystyle "+v+"";
            katex.render(v, this, {breakOnUnsupportedCmds: false});
        });
    });
})(jQuery, 'deck');
