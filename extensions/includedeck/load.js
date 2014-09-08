
/*!
 * Includedeck.
 *
 * Copyright (c) 2013-2014 Rémi Emonet.
 * Licensed under the MIT license.
 * https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
 *
 * The goal of this extension is to simplify include of deck.js,
 * its profiles/themes and the extensions.
 *
 * The first goal is not performance of loading (still it should
 * allow the display of a message while loading) but on ease of
 * use and extensibility (i.e., includedeck does not need to know
 * about all existing extensions, even if by default it does know
 * some of them).
 *
 */



var head_conf = {
    
};

if (typeof ACTUALLY_EXPORT_A_LIST_OF_FILES == 'undefined')
// this is head.load.min.js (v1.0.3) from http://headjs.com/site/download.html
/*! head.load - v1.0.3 */
(function(n,t){"use strict";function w(){}function u(n,t){if(n){typeof n=="object"&&(n=[].slice.call(n));for(var i=0,r=n.length;i<r;i++)t.call(n,n[i],i)}}function it(n,i){var r=Object.prototype.toString.call(i).slice(8,-1);return i!==t&&i!==null&&r===n}function s(n){return it("Function",n)}function a(n){return it("Array",n)}function et(n){var i=n.split("/"),t=i[i.length-1],r=t.indexOf("?");return r!==-1?t.substring(0,r):t}function f(n){(n=n||w,n._done)||(n(),n._done=1)}function ot(n,t,r,u){var f=typeof n=="object"?n:{test:n,success:!t?!1:a(t)?t:[t],failure:!r?!1:a(r)?r:[r],callback:u||w},e=!!f.test;return e&&!!f.success?(f.success.push(f.callback),i.load.apply(null,f.success)):e||!f.failure?u():(f.failure.push(f.callback),i.load.apply(null,f.failure)),i}function v(n){var t={},i,r;if(typeof n=="object")for(i in n)!n[i]||(t={name:i,url:n[i]});else t={name:et(n),url:n};return(r=c[t.name],r&&r.url===t.url)?r:(c[t.name]=t,t)}function y(n){n=n||c;for(var t in n)if(n.hasOwnProperty(t)&&n[t].state!==l)return!1;return!0}function st(n){n.state=ft;u(n.onpreload,function(n){n.call()})}function ht(n){n.state===t&&(n.state=nt,n.onpreload=[],rt({url:n.url,type:"cache"},function(){st(n)}))}function ct(){var n=arguments,t=n[n.length-1],r=[].slice.call(n,1),f=r[0];return(s(t)||(t=null),a(n[0]))?(n[0].push(t),i.load.apply(null,n[0]),i):(f?(u(r,function(n){s(n)||!n||ht(v(n))}),b(v(n[0]),s(f)?f:function(){i.load.apply(null,r)})):b(v(n[0])),i)}function lt(){var n=arguments,t=n[n.length-1],r={};return(s(t)||(t=null),a(n[0]))?(n[0].push(t),i.load.apply(null,n[0]),i):(u(n,function(n){n!==t&&(n=v(n),r[n.name]=n)}),u(n,function(n){n!==t&&(n=v(n),b(n,function(){y(r)&&f(t)}))}),i)}function b(n,t){if(t=t||w,n.state===l){t();return}if(n.state===tt){i.ready(n.name,t);return}if(n.state===nt){n.onpreload.push(function(){b(n,t)});return}n.state=tt;rt(n,function(){n.state=l;t();u(h[n.name],function(n){f(n)});o&&y()&&u(h.ALL,function(n){f(n)})})}function at(n){n=n||"";var t=n.split("?")[0].split(".");return t[t.length-1].toLowerCase()}function rt(t,i){function e(t){t=t||n.event;u.onload=u.onreadystatechange=u.onerror=null;i()}function o(f){f=f||n.event;(f.type==="load"||/loaded|complete/.test(u.readyState)&&(!r.documentMode||r.documentMode<9))&&(n.clearTimeout(t.errorTimeout),n.clearTimeout(t.cssTimeout),u.onload=u.onreadystatechange=u.onerror=null,i())}function s(){if(t.state!==l&&t.cssRetries<=20){for(var i=0,f=r.styleSheets.length;i<f;i++)if(r.styleSheets[i].href===u.href){o({type:"load"});return}t.cssRetries++;t.cssTimeout=n.setTimeout(s,250)}}var u,h,f;i=i||w;h=at(t.url);h==="css"?(u=r.createElement("link"),u.type="text/"+(t.type||"css"),u.rel="stylesheet",u.href=t.url,t.cssRetries=0,t.cssTimeout=n.setTimeout(s,500)):(u=r.createElement("script"),u.type="text/"+(t.type||"javascript"),u.src=t.url);u.onload=u.onreadystatechange=o;u.onerror=e;u.async=!1;u.defer=!1;t.errorTimeout=n.setTimeout(function(){e({type:"timeout"})},7e3);f=r.head||r.getElementsByTagName("head")[0];f.insertBefore(u,f.lastChild)}function vt(){for(var t,u=r.getElementsByTagName("script"),n=0,f=u.length;n<f;n++)if(t=u[n].getAttribute("data-headjs-load"),!!t){i.load(t);return}}function yt(n,t){var v,p,e;return n===r?(o?f(t):d.push(t),i):(s(n)&&(t=n,n="ALL"),a(n))?(v={},u(n,function(n){v[n]=c[n];i.ready(n,function(){y(v)&&f(t)})}),i):typeof n!="string"||!s(t)?i:(p=c[n],p&&p.state===l||n==="ALL"&&y()&&o)?(f(t),i):(e=h[n],e?e.push(t):e=h[n]=[t],i)}function e(){if(!r.body){n.clearTimeout(i.readyTimeout);i.readyTimeout=n.setTimeout(e,50);return}o||(o=!0,vt(),u(d,function(n){f(n)}))}function k(){r.addEventListener?(r.removeEventListener("DOMContentLoaded",k,!1),e()):r.readyState==="complete"&&(r.detachEvent("onreadystatechange",k),e())}var r=n.document,d=[],h={},c={},ut="async"in r.createElement("script")||"MozAppearance"in r.documentElement.style||n.opera,o,g=n.head_conf&&n.head_conf.head||"head",i=n[g]=n[g]||function(){i.ready.apply(null,arguments)},nt=1,ft=2,tt=3,l=4,p;if(r.readyState==="complete")e();else if(r.addEventListener)r.addEventListener("DOMContentLoaded",k,!1),n.addEventListener("load",e,!1);else{r.attachEvent("onreadystatechange",k);n.attachEvent("onload",e);p=!1;try{p=!n.frameElement&&r.documentElement}catch(wt){}p&&p.doScroll&&function pt(){if(!o){try{p.doScroll("left")}catch(t){n.clearTimeout(i.readyTimeout);i.readyTimeout=n.setTimeout(pt,50);return}e()}}()}i.load=i.js=ut?lt:ct;i.test=ot;i.ready=yt;i.ready(r,function(){y()&&u(h.ALL,function(n){f(n)});i.feature&&i.feature("domloaded",!0)})})(window);
//# sourceMappingURL=head.load.min.js.map


