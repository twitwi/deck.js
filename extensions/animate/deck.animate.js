/*!
Deck JS - deck.clone
Copyright (c) 2011 Rémi Emonet
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
https://github.com/imakewebthings/deck.js/blob/master/GPL-license.txt
*/

/*
This module provides a support for some classical in-slide animations.
*/

(function($, deck, undefined) {
    // This next line is the color plugin from jquery
    (function(d){d.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","color","outlineColor"],function(f,e){d.fx.step[e]=function(g){if(!g.colorInit){g.start=c(g.elem,e);g.end=b(g.end);g.colorInit=true}g.elem.style[e]="rgb("+[Math.max(Math.min(parseInt((g.pos*(g.end[0]-g.start[0]))+g.start[0]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[1]-g.start[1]))+g.start[1]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[2]-g.start[2]))+g.start[2]),255),0)].join(",")+")"}});function b(f){var e;if(f&&f.constructor==Array&&f.length==3){return f}if(e=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(f)){return[parseInt(e[1]),parseInt(e[2]),parseInt(e[3])]}if(e=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(f)){return[parseFloat(e[1])*2.55,parseFloat(e[2])*2.55,parseFloat(e[3])*2.55]}if(e=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(f)){return[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]}if(e=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(f)){return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)]}if(e=/rgba\(0, 0, 0, 0\)/.exec(f)){return a.transparent}return a[d.trim(f).toLowerCase()]}function c(g,e){var f;do{f=d.curCSS(g,e);if(f!=""&&f!="transparent"||d.nodeName(g,"body")){break}e="backgroundColor"}while(g=g.parentNode);return b(f)}var a={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]}})(jQuery);

    var $d = $(document);
    var may = function(f) {return f ? f : function() {}};
    
    $.deck('extend', 'animate', function(slide) {
        return {
            appear: function(e, d) {
                d=d||0;
                return {
                    doAnimation:   function() {$(e,slide).animate({'opacity': 1.}, d) },
                    initAnimation: function() {$(e,slide).animate({'opacity': 0.}, 0) },
                    undoAnimation: function() {$(e,slide).animate({'opacity': 0.}, 0) }
                }
            },
            disappear: function(e, d) {
                d=d||0;
                return {
                    doAnimation:   function() {$(e,slide).animate({'opacity': 0.}, d) },
                    initAnimation: function() {$(e,slide).animate({'opacity': 1.}, 0) },
                    undoAnimation: function() {$(e,slide).animate({'opacity': 1.}, 0) }
                }
            },
            /* generic one */
            animate: function(e, what, to, d) {
                d=d||0;
                var whatTo = {} ; whatTo[what] = to;
                var whatFrom = {};
                return {
                    doAnimation:   function() {whatFrom[what] = $(e,slide).css(what); $(e,slide).animate(whatTo, d) },
                    initAnimation: function() {$(e,slide).animate(whatFrom, 0) },
                    undoAnimation: function() {$(e,slide).animate(whatFrom, 0) }
                }
            },
            addClass: function(e, cl) {
                return {
                    doAnimation:   function(ctx) {$(e,slide).addClass(cl)},
                    initAnimation: function(ctx) {$(e,slide).removeClass(cl)},
                    undoAnimation: function(ctx) {$(e,slide).removeClass(cl)}
                }
            },
            removeClass: function(e, cl) {
                return {
                    doAnimation:   function(ctx) {$(e,slide).removeClass(cl)},
                    initAnimation: function(ctx) {$(e,slide).addClass(cl)},
                    undoAnimation: function(ctx) {$(e,slide).addClass(cl)}
                }
            },
            withDelay: function(d, a) {
                return {
                    doAnimation:   function(ctx) {setTimeout(function() {may(a.doAnimation).apply()}, d);},
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
                    doAnimation:   function(ctx) {for (i=0; i<args.length; i++) may(args[i].doAnimation).apply(args[i], [ctx])},
                    initAnimation: function(ctx) {for (i=args.length-1; i>=0; i--) may(args[i].initAnimation).apply(args[i], [ctx])},
                    undoAnimation: function(ctx) {for (i=args.length-1; i>=0; i--)  may(args[i].undoAnimation).apply(args[i], [ctx])}
                }
            }
            // todo: noInit: function(a) { ... }
        }

    });

})(jQuery, 'deck');