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
	selectors: {
            svgObject: "object[type='deckjs/svg'], div.svg-object"
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
        },
        referencingAttributes: ["clip-path", "color-profile", "fill", "filter", "marker-start", "marker-mid", "marker-end", "mask", "stroke"],
        nextId: 1,
        generateId: function(oldId) {
            var id = "uniquesvg"+svgPatcher.nextId;
            svgPatcher.nextId++;
            return id;
        },
        makeReferencedIdsUnique: function(root, svgfile, continuation) {
            var andThen = continuation || function(){}
            var byId = {};
            var referencersIds = {};
            var pushAdd = function(k, o) {
                if (referencersIds[k]) {
                    referencersIds[k].push(o);
                } else {
                    referencersIds[k] = [ o ];
                }
            };
            // gather all ids and references
            walk(root, function() {
                var that = this;
                var $n = $(this);
                var id = that.id;
                if (id) {
                    byId[id] = this;
                }
                $(svgPatcher.referencingAttributes).each(function(i,attr) {
                    var val = $n.attr(attr);
                    if (val) {
                        var groups = val.trim().match(/^url\(#(.+?)\)$/)
                        if (groups) pushAdd(groups[1], {o:that, a:attr})
                    }
                });
                var xlink = $n.attr("xlink:href");
                if (xlink) {
                    var groups = xlink.trim().match(/^#(.+?)$/)
                    if (groups) pushAdd(groups[1], {o:that, a:"xlink:href"})
                }
            })
            // patch used ids and references (keep unreferenced ids fixed (to allow for identification from the editor to the css, even if classes should be preferred))
            var newIds = {};
            for (id in referencersIds) {
                var newId = svgPatcher.generateId(id);
                byId[id].id = newId;
                newIds[id] = newId;
            }

            setTimeout( // to help firefox in having updated ids
                (function() {
                for (id in referencersIds) {
                    var newId = newIds[id];
                    var refs = referencersIds[id];
                    $(refs).each(function(i,pair){
                        var prev = $(pair.o).attr(pair.a);
                        if (pair.a == "xlink:href") {
                            pair.o.setAttributeNS($.svg.xlinkNS, "href", prev.replace("#" + id, "#" + newId));
                        } else {
                            $(pair.o).attr(pair.a, prev.replace("#" + id, "#" + newId));
                        }
                    })
                        }
                    andThen();
                }), 0)

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
            $.each(objectElement.attributes, function (index, attr) {
                if ("data-" == attr.name.substr(0, 5)) {
                    attributes[attr.name.substr(5)] = attr.value;
                }
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

            /* Find all the object of type deckjs/svg */
            if ($slide == null) return true;
            // TODO: allow loading from a div with data-* values (to avoid missing plugin message)
            $slide.find(opts.selectors.svgObject).each(function(index, obj) {
                /* Load attributes and validate them */
                var attributes = loadObjectParams(obj);
                if (!validateParams(attributes) ) {
                    throw "Error while initializing "+$(obj).attr('id')+", please ensure you have setup the required parameters."
                    return false;
                }
                
                /* Create SVG placeholder */
                var SVG = createSVG(obj, attributes);
                $(obj).replaceWith(SVG);
                
                // Finaly load the SVG data
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
                                $[deck]("animWaitLess");
                            } else {
                                var to = "0 0 " + px(w) + " " + px(h);
                                $svg.root().setAttribute("viewBox", to);
                                aa.attr("svgViewBox", to);
                                if (attributes['stretch'] == 'true') $svg.root().setAttribute('preserveAspectRatio', "none");
                                // TODO: make each optional based on parameters of the loader
                                svgPatcher.styleToAttributes($svg.root(), attributes['src']);
                                svgPatcher.makeReferencedIdsUnique($svg.root(), attributes['src'], function() {
                                    $[deck]("animWaitLess");
                                });
                            }
                        }
                    }
                });
            });
        });
        $[deck]("animWaitLess");
    })
    
    
})(jQuery, 'deck');

