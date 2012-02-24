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
    var may = function(f) {return f ? f : function() {}};
   
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
                d = d || 0;
                return {
                    doAnimation: function() {
                        var $svg = $(target, slide).svg('get');
                        $(e, $svg.root()).animate({'svgOpacity': 1.}, d);
                    },
                    initAnimation: function() {
                        var $svg = $(target, slide).svg('get');
                        $(e, $svg.root()).animate({'svgOpacity': 0.}, 0);
                    },
                    undoAnimation: function() {
                        var $svg = $(target, slide).svg('get');
                        $(e, $svg.root()).animate({'svgOpacity': 0.}, 0);
                    }
                }
            },
            disappear: function(e, d) {
                d = d || 0;
                return {
                    doAnimation: function() {
                        var $svg = $(target, slide).svg('get');
                        $(e, $svg.root()).animate({'svgOpacity': 0.}, d);
                    },
                    initAnimation: function() {
                        var $svg = $(target, slide).svg('get');
                        $(e, $svg.root()).animate({'svgOpacity': 1.}, 0);
                    },
                    undoAnimation: function() {
                        var $svg = $(target, slide).svg('get');
                        $(e, $svg.root()).animate({'svgOpacity': 1.}, 1);
                    }
                }
            },
            viewBox: function(to, d, d2) {
                d = d || 0;
                d2 = d / 10;
                var getViewBox = function ($svg) {
                    var a = function (i) {return $svg.root().getAttribute(i)}
                    return a("viewBox") || ("0 0 "+a('width')+" "+a('height'));
                };
                var from;
                return {
                    doAnimation: function() {
                        var $svg = $(target, slide).svg('get');
                        from = getViewBox($svg);
                        $svg.root().setAttribute("viewBox", from);
                        $($svg.root()).animate({'svgViewBox': to}, d);
                    },
                    undoAnimation: function() {
                        var $svg = $(target, slide).svg('get');
                        $($svg.root()).animate({'svgViewBox': from}, d2);
                    }
                }
            },
           // The following are redundant with the 'animate' extension but this is just for convenience
            withDelay: function(d, a) {
                return {
                    doAnimation: function(ctx) {setTimeout(function() {may(a.doAnimation).apply()}, d);},
                    initAnimation: function(ctx) {may(a.initAnimation).apply()},
                    undoAnimation: function(ctx) {may(a.undoAnimation).apply()}
                }
            },
            /* This one should be used only in special case.
               At the higher level, if an animation is an array then all the elements are executed.
               Use this one only to more nested stuffs, e.g., wait 1sec then do a group of animations.
               */
            and: function() {
                var args = arguments;
                return {
                    doAnimation: function(ctx) {for (i=0; i<args.length; i++) may(args[i].doAnimation).apply(args[i], [ctx])},
                    initAnimation: function(ctx) {for (i=0; i<args.length; i++) may(args[i].initAnimation).apply(args[i], [ctx])},
                    undoAnimation: function(ctx) {for (i=0; i<args.length; i++)  may(args[i].undoAnimation).apply(args[i], [ctx])}
                }
            }
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
                    throw "Error while initializing "+$(this).attr('id')+", please ensure you have setup the required parameters."
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