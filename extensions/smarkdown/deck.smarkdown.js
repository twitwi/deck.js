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
    var isArray = Array.isArray || $.isArray; // there is also an alternative in markdownjs

    // the animation duration is stateful across the smarkdown sections
    var animationDurationDefault = 400;
    var animationDuration = animationDurationDefault;

    function clone(a) { return JSON.parse(JSON.stringify(a)) }
    function findTag(tree, regexp, startAt) {
        var i = startAt || 0;
        while (i < tree.length) {
            if (isArray(tree[i]) && tree[i][0].match(regexp)) {
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
    function hasClass(o, c) {
        if (!isObject(o[1]) || !o[1]['class']) {
            return false;
        } else {
            return o[1]['class'].match(new RegExp("\\b"+c+"\\b"));
        }
    }
    function isObject(o) {
        return !isArray(o) && typeof(o) === 'object';
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
    function lazyUnsetAttributes(tree) {
        if (isObject(tree[1])) {
            tree.splice(1, 1);
        }
    }
    function hasIDOrClassDecoration(s) {
        return s.match(/^(.*)\{([^{}<>]*)\}$/);
    }
    function maybeProcessCopySlide(tree, index) {
        var slide = tree[index];
        ensureHasAttributes(slide);
        if (slide.length != 3) return false;
        if (slide[2][0] != "h1") return false;
        ensureHasAttributes(slide[2]);
        if (startsWithIgnoreCase(slide[2][2], "@COPY:#")) {
            var main = RESTRIM.split(/:/);
            var idOfBase = main[0];
            var animPart = main.slice(1).join(":");
            var hasAnim = ! animPart.match(/^\s*$/);
            var base = null;
            for (i in tree) {
                if (i == 0 || (i==1 && isObject(tree[1]))) continue;
                ensureHasAttributes(tree[i]);
                if (tree[i][1].id == idOfBase) {
                    base = tree[i];
                    break;
                }
            }
            if (base == null) { alert("pb"); return false; } // TODO should alert based on options
            var content = [["div", {}, "@anim:" + animPart]];
            content = content.concat(clone(base.slice(2)));
            slide[1] = clone(base[1]);
            delete slide[1].id;
            if (hasAnim) addClass(slide, "anim-continue");
            slide.splice.apply(slide, [2, 1].concat(content)); // replace the h1 with content
            return true;
        }
        return false;
    }
    function processIDOrClassDecoration(tree, index) {
        var matched = hasIDOrClassDecoration(tree[index]); // make sure the group is set
        if (!matched) { alert("should call processIDOrClassDecoration() only if hasIDOrClassDecoration is true"); return; }
        var returnValue = false; // whether we added the attributes
        var base = RegExp.$1;
        var decorations = RegExp.$2.split(/ +/);
        if (ensureHasAttributes(tree)) {
            if (index>0) index++;
            returnValue = true;
        }
        tree[index] = base;
        for (d in decorations) {
            // allow .class and class notations
            if (startsWith(decorations[d], ".")) decorations[d] = decorations[d].slice(1);

            if (startsWith(decorations[d], "#")) {
                tree[1].id = decorations[d].slice(1);
            } else {
                if (startsWith(decorations[d], "*") | startsWith(decorations[d], "/")) {
                    addSpaceSeparatedAttr(tree, "data-container-class", decorations[d].slice(1));
                } else {
                    addClass(tree, decorations[d]);
                }
            }                
        }
        return returnValue;
    }
    function possiblyHideIfEmpty(tree) { // if it contains only anim stuf etc
        var hide = false;
        var i = isObject(tree[1]) ? 2 : 1;
        function onlyDivAnims(tt) {
            var only = true;
            var start = isObject(tt[1]) ? 2 : 1;
            tt.slice(start).forEach(function(e) {
                if (!isArray(e) || !isObject(e[1]) || (" "+e[1]["class"]).indexOf(" anim-") == -1) {
                    only = false;
                }
            });
            return only;
        }

        if (onlyDivAnims(tree)) hide = true;
        else if (tree.length == i+1 && isArray(tree[i]) && tree[i][0] == "p"
                 && onlyDivAnims(tree[i])) hide = true;
        if (hide) {
            ensureHasAttributes(tree);
            tree[1].style = "display: none";
        }
    }
    function maybeProcessComment(tree, index) {
        var line = tree[index];
        var clean = function(s) { return s;}; //return s.replace(/\/\\\//g, '//'); };
        if (line.match(/^(.*?)[\n\s]*\/\/ +(.*)/)) {
            var obj = ["div", {
                'class': "comment"
            }, clean(RegExp.$2)];
            tree.splice(index, 1, RegExp.$1, obj);
            return true;
        }
        tree[index] = clean(tree[index]);
        return false;
    }
    function maybeProcessAtSomething(tree, index) {
        var line = tree[index];
        if (startsWithIgnoreCase(line, "@SVG:")) {
            var content = RESTRIM
            var parts = content.split(/ +/);
            if (hasIDOrClassDecoration(content) || parts.length == 3) {
                // new version
                var obj = ["div", {
                    'data-src': parts[0],
                    'data-width': parts[1],
                    'data-height': parts[2],
                    'class': "svg-object"
                }, parts.slice(3).join(" ")];
                // TODO: alert when wrong number of args
                if (hasIDOrClassDecoration(content)) processIDOrClassDecoration(obj, 2);
                tree[index] = obj;
            } else {
                // TODO allow this only when an option is set option
                // old, smartsyntax version
                var obj = ["div", {
                    'data-src': parts[1],
                    'data-width': parts[2],
                    'data-height': parts[3],
                    'class': "svg-object"
                }, ""];
                parts[0].split(/,/).forEach(function (p) { addClass(obj, p); });
                tree[index] = obj;
            }
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
                        animationDuration = RESTRIM == "" ? animationDurationDefault : RESTRIM;
                        continue;
                    } else if (startsWithIgnoreCase(what, "%dur:")) {
                        animationDuration = RESTRIM == "" ? animationDurationDefault : RESTRIM;
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
                    } else if (startsWith(what, "%along:")) {
                        var main = RESTRIM.split(/ *: */);
                        addClass(toAdd, "anim-along");
                        if (startsWith(main[0], "-")) {
                            main[0] = RESTRIM;
                            addSpaceSeparatedAttr(toAdd, "data-reverse", "true");
                        }
                        addSpaceSeparatedAttr(toAdd, "data-path", main[0]);
                        addSpaceSeparatedAttr(toAdd, "data-what", main.slice(1).join(":"));
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
            tree.splice.apply(tree, [index, 1].concat(allToAdd)); // just replacing the text with allToAdd elements
        } else {
            return false;
        }
        // TODO? handle the decorations for comments
        return true;
    }
    function processMath(content) {
        return content.replace(/\$([^$][^$]*)\$/g, '<span class="latex">\\displaystyle $1</span>').replace(/\$\$/, '$');
    }

    var interpretationOfSmartLanguage = function(smark, doc) {
        var jstree = markdown.toHTMLTree(smark);
        
        // split at each h2 or h1
        (function makeTopLevelDivs(jsTree) {
            var firstIndex = findTag(jsTree, /^(h1|h2)$/);
            if (firstIndex == -1) return;
            var secondIndex = findTag(jsTree, /^(h1|h2)$/, firstIndex+1);
            if (secondIndex == -1) secondIndex = jsTree.length;
            var slide = ["section"].concat( // we will add the 'slide' class later below
                jsTree.splice(firstIndex, secondIndex - firstIndex));
            jsTree.splice(firstIndex, 0, slide);
            makeTopLevelDivs(jsTree);
        })(jstree);

        // process:
        // - the class and id decorations like    {#first hightlight slide}
        // - the @... custom notations
        // - the // for comments
        for (s in jstree) {
            if (s == 0 || (s==1 && isObject(jstree[1]))) continue;
            var slide = jstree[s];
            ensureHasAttributes(slide);
            if (maybeProcessCopySlide(jstree, s)) {
                //continue;
                // actually we want to apply anims to it
            }
            // cleanup: first, remove first "p" in a "li" (happens when one put an empty line in a bullet list, but it would break the decorations)
            (function patch(tree){ // tree is slide or a subelement
                var i = 1;
                while (i < tree.length) {
                    if (isArray(tree[i])) {
                        if (tree[i][0] === "li") {
                            var li = tree[i];
                            if (isArray(li[1]) && li[1][0] === "p") {
                                li.splice.apply(li, [1, 1].concat(li[1].slice(1)));
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
                    if (isArray(tree[i])) patch(tree[i]);
                    else if (typeof(tree[i]) == 'string') {
                        if (maybeProcessComment(tree, i)) continue;
                        else if (maybeProcessAtSomething(tree, i)) continue;
                        else if (hasIDOrClassDecoration(tree[i])) {
                            if (processIDOrClassDecoration(tree, i)) {
                                i++; // avoid processing the same element twice
                            }
                        }
                    }
                    i++;
                }
            })(slide);
            // cleanup: hide empty "li" after @anim processing
            (function patch(tree){ // tree is slide or a subelement
                var i = 1;
                while (i < tree.length) {
                    if (isArray(tree[i])) {
                        if (tree[i][0] === "li" && possiblyHideIfEmpty(tree[i])) continue;
                        else patch(tree[i]);
                    }
                    i++;
                }
            })(slide);
            // process the $math$
            (function patch(tree){ // tree is slide or a subelement
                if (hasClass(tree, "smark-nomath")) return;
                var i = 1;
                while (i < tree.length) {
                    if (isArray(tree[i])) patch(tree[i]);
                    else if (typeof(tree[i]) == 'string') {
                        tree[i] = processMath(tree[i]);
                    }
                    i++;
                }
            })(slide);
            // change things to textarea (to help with codemirror) https://github.com/iros/deck.js-codemirror/issues/19
            (function patch(tree){ // tree is slide or a subelement
                if (hasClass(tree, "smark-textarea")) {
                    tree[3][0] = "textarea";
                }
                var i = 1;
                while (i < tree.length) {
                    if (isArray(tree[i])) patch(tree[i]);
                    i++;
                }
            })(slide);
            // now propagate to the slide
            var hAttributes = lazyGetAttributes(slide[2]);
            if (slide[1]['class']) {
                var cl = slide[1]['class'];
                slide[1] = clone(hAttributes);
                addClass(slide, cl);
            } else {
                slide[1] = clone(hAttributes);
            }
            lazyUnsetAttributes(slide[2]);
            addClass(slide, 'slide');
        }

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
        var opts = $[deck]('getOptions');
        var maybe = function(f) { return f || (function(){}); }
        maybe(opts.AFTERSMARKDOWN)();
        $[deck]('reInitSlidesArray')
    });

})(jQuery, 'deck');
