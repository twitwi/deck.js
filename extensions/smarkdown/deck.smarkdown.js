/*!
Deck JS - deck.smarkdown
Copyright (c) 2014-2014 Rémi Emonet
Licensed under the MIT license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
*/

/*
This module provides a support for a shorter syntax for slides, with a syntax that is closer to plain markdown.
TODO:
- configurize the .smark and the default duration also
- have a shortcut for {slide}?

*/

(function($, deck, undefined) {
    var $d = $(document);
    var may = function(f) {return f ? f : function() {}};
    var endsWith = function(longStr, part) {return longStr.indexOf(part, longStr.length - part.length) !== -1;}
    var REST = null;
    var startsWith = function(longStr, part) {
        if (part == "%+class:") alert(":::"+longStr+":::");
        var res = longStr.substr(0, part.length) == part;
        REST = res ? longStr.slice(part.length) : null;
        RESTRIM = res ? REST.replace(/^ */, "") : null;
        return res;
    }
    var startsWithIgnoreCase = function(longStr, part) {
        var res = longStr.substr(0, part.length).toUpperCase() == part.toUpperCase();
        REST = res ? longStr.slice(part.length) : null;
        RESTRIM = res ? REST.replace(/^ */, "") : null;
        return res;
    }

    // the animation duration is stateful across the smarkdown sections
    var animationDuration = 400;

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
        ensureHasAttributes(o);
        if (o[1][a])
            o[1][a] += " " + c;
        else
            o[1][a] = c;
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
                    addSpaceSeparatedAttr(tree, "data-container-class", decorations[d].slice(1));
                }
                addClass(tree, decorations[d]);
            }                
        }
    }
    function possiblyHideIfEmpty(tree) { // if it contains only anim stuf etc
        var hide = false;
        var i = isObject(tree[1]) ? 2 : 1;
        function onlyDivAnims(tt) {
            var only = true;
            var start = isObject(tt[1]) ? 2 : 1;
            Array.forEach(tt.slice(start), function(e) {
                if (!Array.isArray(e) || !isObject(e[1]) || (" "+e[1]["class"]).indexOf(" anim-") == -1) {
                    only = false;
                }
            });
            return only;
        }

        if (onlyDivAnims(tree)) hide = true;
        else if (tree.length == i+1 && Array.isArray(tree[i]) && tree[i][0] == "p"
                 && onlyDivAnims(tree[i])) hide = true;
        if (hide) {
            ensureHasAttributes(tree);
            tree[1].style = "display: none";
        }
    }
    function maybeProcessAtSomething(tree, index) {
        var line = tree[index];
        if (startsWithIgnoreCase(line, "@SVG:")) {
            var parts = RESTRIM.split(/ +/);
            var obj = ["div", {
                'data-src': parts[1],
                'data-width': parts[2],
                'data-height': parts[3],
                'class': "svg-object"
            }, ""];
            Array.forEach(parts[0].split(/,/), function (p) { addClass(obj, p); });
            tree[index] = obj;
        } else if (startsWithIgnoreCase(line, "@ANIM:")) {
            line = RESTRIM.replace(/%[+]/i, "%%"); // protect the "%+class" from being split
            var allToAdd = [];
            var parts = line.split(/ *\| */); // TODO: configurize + reconsider all separators?
            for (i in parts) {
                // process each group of simultaneous animations
                var subparts = parts[i].split(/ *\+ */);
                for (ii in subparts) {
                    var what = subparts[ii];
                    if (what == "") continue; // as a good side effect, this allows to set a "anim-continue" on all elements (e.g., put a + at the end of the line) 
                    var continuating  = ii != subparts.length-1;
                    var toAdd = ["div", {}, ""];
                    addClass(toAdd, "slide");
                    // process the individual element (reminder: animationDuration is global)
                    function dw() { addSpaceSeparatedAttr(toAdd, "data-what", REST); }
                    function dd() { addSpaceSeparatedAttr(toAdd, "data-dur", ""+animationDuration); }
                    if (startsWithIgnoreCase(what, "%duration:")) {
                        animationDuration = RESTRIM;
                        continue;
                    } else if (startsWithIgnoreCase(what, "%dur:")) {
                        animationDuration = RESTRIM;
                        continue;
                    } else if (startsWithIgnoreCase(what, "%play:")) {
                        addClass(toAdd, "anim-play");
                        dw();
                    } else if (startsWithIgnoreCase(what, "%pause:")) {
                        addClass(toAdd, "anim-pause");
                        dw();
                    } else if (startsWith(what, "%viewbox:")) {
                        addClass(toAdd, "anim-viewboxas");
                        // TODO: if REST contains ':', two params (then the target is specified, else it is just all SVGs root elements)
                        addSpaceSeparatedAttr(toAdd, "data-as", REST);
                        addSpaceSeparatedAttr(toAdd, "data-what", "svg");
                        dd();
                    } else if (startsWith(what, "%attr:")) {
                        var main = RESTRIM.split(/ *: */);
                        addClass(toAdd, "anim-attribute");
                        addSpaceSeparatedAttr(toAdd, "data-what", main[0]);
                        addSpaceSeparatedAttr(toAdd, "data-attr", main.slice(1).join(":"));
                        dd();
                    } else if (startsWith(what, "%%class:")) {
                        var main = RESTRIM.split(/ *: */);
                        addClass(toAdd, "anim-addclass");
                        addSpaceSeparatedAttr(toAdd, "data-class", main[0]);
                        addSpaceSeparatedAttr(toAdd, "data-what", main.slice(1).join(":"));
                    } else if (startsWith(what, "%-class:")) {
                        var main = RESTRIM.split(/ *: */);
                        addClass(toAdd, "anim-removeclass");
                        addSpaceSeparatedAttr(toAdd, "data-class", main[0]);
                        addSpaceSeparatedAttr(toAdd, "data-what", main.slice(1).join(":"));
                    } else if (startsWith(what, "+")) {
                        addClass(toAdd, "anim-show");
                        dw();
                    } else if (startsWith(what, "-")) {
                        addClass(toAdd, "anim-hide");
                        dw(); dd();
                    } else {
                        addClass(toAdd, "anim-show");
                        addSpaceSeparatedAttr(toAdd, "data-what", what);
                        dd();
                    }
                    if (continuating) addClass(toAdd, "anim-continue");
                    allToAdd.push(toAdd);
                }
            }
            tree.splice.apply(tree, Array.concat([index, 1], allToAdd)); // just replacing the text with allToAdd elements
        } else {
            return false;
        }
        // TODO? handle the decorations for comments
        return true;
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
        // process:
        // - the class and id decorations like    {#first hightlight slide}
        // - the @... custom notations
        // - TODO: the // for comments
        for (s in jstree) {
            if (s == 0 || (s==1 && isObject(jstree[1]))) continue;
            var slide = jstree[s];
            ensureHasAttributes(slide);
            // cleanup: first, remove first "p" in a "li" (happens when one put an empty line in a bullet list, but it would break the decorations)
            (function patch(tree){ // tree is slide or a subelement
                var i = 1;
                while (i < tree.length) {
                    if (Array.isArray(tree[i])) {
                        if (tree[i][0] === "li") {
                            var li = tree[i];
                            if (Array.isArray(li[1]) && li[1][0] === "p") {
                                li.splice.apply(li, Array.concat( [1, 1], li[1].slice(1)));
                                continue;
                            }
                        }
                        patch(tree[i]);
                    }
                    i++;
                }
            })(slide);
            // process @anim... and {} decoration
            (function patch(tree){ // tree is slide or a subelement
                var i = 1;
                while (i < tree.length) {
                    if (Array.isArray(tree[i])) patch(tree[i]);
                    else if (typeof(tree[i]) == 'string') {
                        if (maybeProcessAtSomething(tree, i)) continue;
                        else if (hasIDOrClassDecoration(tree[i])) processIDOrClassDecoration(tree, i);
                    }
                    i++;
                }
            })(slide);
            // cleanup: hide empty "li" after @anim processing
            (function patch(tree){ // tree is slide or a subelement
                var i = 1;
                while (i < tree.length) {
                    if (Array.isArray(tree[i])) {
                        if (tree[i][0] === "li" && possiblyHideIfEmpty(tree[i])) continue;
                        else patch(tree[i]);
                    }
                    i++;
                }
            })(slide);
            var hAttributes = lazyGetAttributes(slide[2]);
            slide[1] = clone(hAttributes);
            addClass(slide, 'slide');
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
