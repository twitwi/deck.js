/*!
Deck JS - deck.svg.toc
Copyright (c) 2011 Remi BARRAQUAND
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
https://github.com/imakewebthings/deck.js/blob/master/GPL-license.txt
*/

/*
This module provides a support for SVG to the deck so as to create animation
like in most presentation solution e.g powerpoint, keynote, etc.
Slides can include svg documents which then can be animated using the
Jquery-SVG plugins.
*/

(function($, deck, undefined) {
    var $d = $(document);
        
    this.loadObjectParams = function(objectElement) {
        var attributes = {};
        $(objectElement).children("param").each(function(index){
            attributes[$(this).attr("name")] = $(this).attr("value");
        });
        return attributes;
    }
    
    /*
	Extends defaults/options.
	*/
    $.extend(true, $[deck].defaults, {
        
        });
    
    /*
	jQuery.deck('createAnimation', target, loadURL, onLoad, anims)
	
        ...
	*/
    $[deck]('extend', 'createAnimation', function(element) {
        //alert('creating new animation '+element);
        });
    
    /*
        jQuery.deck('Init')
        */
    $d.bind('deck.init', function() {
        var opts = $[deck]('getOptions');
        var container = $[deck]('getContainer');

        /* Go through all slides */
        $.each($[deck]('getSlides'), function(i, $el) {
            var slide = $[deck]('getSlide',i);
            
            /* find all the object of type deckjs/svg */
            slide.children("object[type='deckjs/svg']").each(function(index) {
                // load object's attributes
                var attributes = loadObjectParams(this);
               
                // create canvas
                var $canvas = $("<div />").attr({
                    'id':  $(this).attr('id'),
                    'class': $(this).attr('class')
                }).css({
                    'height': attributes['height'],
                    'width': attributes['width']
                });
                
                // create control
                var $control = $("<div />").addClass('deck-svg-control')
                .append($("<a href=\"#\"></a>").attr({'id':'deck-svg-prev', 'class':'deck-svg-button'}))
                .append($("<a href=\"#\"></a>").attr({'id':'deck-svg-reload', 'class':'deck-svg-button'}))
                .append($("<a href=\"#\"></a>").attr({'id':'deck-svg-next', 'class':'deck-svg-button'}));     
                    
                // create placeholder
                var $placeholder = $("<div />")
                .addClass('deck-svg')
                .append($canvas)
                .append($control);
                
                // repace object element by placeholder
                $(this).replaceWith($placeholder);
                
                // init canvas
                $canvas.svg({
                    loadURL: attributes['src'],
                    onLoad: function(svg) {
                        $("#circleRed",svg.root()).hide();
                        $("#circleBlue",svg.root()).hide();
                        $("#circleGreen",svg.root()).show();
                    },
                    settings: {}
                });
            });
        });
    })
    /* Update current slide number with each change event */
    .bind('deck.change', function(e, from, to) {
        var opts = $[deck]('getOptions');
        var slideTo = $[deck]('getSlide', to);
        var container = $[deck]('getContainer');
	
    // do nothing
    });
})(jQuery, 'deck');