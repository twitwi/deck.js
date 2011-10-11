(function($, deck, undefined) {
   $(document).bind('deck.change', function(e, from, to) {
      var $prev = $[deck]('getSlide', to-1),
      $next = $[deck]('getSlide', to+1),
      $oldprev = $[deck]('getSlide', from-1),
      $oldnext = $[deck]('getSlide', from+1);

      $[deck]('getSlide', to).trigger('deck.becameCurrent');
      $[deck]('getSlide', from).trigger('deck.lostCurrent');

      $prev && $prev.trigger('deck.becamePrevious');
      $next && $next.trigger('deck.becameNext');

      $oldprev && $oldprev.trigger('deck.lostPrevious');
      $oldnext && $oldnext.trigger('deck.lostNext');
   });
})(jQuery, 'deck');

