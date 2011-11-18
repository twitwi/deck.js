/*!
Deck JS - deck.svg.toc
Copyright (c) 2011 Remi BARRAQUAND
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
https://github.com/imakewebthings/deck.js/blob/master/GPL-license.txt
*/

/*
This module provides a support for SVG to the deck.
*/

(function($, deck, undefined) {
    var $d = $(document);
        
    /*
	Extends defaults/options.
	*/
    $.extend(true, $[deck].defaults, {
        
    });
    
    /*
        jQuery.deck('Init')
        */
    $d.bind('deck.init', function() {
        var opts = $[deck]('getOptions');
        var container = $[deck]('getContainer');
        
        /* Bind key events */
        $d.unbind('keydown.decktoc').bind('keydown.decktoc', function(e) {
            if (e.which === opts.keys.toc || $.inArray(e.which, opts.keys.toc) > -1) {
                $[deck]('toggleToc');
                e.preventDefault();
            }
        });
        
        /* Hide TOC panel when user click on container */
        container.click(function(e){
            $[deck]('hideToc');
        });
                
        /* Init TOC and append it to the document */
        $toc = new TOC();
        $($[deck]('getOptions').selectors.toc).append($toc.root);
                
        /* Go through all slides */
        $.each($[deck]('getSlides'), function(i, $el) {
            var slide = $[deck]('getSlide',i);
            var tocElementFound = false;
            
            /* If there is a toc item, push it in the TOC */
            for(var level=1; level<6; level++) {
                if( slide.children("h"+level).length > 0) {
                    $toc.push(level, slide.children("h"+level+":first").text(), slide);
                    tocElementFound = true;
                }
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
            
        /* update toc status */
        if( slideTo.data("toc") ) {
            // reset
            $(opts.selectors.tocTitle).text("");
            $(opts.selectors.tocSection).text("");
            $(opts.selectors.tocSubSection).text("");
            $(opts.selectors.tocSubSubSection).text("");

            // update according to the current context
            var $context = $toc.context(slideTo.data('toc'))            
            for(var level=1; level<=$context.length; level++) {
                switch(level) {
                    case 1: 
                        $(opts.selectors.tocTitle).text($context[level-1]);
                        break;
                    case 2: 
                        $(opts.selectors.tocSection).text($context[level-1]); 
                        break;
                    case 3: 
                        $(opts.selectors.tocSubSection).text($context[level-1]); 
                        break;
                    case 4: 
                        $(opts.selectors.tocSubSubSection).text($context[level-1]); 
                        break;
                }
            }
        }
    });
        
    /*
        Simple TOC manager (must be improved)
        */
    var TOC = function() {
        
        this.root = $("<ul/>", {"class":"toc"});
            
        /* 
            Push new item in the TOC 
          
            depth is the level (e.g. 1 for h1, 2 for h2, etc.)
            title is the toc-item title
            slide is the slide that provides the toc-element
            */
        this.push = function(depth,title,slide) {
            inc(depth);
                
            /* Create toc element */
            var $tocElm = $("<li />", {
                id: "toc-"+($c.join('-'))
            }).data({ // keep track of the slide in case...
                slide: slide,
                title: title
            }).append($("<a />", { // create an hyperlink
                href: "#"+$(slide).attr('id'),
                text: title
            })).append($("<ul />"));
                                
            /* insert it at the right place */
            var $target = this.root;
            if( depth > 1) {
                $target = ($target.find("li#toc-"+($c.slice(0,$c.length-1).join('-')))).children("ul");
            }
            $tocElm.appendTo($target);
            
            /* Keep track of the TOC level in the slide */
            slide.data({
                toc: $c.slice(0)
            });
        };
        
        /*
            Get the current TOC context
        
            path is the current path in the TOC
            */
        this.context = function(path) {
            $context = new Array();
            var $target = this.root;
            for(var depth=0; depth<path.length; depth++) {
                var tocElm = $target.find("li#toc-"+(path.slice(0,depth+1).join('-')))
                $context.push(tocElm.data('title'));
                $target = (tocElm).children("ul");
            }
            
            return $context;
        }
            
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