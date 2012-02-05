/*!
Deck JS - deck.svg.toc
Copyright (c) 2011 Remi BARRAQUAND
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
https://github.com/imakewebthings/deck.js/blob/master/GPL-license.txt
*/

/*
This module provides a support for animated SVG to the deck so as to create 
animation like in most presentation solution e.g powerpoint, keynote, etc.
Slides can include svg documents which then can be animated using the Animator.
*/

(function($, deck, undefined) {
    var $d = $(document);
   
    /*
	Extends defaults/options.
	*/
    $.extend(true, $[deck].defaults, {
        classes: {
            placeholder: 'deck-svg',
            control: 'deck-svg-control'
        }
    });

    $.deck('extend', 'svgAnimate', function(slide, target) {
        return {
            appear: function(e, d) {
                return {
                    doAnimation: function() {
                        var $svg = $(target, slide).svg('get');
                        d = d || 0;
                        $(e, $svg.root()).each( function(){
                            $(this).animate({'svgOpacity': 1.}, d);
                        });
                    },
                    initAnimation: function() {
                        var $svg = $(target, slide).svg('get');
                        $(e, $svg.root()).each( function(){
                            $(this).animate({'svgOpacity': 0.}, 0);
                        });
                    },
                    undoAnimation: function() {
                        var $svg = $(target, slide).svg('get');
                        $(e, $svg.root()).each( function(){
                            $(this).animate({'svgOpacity': 0.}, 0);
                        });
                    }
                }
            },
            disappear: function(e, d) {
                return {
                    doAnimation: function() {
                        var $svg = $(target, slide).svg('get');
                        d = d || 0;
                        $(e, $svg.root()).each( function(){
                            $(this).animate({'svgOpacity': 0.}, d);
                        });
                    },
                    initAnimation: function() {
                        var $svg = $(target, slide).svg('get');
                        $(e, $svg.root()).each( function(){
                            $(this).animate({'svgOpacity': 1.}, 0);
                        });
                    },
                    undoAnimation: function() {
                        var $svg = $(target, slide).svg('get');
                        $(e, $svg.root()).each( function(){
                            $(this).animate({'svgOpacity': 0.}, 1);
                        });
                    }
                }
            }

        }

    });
    $.deck('extend', 'DONOTEXTENDnext', function() {
        var slide = $[deck]('getSlide', $[deck]('getCurrent'));
        if (slide.data('animators')) {
            var animators = slide.data('animators');
            var finished = true;
            for (var ia in animators) {
                var animator = $(window).attr(animators[ia]);
                if (!animator.isCompleted()) {
                    animator.next();
                    finished = false;
                    break;
                }
            }
            if (finished) {
                $.deck('go', ($.deck('getCurrent'))+1);
            }
        } else {
            $.deck('go', ($.deck('getCurrent'))+1);
        }
    });
    
    /*
        jQuery.deck('Init')
        */
    $d.bind('deck.init', function() {
        var opts = $[deck]('getOptions');
        var container = $[deck]('getContainer');

        /* Go through all slides */
        $.each($[deck]('getSlides'), function(i, $el) {
            var $slide = $[deck]('getSlide',i);
            
            if( $slide.has("object[type='deckjs/asvg']").length>0 ) {
                $slide.data('animators', new Array());
            }
            
            /* Find all the object of type deckjs/asvg */
            $slide.find("object[type='deckjs/asvg']").each(function(index) {
                var id = $(this)
                /* Load attributes and validate them */
                var attributes = loadObjectParams(this);
                if( !validateParams(attributes) ) {
                    throw "Error while initializing "+$(this).attr('id')+", please ensure you have settup the required parameters."
                    return false;
                }
                
                /* Add this animator to the list of animators of the current slide. */
                //$slide.data('animators').push(attributes['animator']);
                
                /* Create aSVG placeholder */
                var aSVG = createaSVG(this, attributes);
                $(this).replaceWith(aSVG);
                
                // Finaly load the SVG data
                aSVG.svg({
                    loadURL: attributes['src'],
                    onLoad: function(svg) {
                        // nothing to do here
                    },
                    settings: {
                        // no settings
                    }
                });
            });
        });
    })
    /* Update current slide number with each change event */
    .bind('deck.change', function(e, from, to) {
        var opts = $[deck]('getOptions');
        var $slideTo = $[deck]('getSlide', to);
        var $container = $[deck]('getContainer');
	
        /* Restart all animator in the slide */
        if( $.isArray($slideTo.data('animators')) ) {
            $.each($slideTo.data('animators'), function(index, animator){
               $(window).attr(animator).restart();
            });
        }
    }).bind('deck.animator.init', function(e, data) {
        $('#deck-svg-next').removeClass("disabled");
    });
    
    /*
        Load parameters from an Object element
        */
    function loadObjectParams(objectElement) {
        var attributes = {};
        $(objectElement).children("param").each(function(index){
            attributes[$(this).attr("name")] = $(this).attr("value");
        });
        return attributes;
    }
    
    /*
        Return true if default params are set.
        */
    function validateParams(params) {
        return params['src'] && params['width'] && params['height'];// && params['animator'];
    }
    
    /*
        Create aSVG placeholder
        */
    function createaSVG(object, attributes) {
        var $canvas, $control, $next, $reload, $placeholder;
        
        /* Create svg canvas */
        $canvas = $("<div />").attr({
            'id':  $(object).attr('id'),
            'class': $(object).attr('class')
        }).css({
            'height': attributes['height'],
            'width': attributes['width']
        });
        return $canvas;
    }
})(jQuery, 'deck');