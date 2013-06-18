/*!
Deck JS - deck.svg
Copyright (c) 2012 Rémi Emonet, as a major refactor from an early version from Rémi Barraquand.
*/

/*
This module provides a support for managed svg inclusion (allowing proper DOM access subsequently for animations, etc.).
*/

(function($, deck, undefined) {
    var $d = $(document);
    var may = function(f) {return f ? f : function() {}};

    $.extend(true, $[deck].defaults, {
        classes: {
            svgPlaceholder: 'deck-svg'
        },
        alert: {
            missingSVG: true
        }
    });

    function walk(node, fn) {
        if (node) do {
            if (node.nodeType === 1) {
                fn.call(node);
                walk(node.firstChild, fn);
            }
        } while (node = node.nextSibling);
    }
    var svgPatcher = {
        styleToAttributes: function(root, svgfile) {
            walk(root, function() {
                var $n = $(this);
                if ($n.attr("style")) {
                    $($n.attr("style").trim().split(/ *; */)).each(function(index, style) {
                        if (style && style.substring(0,1) != "-") {
                            var s = style.trim().split(/ *: */);
                            $n.attr(s[0], s[1]);
                        }
                    });
                }
                $n.attr("style", null);
            })
        }
    }

    /*
      jQuery.deck('Init')
    */
    $[deck]("animWaitMore"); // ensure we wait for the initialization of "svg" ext to end "anim" init
    $d.bind('deck.init', function() {
        var opts = $[deck]('getOptions');
        var container = $[deck]('getContainer');

        /*
          Load parameters from an Object element
        */
        var loadObjectParams = function(objectElement) {
            var attributes = {};
            $(objectElement).children("param").each(function(index){
                attributes[$(this).attr("name")] = $(this).attr("value");
            });
            return attributes;
        }
        
        /*
          Return true if default params are set.
        */
        var validateParams = function(params) {
            return params['src'];// && params['width'] && params['height'];// && params['animator'];
        }
        
        /*
          Create SVG placeholder
        */
        var createSVG = function(object, attributes) {
            var $canvas, $control, $next, $reload, $placeholder;
            
            /* Create svg canvas */
            $canvas = $("<div />").attr({
                'id':  $(object).attr('id'),
                'data-src': attributes['src'],
                'class': opts.classes.svgPlaceholder + " " + $(object).attr('class')
            }).css({
                'height': attributes['height'],
                'width': attributes['width']
            });
            return $canvas;
        }

        
        /* Go through all toplevel slides */
        $($[deck]('getSlides')).each( function(i, $el) {
            var $slide = $[deck]('getSlide', i);

            /*
            if ($slide.has("object[type='deckjs/svg']").length>0) {
                $slide.data('animators', new Array());
            }*/
            
            /* Find all the object of type deckjs/svg */
            if ($slide == null) return true;
            $slide.find("object[type='deckjs/svg']").each(function(index, obj) {
                //var id = $(this);
                /* Load attributes and validate them */
                var attributes = loadObjectParams(obj);
                if (!validateParams(attributes) ) {
                    throw "Error while initializing "+$(obj).attr('id')+", please ensure you have setup the required parameters."
                    return false;
                }
                
                /* Add this animator to the list of animators of the current slide. */
                //$slide.data('animators').push(attributes['animator']);
                
                /* Create SVG placeholder */
                var SVG = createSVG(obj, attributes);
                $(obj).replaceWith(SVG);
                
                // Finaly load the SVG data
                //$[deck]('addLoading');
                $[deck]("animWaitMore");
                SVG.svg({
                    loadURL: attributes['src'],
                    onLoad: function($svg, w, h) {
                        var px = function (str) {return str.replace("px", "")}
                        var aa = $($svg.root());
                        if (aa.attr('viewBox') == undefined) {
                            if (w==undefined || h==undefined) {
                                if (opts.alert.missingSVG) alert(
                                    "There seem to be a problem with the loading of\n   '"+attributes['src'] + "'\n"
                                        +"\nMaybe the file does not exist?"
                                        +"\nOr maybe"
                                        +"\n - it has no w or h attribute?"
                                        +"\n - you're using chrome with local files?"
                                        +"\n   ⇒ try to restart chrome with '--disable-web-security'");
                            } else {
                                var to = "0 0 " + px(w) + " " + px(h);
                                $svg.root().setAttribute("viewBox", to);
                                aa.attr("svgViewBox", to);
                                if (attributes['stretch'] == 'true') $svg.root().setAttribute('preserveAspectRatio', "none");
                                svgPatcher.styleToAttributes($svg.root(), attributes['src']);
                            }
                        }
                        $[deck]("animWaitLess");
                        /*
                          $[deck]('removeLoading')
                        */
                    }
                });
            });
        });
        $[deck]("animWaitLess");
    })
    
    
})(jQuery, 'deck');

