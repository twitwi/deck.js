/*!
Deck JS - deck.smartsyntax
Copyright (c) 2012 Rémi Emonet
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
https://github.com/imakewebthings/deck.js/blob/master/GPL-license.txt
*/

/*
This module provides a support for a shorter syntax for slides.
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

        var processMath = function(content) {
            return content.replace(/\$([^$][^$]*)\$/g, '<span class="latex">$1</span>').replace(/\$\$/, '$');
        }
        
        var setEnrichedContent = function(what, content) {
            content = processMath(content);
            return what.innerHTML = content;
        }
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
                    if (addClasses != "") $(li).addClass(addClasses);
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
                    if (addClasses != "") $(li).addClass(addClasses);
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
            } else if (startsWith(line, "@ANIM-SVG-APPEAR:")) {
                line = line.replace(/@ANIM-SVG-APPEAR\: */, "");
                var animContent = "";
                var main = line.split(/ *: */);
                var dur = main[1];
                var parts = main[2].split(/ *\| */);
                animContent += 'var a = $[deck]("svgAnimate", slide, "'+main[0]+'");'; // todo could warn on missing trailing '.'
                animContent += '$[deck]("addAnimationSequence", slide, [';
                for (i in parts) {
                    var subparts = parts[i].split(/ *\+ */);
                    if (i != 0) animContent += ",\n   ";
                    if (subparts.length == 1) {
                        animContent += 'a.appear("'+subparts[0]+'", '+dur+')';
                    } else {
                        animContent += "[";
                        for (ii in subparts) {
                            if (ii != 0) animContent += ",";
                            animContent += 'a.appear("'+subparts[ii]+'", '+dur+')';
                        }
                        animContent += "]";
                    }
                }
                animContent += "]);";
                $("<pre/>").addClass("animate").text("function(slide){"+animContent+"}").appendTo(inSlide);
            } else if (startsWith(line, "@<")) {
                line = line.replace(/^@/, "");
                var contentToAdd = "";
                // test on remain to avoid infinite loop
                while (line != null && remain.length != 0) {
                    if (line.match(/^@<\//)) {
                        // normal stopping condition
                        line = line.replace(/^@/, "");
                        contentToAdd += "  " + line + "\n";
                        break;
                    }
                    if (nl != -1) remain = remain.substring(nl + 1);
                    contentToAdd += "  " + line + "\n";
                    nl = remain.indexOf("\n");
                    line = remain.substring(0, nl).replace(/^ */, "");
                }
                deepestList.innerHTML = deepestList.innerHTML + processMath(contentToAdd) + " ";
            } else {
                while (true) {
                    try {
                        deepestList.innerHTML = deepestList.innerHTML + processMath(line) + " ";
                        break;
                    } catch (e) {
                        // TODO was ok with xhtml not really now
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

    // this have to be executed before the deck init
    $d.bind('deck.beforeInit', function() {
            $('.smart').each(function() {
                    var it = this;
                    var slides = interpretationOfSmartLanguage(it.innerHTML, document);
                    it.innerHTML = ""; // clear the smart node
                    $(it).after(slides);
                });
        });

})(jQuery, 'deck');