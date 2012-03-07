/*!
Deck JS - deck.simplemath
Copyright (c) 2012 Rémi Emonet,
using a modified version of the script from http://gold-saucer.afraid.org/mathml/greasemonkey/ by Steve Cheng
*/

/*
This module provides a support for latex equation syntax.
*/

(function($, deck, undefined) {
    var $d = $(document);
    var may = function(f) {return f ? f : function() {}};



    var startsWith = function(longStr, part) {return longStr.substr(0, part.length) == part;}

    var interpretationOfSmartLanguage = function(smart, doc) {
        var res = new Array();
        var inSlide = null;
        var indent = "";
        var deepestList = null;
        var remain = smart;
        
        var setEnrichedContent = function(what, content) {return what.innerHTML = content;}
        var endSlide = function() {
            inSlide = null;
            indent = new Array();
            indent = "";
            deepestList = null;
        }
        
        while (true) {
            var nl = remain.indexOf("\n");
            var line = remain.substring(0, nl).replace(/^ */, "");
            // we iterate over the lines
            // treat trailing classes before anything
            var addClasses = "";
            {
                while (line.match(/^(.*)\[([^\] ]*)\]$/)) {
                    addClasses = RegExp.$2 + " " + addClasses;
                    line = RegExp.$1;
                }
            }
            if (line == "") {
            } else if (line.match(/^==(.*)==$/)) {
                var title = RegExp.$1;
                if (inSlide) endSlide();
                inSlide = doc.createElement("section");
                $(inSlide).addClass("slide");
                if (addClasses != "") $(inSlide).addClass(addClasses);
                var h = doc.createElement("h1");
                setEnrichedContent(h, title);
                inSlide.appendChild(h);
                deepestList = inSlide;
                res[res.length] = inSlide;
            } else if (line.match(/^=(.*)=$/)) {
                var title = RegExp.$1;
                if (inSlide) endSlide();
                inSlide = doc.createElement("section");
                $(inSlide).addClass("slide");
                if (addClasses != "") $(inSlide).addClass(addClasses);
                var h = doc.createElement("h2");
                setEnrichedContent(h, title);
                inSlide.appendChild(h);
                deepestList = inSlide;
                res[res.length] = inSlide;
            } else if (line.match(/^([*#]+)(.*)$/)) {
                var pref = RegExp.$1;
                var content = RegExp.$2;
                if (indent == "" && pref == "") {
                    // do not create the li
                } else if (pref == indent) {
                    var li = doc.createElement("li");
                    setEnrichedContent(li, content);
                    deepestList.appendChild(li);
                } else {
                    // un-push as needed
                    while (! startsWith(pref, indent)) {
                        deepestList = deepestList.parentNode;
                        indent = indent.substr(0, indent.length - 1);
                    }
                    // re-push as needed
                    while (pref.length > indent.length) {
                        var asso = {"*": "ul", "#": "ol"};
                        var toPush = pref.substr(indent.length, 1);
                        indent = indent.concat(toPush);
                        var list = doc.createElement(asso[toPush]);
                        deepestList.appendChild(list);
                        deepestList = list;
                    }
                    var li = doc.createElement("li");
                    setEnrichedContent(li, content);
                    deepestList.appendChild(li);
                }
            } else if (startsWith(line, "@SVG:")) {
                var parts = line.replace(/@SVG\: */, "").split(/ +/);
                $("<object type='deckjs/asvg'/>").addClass(parts[0])
                    .append($("<param name='src'/>").attr("value", parts[1]))
                    .append($("<param name='width'/>").attr("value", parts[2]))
                    .append($("<param name='height'/>").attr("value", parts[3]))
                    .appendTo(inSlide);
            } else if (startsWith(line, "@ANIM:")) {
                line = line.replace(/@ANIM\:/, "");
                var animContent = "";
                while (line != null && !line.match(/^@END$/)) {
                    if (nl != -1) remain = remain.substring(nl + 1);
                    animContent += "  " + line + "\n";
                    nl = remain.indexOf("\n");
                    line = remain.substring(0, nl).replace(/^ */, "");
                }
                $("<pre/>").addClass("animate").text("function(slide){"+animContent+"}").appendTo(inSlide);
            } else {
                while (true) {
                    try {
                        deepestList.innerHTML = deepestList.innerHTML + line;
                        break;
                    } catch (e) {
                        remain = remain.substring(nl + 1);
                        nl = remain.indexOf("\n");
                        var line2 = remain.substring(0, nl).replace(/^ */, "");
                        line = line + "\n" + line2;
                    }
                }
            }
            if (nl != -1) remain = remain.substring(nl + 1);
            else break;
        }
        return res;
    }
    
    $(function() {
        var container = $[deck]('getContainer');
        $('.latex', container).each(function() {
            var it = this;
            var v = $(it).text();
            it.innerHTML = "$"+v+"$";
            new latex2mml().patch_element(it);
        });
    });

})(jQuery, 'deck');