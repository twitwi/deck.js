/*!
Deck JS - deck.progress
Copyright (c) 2014 Rémi Emonet
Dual licensed under the MIT license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
*/

/*
This module adds a (current)/(total) style status indicator to the deck.

It is designed to be a drop-in replacement of deck.status, but on steroïds.
Note however, that it does not handle the countNested=true case.
*/
(function($, undefined) {
    var $document = $(document);
    var rootCounter;
    
    var updateCurrent = function(event, from, to) {
        var options = $.deck('getOptions');
        var currentSlideNumber = to + 1;
        currentSlideNumber = $.deck('getSlide', to).data('rootSlide');
        $(options.selectors.statusCurrent).text(currentSlideNumber);

        var icur = 0;
        for (; icur < $.deck('getSlides').length; icur++) {
            var top = $.deck('getSlide', icur).data('rootSlide');
            if (top == currentSlideNumber) break;
        }
        var last = null;
        for (; icur < $.deck('getSlides').length; icur++) {
            last = $.deck('getSlide', icur).data('rootSlide');
            if ($.deck('getSlide', icur).filter(options.selectors.statusFakeEnd).size() > 0) break;
        }

	$(options.selectors.statusTotal).text(last);
    };
    
    var markRootSlides = function() {
        var options = $.deck('getOptions');
        var slideTest = $.map([
            options.classes.before,
            options.classes.previous,
            options.classes.current,
            options.classes.next,
            options.classes.after
        ], function(el, i) {
            return '.' + el;
        }).join(', ');
        
        rootCounter = 0;
        $.each($.deck('getSlides'), function(i, $slide) {
            var $parentSlides = $slide.parentsUntil(
                options.selectors.container,
                slideTest
            );
            
            if ($parentSlides.length) {
                $slide.data('rootSlide', $parentSlides.last().data('rootSlide'));
            }
            else {
                ++rootCounter;
                $slide.data('rootSlide', rootCounter);
            }
        });
    };
    
    var setInitialSlideNumber = function() {
        var slides = $.deck('getSlides');
        var $currentSlide = $.deck('getSlide');
        var index;
        
        $.each(slides, function(i, $slide) {
            if ($slide === $currentSlide) {
                index = i;
                return false;
            }
        });
        updateCurrent(null, index, index);
    };
    
    var setTotalSlideNumber = function() {
        var opts = $.deck('getOptions');
        var slides = $.deck('getSlides');
        
        var nSlides = $.deck('getTopLevelSlides').length;
	$(opts.selectors.statusFullTotal).text(nSlides);

    };
    
    /*
      Extends defaults/options.
      
      options.selectors.statusCurrent
      The element matching this selector displays the current slide number.
      
      options.selectors.statusTotal
      The element matching this selector displays the total number of slides.
      
      options.countNested
      If false, only top level slides will be counted in the current and
      total numbers.
    */
    $.extend(true, $.deck.defaults, {
        selectors: {
            statusCurrent: '.deck-status-current',
	    statusTotal: '.deck-status-total',
	    statusFakeEnd: '.deck-status-fake-end',
	    statusFullTotal: '.deck-status-full-total'
        }
    });
    
    $document.bind('deck.init', function() {
        markRootSlides();
        setInitialSlideNumber();
        setTotalSlideNumber();
    });
    $document.bind('deck.change', updateCurrent);
})(jQuery, 'deck');