// this is the actual includedeck
function includedeck(m, c) {
    var maybe = function(f) { return f || (function(){}); }
    var modules = m || [];
    var conf = c || {};
    var initDelay = conf.INITDELAY;
    var cb = {
        beforeLoad: maybe(conf.BEFORELOAD),
        beforeDelay: maybe(conf.BEFOREDELAY), // useful only if INITDELAY is set, else, just like BEFOREINIT
        beforeInit: maybe(conf.BEFOREINIT),
        afterInit: maybe(conf.AFTERINIT),
        atExit: maybe(conf.ATEXIT), // for backward compatibility (same as AFTERINIT)
        hasGeneric: conf.GENERIC ? true : false,
        generic: maybe(conf.GENERIC) // will receive calls like GENERIC("AFTER", "svg"), one of each BEFORE/AFTER for each file group (svg, simplemath, ...)
    };
    var prefix = conf.PREFIX || "deck.js";

    if (typeof(modules) == "string") {
        modules = modules.split(/ +/);
    }
    
    // todo: make this externally extensible
    // todo: maybe have a mechanism to load a list of dependency (e.g., mymodule-files.js)

    var info = {
        //
        // core (differerent possible cores)
        "deck-core-dependencies": [
            prefix + "/jquery.min.js",
            prefix + "/modernizr.custom.js"
	    //prefix + "/extensions/includedeck/___after___core___.js"
        ],
        "deck": [
            "@_deck-core-dependencies",
	    prefix + "/core/deck.core.css",
            prefix + "/core/deck.core.js"
        ],
        "newdeck": [
            "@_deck-core-dependencies",
	    prefix + "/extensions/style-chunks/core.css",
            prefix + "/core/deck.core.js"
        ],
        //
        // extensions
        "fit": [ prefix + "/extensions/fit/deck.fit.js" ],
        "fit-fs": [
            prefix + "/extensions/fit/deck.fit-fs.css",
            "@_fit"
        ],
        "simplemath": [
            prefix + "/libs/display-latex2.user.js",
            prefix + "/extensions/simplemath/deck.simplemath.js"
        ],
        "smartsyntax": [ prefix + "/extensions/smartsyntax/deck.smartsyntax.js" ],
        "smarkdown": [
            prefix + "/extensions/smarkdown/markdown.js",
            prefix + "/extensions/smarkdown/deck.smarkdown.js"
        ],
        "clone": [
            prefix + "/extensions/clone/deck.clone.css",
            prefix + "/extensions/clone/deck.clone.js"
        ],
        "timekeeper": [
            prefix + "/extensions/timekeeper/deck.timekeeper.css",
            prefix + "/extensions/timekeeper/deck.timekeeper.js"
        ],
        "goto": [
            prefix + "/extensions/goto/deck.goto.css",
            prefix + "/extensions/goto/deck.goto.js"
        ],
        "status": [
            prefix + "/extensions/status/deck.status.css",
            prefix + "/extensions/status/deck.status.js"
        ],
        "progress": [
            prefix + "/extensions/progress/deck.progress.css",
            prefix + "/extensions/progress/deck.progress.js"
        ],
        "navigation": [
            prefix + "/extensions/navigation/deck.navigation.css",
            prefix + "/extensions/navigation/deck.navigation.js"
        ],
        "menu": [
            prefix + "/extensions/menu/deck.menu.css",
            prefix + "/extensions/menu/deck.menu.js"
        ],
        "step": [ prefix + "/extensions/step/deck.step.js" ],
        "events": [ prefix + "/extensions/events/deck.events.js" ],
        "anim": [ prefix + "/extensions/anim/deck.anim.js" ],
        "svg": [
            prefix + "/libs/jquerysvg/jquery.svg.min.js" ,
            prefix + "/libs/jquerysvg/jquery.svganim.min.js",
            prefix + "/extensions/svg/deck.svg.js"
        ],
        "metadata": [ prefix + "/extensions/metadata/deck.metadata.js" ],
        "attribution": [
            prefix + "/extensions/attribution/deck.attribution.css",
            prefix + "/extensions/attribution/deck.attribution.js"
        ],
        "container-styling": [ prefix + "/extensions/container-styling/deck.container-styling.js" ],
        // Style extensions
        "style-chunks": [
	    prefix + "/extensions/style-chunks/simple.css",
	    prefix + "/extensions/style-chunks/comments.css"
        ],
        //
        // Themes
        // // by convention, "theme:blabla" will load the default blabla theme
        //
        // Some default profiles
        //
        /// profile-1: default deck with most extensions and no theme
        "profile-1": ["@_deck", "@_smartsyntax", "@_fit-fs", "@_simplemath", "@_clone", "@_goto", "@_status", "@_navigation", "@_menu", "@_step", "@_events", "@_anim", "@_svg"],
        "profile-1-fitnofs": ["@_deck", "@_smartsyntax", "@_fit", "@_simplemath", "@_clone", "@_goto", "@_status", "@_navigation", "@_menu", "@_step", "@_events", "@_anim", "@_svg"],
        /// profile-2: new deck (cleaner css) with most extensions and no theme
        "profile-2": ["@_newdeck", "@_smartsyntax", "@_fit-fs", "@_simplemath", "@_clone", "@_goto", "@_status", "@_navigation", "@_menu", "@_step", "@_events", "@_anim", "@_svg"],
        "profile-2-fitnofs": ["@_newdeck", "@_smartsyntax", "@_fit", "@_simplemath", "@_clone", "@_goto", "@_status", "@_navigation", "@_menu", "@_step", "@_events", "@_anim", "@_svg"],
        /// profile-3: big profile = profile-2 / with new status (progress) + all good bundled extensions
        "profile-3": ["@_newdeck", "@_smartsyntax", "@_fit-fs", "@_simplemath", "@_clone", "@_goto", "@_progress", "@_navigation", "@_menu", "@_step", "@_events", "@_anim", "@_svg",
                      "@_metadata", "@_attribution", "@_container-styling", "@_timekeeper"],
        /// profile-4: big profile (as profile 3) but with the smarkdown instead of the smartsyntax
        "profile-4": ["@_newdeck", "@_smarkdown", "@_fit-fs", "@_simplemath", "@_clone", "@_goto", "@_progress", "@_navigation", "@_menu", "@_step", "@_events", "@_anim", "@_svg",
                      "@_metadata", "@_attribution", "@_container-styling", "@_timekeeper"],
        /// profile-5: use smarkdown and include more useful things (CSS: simple, comments)
        "profile-5": ["@_newdeck", "@_smarkdown", "@_fit-fs", "@_simplemath", "@_clone", "@_goto", "@_progress", "@_navigation", "@_menu", "@_step", "@_events", "@_anim", "@_svg",
                      "@_metadata", "@_attribution", "@_container-styling", "@_timekeeper", "@_style-chunks"],
        dummy: {}
    };

    var endsInJsOrCss = /\.(css|js)$/;

    // Defensive check that there are no *.js/*.css in the info (as they won't be useable anyways)
    for (k in info) {
        if (endsInJsOrCss.test(k)) {
            alert("Internal problem detected in includedeck: '" + k + "' won't be useable.");
        }
    }

    // TODO?: handle default extensions (deck.js/extensions/N/deck.N.{js,css}
    // TODO?: some should come before others, e.g. anim before svg, (or before any (deck) or before most (loading...))

    // if there are two '#' in the url, take everything after the second as a theme name
    var forceTheme = null;
    if ((typeof ACTUALLY_EXPORT_A_LIST_OF_FILES == 'undefined') && (window.location.hash.replace(/[^#]/gi, '').length == 2)) {
        var theme = window.location.hash.replace(/^.*#/gi, '')
        var base = window.location.hash.replace(/#[^#]*$/gi, '')
        forceTheme = theme;
        window.location.hash = base;
    }

    var toLoad = [];
    var addInfo = function(k) {
        if (k.substring(0, 6) == "theme:") {
            k = k.substring(6)
            if (forceTheme) { // replace by the url forced theme (works only with default themes...
                k = forceTheme
            }
            if (k.substring(0, 2) == "x:") {
                k = k.substring(2)
                toLoad = toLoad.concat(prefix + "/deck.js-theme-builder/" + k + ".css");
            } else {
                toLoad = toLoad.concat(prefix + "/themes/style/" + k + ".css");
            }
            return;
        }
        if (k.substring(0, 10) == "extension:") {
            toLoad = toLoad.concat(prefix + "/extensions/" + k.substring(10));
            return;
        }
        if (endsInJsOrCss.test(k)) {
            toLoad = toLoad.concat(k);
            return;
        }
        var closure = function(wh, e) { return function () { cb.generic(wh, e); } };
        for (i in info[k]) {
            if (info[k][i].substring(0,2) == "@_") {
                var e = info[k][i].substring(2);
                if (cb.hasGeneric) toLoad = toLoad.concat(closure("BEFORE", e));
                addInfo(e);
                if (cb.hasGeneric) toLoad = toLoad.concat(closure("AFTER", e));
            } else {
                toLoad = toLoad.concat(info[k][i]);
            }
        }
    }

    for (i in modules) {
        addInfo(modules[i]);
    }

    if (typeof ACTUALLY_EXPORT_A_LIST_OF_FILES !== 'undefined') {
        return toLoad;
    }

    { // First insert a CSS, just to fit modernizr
        var c = document.createElement("style");
        c.type = "text/css";
        if (typeof ACTUALLY_FILL_CSS !== 'undefined') {
            ACTUALLY_FILL_CSS(c);
        }
        document.getElementsByTagName("head")[0].appendChild(c);
    }
    
    // custom adapter function to split the load list at each function and call by head.js by block (need to end with a function)
    // in the end, for IE9 compat, we load everything one by one... maybe switching to lazyload.js would avoid needing this.
    var loadsAndCalls = function(l, stack) {
        stack = stack || [];
        if (l.length == 0) return;
        if ("string" !== typeof l[0]) {
            l[0]();
            loadsAndCalls(l.slice(1));
        } else {
            head.js(l[0], function() {
                loadsAndCalls(l.slice(1));
            });
        }
    }
    cb.beforeLoad();
    loadsAndCalls(toLoad.concat(function() {
        $(function() {
            var doIt = function() {
                cb.beforeInit();
                $.deck(conf);
                cb.afterInit();
                cb.atExit();
            };
            // delay and callback logic
            cb.beforeDelay();
            if (initDelay) {
                setTimeout(doIt, initDelay);
            } else {
                doIt();
            }
        });
    }));
}

