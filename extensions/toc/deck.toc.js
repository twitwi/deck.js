/*!
Deck JS - deck.toc
Copyright (c) 2011 Remi BARRAQUAND
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
https://github.com/imakewebthings/deck.js/blob/master/GPL-license.txt
*/

/*
This module provides a support for TOC to the deck.
*/

(function($, deck, undefined) {
    var $d = $(document);
    var $toc;
        
    /*
	Extends defaults/options.
	
        options.classes.toc
		This class is added to the deck container when showing the slide
                toc.
	
	options.keys.toc
		The numeric keycode used to toggle between showing and hiding 
                the slide toc.
    
	options.selectors.toc
		The element matching this selector displays the toc.
    
	options.selectors.tocTitle
		The element matching this selector displays the current title
                of the slide i.e the current h1.

        options.selectors.tocSection
		The element matching this selector displays the current section
                of the slide i.e the current h2.
	
        options.selectors.tocSubSection
		The element matching this selector displays the current 
                subsection of the slide i.e the current h3.
    
        options.selectors.tocSubSubSection
		The element matching this selector displays the current 
                subsubsection of the slide i.e the current h4.
	*/
    $.extend(true, $[deck].defaults, {
        classes: {
            toc: 'deck-toc-frame'
        },
		
        keys: {
            toc: 84 // t
        },
                
        selectors: {
            toc: '.deck-toc',
            tocTitle: '.deck-toc-h1',
            tocSection: '.deck-toc-h2',
            tocSubSection: '.deck-toc-h3',
            tocSubSubSection: '.deck-toc-h4'
        }
    });

    /*
	jQuery.deck('showToc')
	
	Shows the slide toc by adding the class specified by the toc class option
	to the deck container.
	*/
    $[deck]('extend', 'showToc', function() {
        $[deck]('getContainer').addClass($[deck]('getOptions').classes.toc);
    });
	
    /*
	jQuery.deck('hideToc')
	
	Hides the slide toc by removing the class specified by the toc class
	option from the deck container.
	*/
    $[deck]('extend', 'hideToc', function() {
        $[deck]('getContainer').removeClass($[deck]('getOptions').classes.toc);
    });

    /*
	jQuery.deck('toggleToc')
	
	Toggles between showing and hiding the TOC.
	*/
    $[deck]('extend', 'toggleToc', function() {
        $[deck]('getContainer').hasClass($[deck]('getOptions').classes.toc) ? 
        $[deck]('hideToc') : $[deck]('showToc');
    });
        
    /*
        jQuery.deck('Init')
        */
    $d.bind('deck.init', function() {
        // Bind key events
        $d.unbind('keydown.decktoc').bind('keydown.decktoc', function(e) {
            if (e.which === opts.keys.toc || $.inArray(e.which, opts.keys.toc) > -1) {
                $[deck]('toggleToc');
                e.preventDefault();
            }
        });
                
        var opts = $[deck]('getOptions');
                
        /* Init TOC and append it to the document */
        $toc = new TOC();
        $($[deck]('getOptions').selectors.toc).append($toc.root);
                
        /* Go through all slides */
        $.each($[deck]('getSlides'), function(i, $el) {
            var slide = $[deck]('getSlide',i);
                    
            if( slide.children("h1").length > 0 ) {
                $toc.push(1,slide.children("h1:first").text(),slide);
            } else if ( slide.children("h2").length > 0 ) {
                $toc.push(2,slide.children("h2:first").text(),slide);
            } else if ( slide.children("h3").length > 0 ) {
                $toc.push(3,slide.children("h3:first").text(),slide);
            } else if ( slide.children("h4").length > 0 ) {
                $toc.push(4,slide.children("h4:first").text(),slide);
            } else if ( slide.children("h5").length > 0 ) {
                $toc.push(5,slide.children("h5:first").text(),slide);
            }
        });
    })
    /* Update current slide number with each change event */
    .bind('deck.change', function(e, from, to) {
        var opts = $[deck]('getOptions');
        var slideTo = $[deck]('getSlide', to);
        var container = $[deck]('getContainer');
		
        if (container.hasClass($[deck]('getOptions').classes.toc)) {
            container.scrollTop(slideTo.offset().top);
        }
               
        if( slideTo.children("h1").length > 0 ) {
            $(opts.selectors.tocTitle).text(slideTo.children("h1:first").text());
            // clear
            $(opts.selectors.tocSection).text("");
            $(opts.selectors.tocSubSection).text("");
            $(opts.selectors.tocSubSubSection).text("");
        } else if( slideTo.children("h2").length > 0 ) {
            $(opts.selectors.tocSection).text(slideTo.children("h2:first").text());
            // clear
            $(opts.selectors.tocSubSection).text("");
            $(opts.selectors.tocSubSubSection).text("");
        } else if( slideTo.children("h3").length > 0 ) {
            $(opts.selectors.tocSubSection).text(slideTo.children("h3:first").text());
            // clear
            $(opts.selectors.tocSubSubSection).text("");
        } else if( slideTo.children("h4").length > 0 ) {
            $(opts.selectors.tocSubSubSection).text(slideTo.children("h4:first").text());
        }  
    });
        
    /*
        Simple TOC manager (must be improved)
        */
    var TOC = function() {
        this.root = $("<ul/>", {
            "class":"toc"
        });
            
        /* push new toc element */
        this.push = function(depth,title,slide) {
            inc(depth);
                
            /* create toc element */
            var $tocElm = $("<li />", {
                id: "toc-"+($c.join('-'))
            })
            // keep track of the slide in case...
            .data({
                slide: slide
            })
            // create an hyperlink
            .append($("<a />", {
                href: "#"+$(slide).attr('id'),
                text: title
            }))
            // allow to add children
            .append($("<ul />"));
                                
            /* insert it at the right place */
            var $target = this.root;
            if( depth > 1) {
                $target = ($target.find("li#toc-"+($c.slice(0,$c.length-1).join('-')))).children("ul");
            }
            $tocElm.appendTo($target);
        };
            
        /* cursor */
        var $c = [-1];
        function inc(depth) {
            var current_depth = $c.length;
            if(depth>current_depth) {
                for(i=current_depth;i<depth;i++) {
                    $c.push(0);
                }
            } else if( current_depth>depth) {
                for(i=depth;i<current_depth;i++) {
                    $c.pop();
                    $c[depth-1]++
                }
            } else {
                $c[depth-1]++
            }
        }
    }
})(jQuery, 'deck');