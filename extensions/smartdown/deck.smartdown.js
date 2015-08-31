/*!
Deck JS - deck.smartdown
Copyright (c) 2015-2015 Rémi Emonet
Licensed under the MIT license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
*/

/*
This module provides a support for a shorter syntax for slides, with a syntax that is close to plain markdown.
This is actually the third try and it uses showdown.js (1st: smartsyntax, 2nd: smarkdown (using markdown.js)).

*/

(function($, deck, undefined) {
    var $d = $(document);
    var may = function(f) {return f ? f : function() {}};
    var endsWith = function(longStr, part) {return longStr.indexOf(part, longStr.length - part.length) !== -1;}
    var REST = null;
    var RESTRIM = null;
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
    function findTag(nodelist, regexp, startAt) {
        var i = startAt || 0;
        while (i < nodelist.length) {
            var tn = nodelist[i].tagName;
            if (typeof tn === 'string' && tn.match(regexp)) {
                return i;
            }
            i++;
        }
        return -1;
    }
    function addSpaceSeparatedAttr(o, a, c) {
        if (o.hasAttribute(a)) {
            o.setAttribute(a, o.getAttribute(a)+" "+c);
        } else {
            o.setAttribute(a, c);
        }
    }
    function addClass(o, c) {
        addSpaceSeparatedAttr(o, 'class', c);
    }
    function hasClass(o, c) {
        return isElement(o) && $(o).hasClass(c);
    }
    function isObject(o) {
        return !isArray(o) && typeof(o) === 'object';
    }
    function hasIDOrClassDecoration(s) {
        return s.match(/^(|([\s\S]*[^\n\r\s]))[\n\r\s]*\{([^{}<>]*)\}[\n\r]*$/);
    }
    function resolveChunk(include){
        var content = null;
        if (include.startsWith('#')) {
            content = $(include).text();
        } else {
            $.ajax({
                url: include,
                contentType: 'text/plain',
                dataType: 'text',
                async: false,
                success: function(d) { content = d; },
                error: function(jqXHR, status, err) {
                    alert("Got a '"+status+"' error in chunk '"+include+"'");
                    console.log(err);
                }
            });
        }
        return content;
    }
    function maybeProcessGenerateSlides(slides, s) {
        var slide = slides[s];
        if (!isElement(slide.firstChild) || !slide.firstChild.tagName.match(/^h1$/i)) return s;
        if (startsWithIgnoreCase(slide.firstChild.textContent, '@COPY:')) {
            var main = RESTRIM.split(/:/);
            var baseSelector = main[0];
            var animPart = main.slice(1).join(':');
            var hasAnim = ! animPart.match(/^\s*$/);
            var base = null;
            for (i in slides) {
                if ($(slides[i]).is(baseSelector)) {
                    base = slides[i];
                }
            }
            if (base == null) {
                // TODO should alert based on options
                alert("Could not find matches for selector '"+baseSelector+"' in @COPY");
                return s;
            }
            slide = $(base).clone().get(0);
            slide.removeAttribute('id');
            if (hasAnim) {
                $('<div>').text('@anim:'+animPart).insertBefore(slide.firstChild);
            }
            slides[s] = slide;
            return s;
        } else if (startsWithIgnoreCase(slide.firstChild.textContent, '@CHUNK:')) {
            var main = RESTRIM.split(/:/);
            var include = main[0];
            var content = resolveChunk(include);
            var chunkSlides = interpretationOfSmartLanguage(content, document);
            // TODO optionally prefix all ids
            Array.prototype.splice.apply(slides, [s, 1].concat(chunkSlides));
            return s;
        }
        return s;
    }
    function maybeProcessIDOrClassDecoration(txtNode) {
        var txt = txtNode.textContent;
        var matched = hasIDOrClassDecoration(txt); // make sure the group is set
        if (!matched) { return; }
        var base = RegExp.$1; // set by hasIDOrClassDecoration
        var decorations = RegExp.$3.split(/ +/);
        var node = txtNode.parentNode;
        txtNode.textContent = base;
        for (d in decorations) {
            // allow .class and class notations
            if (startsWith(decorations[d], ".")) decorations[d] = decorations[d].slice(1);

            if (startsWith(decorations[d], "#")) {
                node.setAttribute('id', decorations[d].slice(1));
            } else {
                if (startsWith(decorations[d], "*") | startsWith(decorations[d], "/")) {
                    addSpaceSeparatedAttr(node, "data-container-class", decorations[d].slice(1));
                } else {
                    addClass(node, decorations[d]);
                }
            }                
        }
    }
    function maybeProcessChunk(txtNode) {
        var txt = txtNode.textContent;
        var node = txtNode.parentNode;
        if (startsWithIgnoreCase(txt, '@CHUNK:')) {
            var main = RESTRIM.split(/:/);
            var include = main[0];
            var content = resolveChunk(include);
            var chunkParts = interpretationOfSmartLanguage(content, document, false);
            replaceNodeByNodes(node, chunkParts);
            return false; // we don't need to reprocess
        }
        return false;
    }
    /*
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
    }*/
    function maybeProcessComment(txtNode) {
        var line = txtNode.textContent;
        var clean = function(s) { return s.replace(/ *$/, ''); };
        if (line.match(/^([\s\S]*)( |\n)\/\/(.*)[\n\r]*$/) || line.match(/^()()\/\/(.*)[\n\r]*$/)) {
            var d1 = RegExp.$1;
            var d2 = RegExp.$3;
            txtNode.textContent = clean(d1);
            var node = txtNode.parentNode;
            var comm = document.createElement('div');
            comm.classList.add('comment');
            $(comm).text(clean(d2));
            
            if (txtNode.textContent == '') {
                // in the case the comment is on an empty thingthen move it to previous sibling
                node.previousElementSibling.appendChild(comm);
                node.remove();
            } else {
                $(comm).insertAfter(txtNode);
            }

            return true;
        }
        return false;
    }
    function maybeProcessAtSomething(txtNode) {
        var node = txtNode.parentNode;
        var line = txtNode.textContent;
        if (startsWithIgnoreCase(line, "@SVG:")) {
            var content = RESTRIM
            var parts = content.split(/ +/);
            if (parts.length == 3 || (parts.length > 3 && hasIDOrClassDecoration(line))) {
                var div = document.createElement('div');
                $(div).attr({
                    'data-src': parts[0],
                    'data-width': parts[1],
                    'data-height': parts[2],
                    'class': 'svg-object'
                });
                $(div).text(parts.slice(3).join(" "));
                $(div).insertAfter(txtNode);
                txtNode.remove();
            } else {
                alert("Expecting 3 parameters to '@SVG: path width height'");
                return false;
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
                    var toAdd = document.createElement('div');
                    addClass(toAdd, 'slide');
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
            // replacing the parent node with allToAdd elements
            txtNode.remove();
            replaceNodeByNodes(node, allToAdd);
            return true;
        } else {
            return false;
        }
        // TODO? handle the decorations for comments
        return true;
    }
    function processMath(content) {
        return content.
            replace(/\$((\\[$]|[^$])([^$\\]|[\\].)*)\$/g, '<span class="latex">$1</span>').
            replace(/\$\$/, '$');
    }

    function nodelistToArray(nl) {
        return Array.prototype.slice.call(nl);
    }
    function eachNode(tree, app) {
        // handles some kind of live updates + a return additional offset
        var i = 0;
        while (i < tree.childNodes.length) {
            var res = app(i, tree.childNodes[i]);
            i++;
            if (typeof res === 'number') {
                i += res;
                if (i<0) i = 0;
            }
        }
    }
    function isElement(node) {
        return node.nodeType == node.ELEMENT_NODE;
    }
    function isText(node) {
        return node.nodeType == node.TEXT_NODE;
    }
    function isXmlComment(node) {
        return node.nodeType == node.COMMENT_NODE;
    }
    function replaceNodeByNodes(node, nodes) {
        for (var i = nodes.length; i >= 0; i--) {
            $(nodes[i]).insertAfter(node);
        }
        node.remove();
    }
    function changeTagname(to) {
        return function(_, elt) {
            var newElt = $("<"+to+"/>");
            Array.prototype.slice.call(elt.attributes).forEach(function(a) {
                newElt.attr(a.name, a.value);
            });
            $(elt).wrapInner(newElt).children(0).unwrap();
        };
    }
    function adoptAttributes(dest, src) {
        Array.prototype.slice.call(src.attributes).forEach(function(a) {
            dest.setAttribute(a.name, a.value);
            src.removeAttribute(a.name);
        });
    }

    var interpretationOfSmartLanguage = function(smart, doc, isRoot) {

        isRoot = typeof isRoot !== 'undefined' ? isRoot : true;

        var converter = new showdown.Converter({
            noHeaderId: true,
        });
        var wrap = document.createElement('div');
        wrap.innerHTML = converter.makeHtml(smart);

        var tree = nodelistToArray(wrap.childNodes); // toplevel is an array (only top level for now)

        // split at each h2 or h1
        if (isRoot) (function makeTopLevelDivs(tree) {
            var firstIndex = findTag(tree, /^(h1|h2)$/i);
            if (firstIndex == -1) return;
            var secondIndex = findTag(tree, /^(h1|h2)$/i, firstIndex+1);
            if (secondIndex == -1) secondIndex = tree.length;

            var slide = document.createElement('section');
            var block = Array.prototype.splice.call(tree, firstIndex, secondIndex - firstIndex, slide);
            for (i in block) {
                slide.appendChild(block[i]);
            }
            makeTopLevelDivs(tree);
        })(tree);

        window.tree = tree;

        // process:
        // - the class and id decorations like    {#first hightlight slide}
        // - the @... custom notations
        // - the // for comments
        for (var s = 0; s < tree.length; s++) {
            var slide = tree[s];

            if (isRoot) s = maybeProcessGenerateSlides(tree, s);
            //console.log(slide, tree[s], slide.firstChild.textContent);
            slide = tree[s]; // the slide potentially got replaced

            // TODO used to:: cleanup: first, remove first "p" in a "li" (happens when one put an empty line in a bullet list, but it would break the decorations) ..... check it still poses a real problem

            // process @anim... and {} decoration
            (function patch(tree){ // tree is a slide or a subelement
                eachNode(tree, function(i, node) {
                    if (isElement(node)) {
                        patch(node);
                    } else if (isText(node)) {
                        // return -1 means reprocess from the same position
                        if (maybeProcessChunk(node)) return -1;
                        if (maybeProcessComment(node)) return -1;
                        if (maybeProcessAtSomething(node)) return -1;
                        if (maybeProcessIDOrClassDecoration(node)) return -1;
                    } else if (isXmlComment(node)) {
                        // ignore
                    } else {
                        alert('Should not happen: '+node.nodeType);
                    }
                });
            })(slide);
            // process the $math$
            (function patch(tree){ // tree is a slide or a subelement
                if (hasClass(tree, 'smark-nomath')) return;
                eachNode(tree, function(i, node) {
                    if (isElement(node)) {
                        patch(node);
                    } else if (isText(node) && node.textContent.contains('$')) {
                        var wrap = document.createElement('div');
                        wrap.innerHTML = processMath(node.textContent);
                        replaceNodeByNodes(node, wrap.childNodes);
                    }
                });
            })(slide);
            // change things to textarea (to help with codemirror) https://github.com/iros/deck.js-codemirror/issues/19
            (function patch(tree){ // tree is a slide or a subelement
                eachNode(tree, function(i, node) {
                    if (isElement(node)) {
                        var unwrapIt = hasClass(node, "smartarea");
                        if (!unwrapIt) { // auto for codemirror language-...
                            if (node.tagName.match(/^code$/i) &&
                                node.parentNode.tagName.match(/^pre$/i)) {
                                // we found a code>pre, look for language-... in its classes
                                for (var i = 0; i < node.classList.length; i++) {
                                    if (node.classList[i].match(/^language-/)) {
                                        unwrapIt = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if (unwrapIt) {
                            node.innerHTML = node.textContent; // unescape entities
                            replaceNodeByNodes(node.parentNode, [node]); // pre unwrap
                            changeTagname('textarea')(i, node);
                        } else {
                            patch(node);
                        }
                    }
                });
            })(slide);

            if (isRoot) {
                // now propagate the first title attribute to the slide
                adoptAttributes(slide, slide.children[0]);
                // and make it a slide
                slide.classList.add('slide');
            }

        }
        return tree;
    }

    // this have to be executed before the deck init
    $d.bind('deck.beforeInit', function() {
        $('.smart').each(function() { // TODO make it configurable
            var it = this;
            var slides = interpretationOfSmartLanguage(it.innerHTML, document);
            $(it).after(slides);
            // remove the smart node (to avoid having an empty non-slide sibling (e.g., in the presenter view))
            $(it).remove();
        });
        var opts = $[deck]('getOptions');
        var maybe = function(f) { return f || (function(){}); }
        if (typeof opts.AFTERSMARKDOWN !== 'undefined') {
            alert("Warning: you're using 'smartdown' but you have a AFTERSMARKDOWN property.\nThis new 'smartdown' (smart vs smark) uses AFTERSMARTDOWN (with a T).")
        }
        maybe(opts.AFTERSMARTDOWN)();
        $[deck]('reInitSlidesArray')
    });

})(jQuery, 'deck');
