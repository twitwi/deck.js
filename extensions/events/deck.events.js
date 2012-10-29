(function($, deck, undefined) {
   $(document).bind('deck.change', function(e, from, to) {
      var $prev = $[deck]('getSlide', to-1),
      $next = $[deck]('getSlide', to+1),
      $oldprev = $[deck]('getSlide', from-1),
      $oldnext = $[deck]('getSlide', from+1);
      
      var direction = "forward";
      if(from > to){
        direction = "reverse";
      }

      $[deck]('getSlide', to).trigger('deck.becameCurrent', [direction, from, to]);
      $[deck]('getSlide', from).trigger('deck.lostCurrent', [direction, from, to]);

      $prev && $prev.trigger('deck.becamePrevious', [direction, from, to]);
      $next && $next.trigger('deck.becameNext', [direction, from, to]);

      $oldprev && $oldprev.trigger('deck.lostPrevious', [direction, from, to]);
      $oldnext && $oldnext.trigger('deck.lostNext', [direction, from, to]);
   });
})(jQuery, 'deck');

