/*!
Deck JS - deck.highlight
Copyright (c) 2015 Rémi Emonet
Licensed under the MIT license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
*/

/*
This module wraps highlight.js (https://github.com/isagalaev/highlight.js/blob/master/LICENSE).
If one wants to add line numbers, this can be done with css:

      div.deck-container pre code { counter-reset: code-lines; }
      div.deck-container pre code > span { counter-increment: code-lines; }
      div.deck-container pre code > span:before {
          content: counter(code-lines);
          color: lightgrey;
          min-width: 2ch;
          padding-right: 1em;
          display: inline-block;
          text-align: right;
      }
*/

(function($, deck, undefined) {
    $.extend(true, $.deck.defaults, {
        classes: {
        },
    });

    var modesAndAliases = [];

    var highlight = function(slide) {
        var o = $.deck('getOptions');

        $(slide).find('pre>code').each(function(i, e) {
            hljs.highlightBlock(e);
            // wrap each line such that we can easily add line numbers with CSS (see above)
            e.innerHTML = '<span>'+e.innerHTML.replace(/\n/g, '</span>\n<span>')+'</span>';
        });
    };

    var $d = $(document);
    $d.bind('deck.init', function() {
        var o = $.deck('getOptions');
        highlight($(".deck-container"))
    });
})(jQuery, 'deck');
