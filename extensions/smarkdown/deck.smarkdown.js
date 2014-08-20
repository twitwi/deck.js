/*!
Deck JS - deck.smarkdown
Copyright (c) 2014-2014 Rémi Emonet
Licensed under the MIT license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
*/

/*
This module provides a support for a shorter syntax for slides, with a syntax that is closer to plain markdown.
TODO:
- configurize the .smark
- review for simpler and unified @anim-appear etc
- have a shortcut for {slide}

*/

(function($, deck, undefined) {
    var $d = $(document);
    var may = function(f) {return f ? f : function() {}};
    var startsWith = function(longStr, part) {return longStr.substr(0, part.length) == part;}
    var endsWith = function(longStr, part) {return longStr.indexOf(part, longStr.length - part.length) !== -1;}
    var startsWithIgnoreCase = function(longStr, part) {return longStr.substr(0, part.length).toUpperCase() == part.toUpperCase();}
    var maybeAddClasses = function(toWhat, spaceSeparatedClasses, uniqueId) {
        if (uniqueId != "") $(toWhat).attr("id", uniqueId);
        if (spaceSeparatedClasses == "") return;
        var parts = spaceSeparatedClasses.split(/ +/);
        for (i in parts) {
            if (startsWith(parts[i], "*")) {
                $(toWhat).attr("data-container-class", parts[i].substring(1));
            } else {
                $(toWhat).addClass(parts[i]);
            }
        }
    }

    function clone(a) { return JSON.parse(JSON.stringify(a)) }
    function findTag(tree, regexp, startAt=0) {
        var i = startAt;
        while (i < tree.length) {
            if (Array.isArray(tree[i]) && tree[i][0].match(regexp)) {
                return i;
            }
            i++;
        }
        return -1;
    }
    function addSpaceSeparatedAttr(o, a, c) {
        if (o[a])
            o[a] += " " + c;
        else
            o[a] = c;
    }
    function addClass(o, c) {
        addSpaceSeparatedAttr(o, 'class', c);
    }
    function isObject(o) {
        return !Array.isArray(o) && typeof(o) === 'object';
    }
    function ensureHasAttributes(tree) {
        if (!isObject(tree[1])) {
            tree.splice(1, 0, {});
            return true;
        }
        return false;
    }
    function lazyGetAttributes(tree) {
        if (isObject(tree[1])) {
            return tree[1];
        } else {
            return {};
        }
    }
    function hasIDOrClassDecoration(s) {
        return s.match(/^(.*)\{([^{}<>]*)\}$/);
    }
    function processIDOrClassDecoration(tree, index) {
        var matched = hasIDOrClassDecoration(tree[index]); // make sure the group is set
        if (!matched) { alert("should call processIDOrClassDecoration() only if hasIDOrClassDecoration is true"); return; }
        var base = RegExp.$1;
        var decorations = RegExp.$2.split(/ +/);
        if (ensureHasAttributes(tree)) {
            if (index>0) index++;
        }
        tree[index] = base;
        for (d in decorations) {
            // allow .class and class notations
            if (startsWith(decorations[d], ".")) decorations[d] = decorations[d].slice(1);

            if (startsWith(decorations[d], "#")) {
                tree[1].id = decorations[d].slice(1);
            } else {
                if (startsWith(decorations[d], "*")) {
                    addSpaceSeparatedAttr(tree[1], "data-container-class", decorations[d].slice(1));
                }
                addClass(tree[1], decorations[d]);
            }                
        }
    }

    var interpretationOfSmartLanguage = function(smark, doc) {
        console.log(smark)
        var jstree = markdown.toHTMLTree(smark);
        
        console.log(clone(jstree));
        // split at each h2 or h1
        (function makeTopLevelDivs(jsTree) {
            var firstIndex = findTag(jsTree, /^(h1|h2)$/);
            if (firstIndex == -1) return;
            var secondIndex = findTag(jsTree, /^(h1|h2)$/, firstIndex+1);
            if (secondIndex == -1) secondIndex = jsTree.length;
            var slide = Array.concat(
                ["section"], // we will add the 'slide' class later below
                jsTree.splice(firstIndex, secondIndex - firstIndex));
            jsTree.splice(firstIndex, 0, slide);
            makeTopLevelDivs(jsTree);
        })(jstree);

        console.log(clone(jstree));
        // process the {#… .…} and @stuff and //… stuff
        for (s in jstree) {
            if (s == 0 || (s==1 && isObject(jstree[1]))) continue;
            var slide = jstree[s];
            (function patch(tree){ // tree is slide or a subelement
                var i = 1;
                while (i < tree.length) {
                    if (Array.isArray(tree[i])) patch(tree[i]);
                    else if (typeof(tree[i]) == 'string'
                             && hasIDOrClassDecoration(tree[i])
                            ) {
                        processIDOrClassDecoration(tree, i);
                    }
                    i++;
                }
            })(slide);
            console.log("SLIDE")
            console.log(clone(slide))
            ensureHasAttributes(slide);
            var hAttributes = lazyGetAttributes(slide[2]);
            console.log(clone(slide[2]))
            console.log(clone(hAttributes))
            slide[1] = clone(hAttributes);
            addClass(slide[1], 'slide');
        }

        console.log(clone(jstree));
        return markdown.renderJsonML(jstree);
    }

    // this have to be executed before the deck init
    $d.bind('deck.beforeInit', function() {
        $('.smark').each(function() { // TODO make it configurable
            var it = this;
            var slides = interpretationOfSmartLanguage(it.innerHTML, document);
            $(it).after(slides);
            // remove the smart node (to avoid having an empty non-slide sibling (e.g., in the presenter view))
            $(it).remove();
        });
        $[deck]('reInitSlidesArray')
    });

})(jQuery, 'deck');
