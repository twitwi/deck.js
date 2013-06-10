
/*!
 * Includedeck.
 *
 * Copyright (c) 2013 Rémi Emonet.
 * Dual licensed under the MIT license and GPL license.
 * https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
 * https://github.com/imakewebthings/deck.js/blob/master/GPL-license.txt
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

// this is head.load.min.js (v0.99)
/*!
 * HeadJS     The only script in your <HEAD>    
 * Author     Tero Piirainen  (tipiirai)
 * Maintainer Robert Hoffmann (itechnology)
 * License    MIT / http://bit.ly/mit-license
 *
 * Version 0.99
 * http://headjs.com
 */
(function(f,w){function m(){}function g(a,b){if(a){"object"===typeof a&&(a=[].slice.call(a));for(var c=0,d=a.length;c<d;c++)b.call(a,a[c],c)}}function v(a,b){var c=Object.prototype.toString.call(b).slice(8,-1);return b!==w&&null!==b&&c===a}function k(a){return v("Function",a)}function h(a){a=a||m;a._done||(a(),a._done=1)}function n(a){var b={};if("object"===typeof a)for(var c in a)a[c]&&(b={name:c,url:a[c]});else b=a.split("/"),b=b[b.length-1],c=b.indexOf("?"),b={name:-1!==c?b.substring(0,c):b,url:a};
return(a=p[b.name])&&a.url===b.url?a:p[b.name]=b}function q(a){var a=a||p,b;for(b in a)if(a.hasOwnProperty(b)&&a[b].state!==r)return!1;return!0}function s(a,b){b=b||m;a.state===r?b():a.state===x?d.ready(a.name,b):a.state===y?a.onpreload.push(function(){s(a,b)}):(a.state=x,z(a,function(){a.state=r;b();g(l[a.name],function(a){h(a)});j&&q()&&g(l.ALL,function(a){h(a)})}))}function z(a,b){var b=b||m,c;/\.css[^\.]*$/.test(a.url)?(c=e.createElement("link"),c.type="text/"+(a.type||"css"),c.rel="stylesheet",
c.href=a.url):(c=e.createElement("script"),c.type="text/"+(a.type||"javascript"),c.src=a.url);c.onload=c.onreadystatechange=function(a){a=a||f.event;if("load"===a.type||/loaded|complete/.test(c.readyState)&&(!e.documentMode||9>e.documentMode))c.onload=c.onreadystatechange=c.onerror=null,b()};c.onerror=function(){c.onload=c.onreadystatechange=c.onerror=null;b()};c.async=!1;c.defer=!1;var d=e.head||e.getElementsByTagName("head")[0];d.insertBefore(c,d.lastChild)}function i(){e.body?j||(j=!0,g(A,function(a){h(a)})):
(f.clearTimeout(d.readyTimeout),d.readyTimeout=f.setTimeout(i,50))}function t(){e.addEventListener?(e.removeEventListener("DOMContentLoaded",t,!1),i()):"complete"===e.readyState&&(e.detachEvent("onreadystatechange",t),i())}var e=f.document,A=[],B=[],l={},p={},E="async"in e.createElement("script")||"MozAppearance"in e.documentElement.style||f.opera,C,j,D=f.head_conf&&f.head_conf.head||"head",d=f[D]=f[D]||function(){d.ready.apply(null,arguments)},y=1,x=3,r=4;d.load=E?function(){var a=arguments,b=a[a.length-
1],c={};k(b)||(b=null);g(a,function(d,e){d!==b&&(d=n(d),c[d.name]=d,s(d,b&&e===a.length-2?function(){q(c)&&h(b)}:null))});return d}:function(){var a=arguments,b=[].slice.call(a,1),c=b[0];if(!C)return B.push(function(){d.load.apply(null,a)}),d;c?(g(b,function(a){if(!k(a)){var b=n(a);b.state===w&&(b.state=y,b.onpreload=[],z({url:b.url,type:"cache"},function(){b.state=2;g(b.onpreload,function(a){a.call()})}))}}),s(n(a[0]),k(c)?c:function(){d.load.apply(null,b)})):s(n(a[0]));return d};d.js=d.load;d.test=
function(a,b,c,e){a="object"===typeof a?a:{test:a,success:b?v("Array",b)?b:[b]:!1,failure:c?v("Array",c)?c:[c]:!1,callback:e||m};(b=!!a.test)&&a.success?(a.success.push(a.callback),d.load.apply(null,a.success)):!b&&a.failure?(a.failure.push(a.callback),d.load.apply(null,a.failure)):e();return d};d.ready=function(a,b){if(a===e)return j?h(b):A.push(b),d;k(a)&&(b=a,a="ALL");if("string"!==typeof a||!k(b))return d;var c=p[a];if(c&&c.state===r||"ALL"===a&&q()&&j)return h(b),d;(c=l[a])?c.push(b):l[a]=[b];
return d};d.ready(e,function(){q()&&g(l.ALL,function(a){h(a)});d.feature&&d.feature("domloaded",!0)});if("complete"===e.readyState)i();else if(e.addEventListener)e.addEventListener("DOMContentLoaded",t,!1),f.addEventListener("load",i,!1);else{e.attachEvent("onreadystatechange",t);f.attachEvent("onload",i);var u=!1;try{u=null==f.frameElement&&e.documentElement}catch(F){}u&&u.doScroll&&function b(){if(!j){try{u.doScroll("left")}catch(c){f.clearTimeout(d.readyTimeout);d.readyTimeout=f.setTimeout(b,50);
return}i()}}()}setTimeout(function(){C=!0;g(B,function(b){b()})},300)})(window);




// this is the actual includedeck

function includedeck(m, c, a) {
    var modules = m || [];
    var conf = c || {};
    var atExit = a || [];
    var deckSelector = conf.DECK || '.slide';

    if (typeof(modules) == "string") {
        modules = modules.split(/ +/);
    }
    
    // todo: make this externally extensible
    // todo: maybe have a mechanism to load a list of dependency (e.g., mymodule-files.js)

    var info = {
        "deck": [
            "deck.js/jquery-1.7.2.min.js",
	    "deck.js/core/deck.core.css",
            "deck.js/modernizr.custom.js",
            "deck.js/core/deck.core.js"
        ],
        // ^ todo this is "core" deck, shoult it be included by default or not? also, provide an alternative with new css
        "fit": [ "deck.js/extensions/fit/deck.fit.js" ],
        "fit-fs": [
            "deck.js/extensions/fit/deck.fit-fs.css",
            "deck.js/extensions/fit/deck.fit.js" // "@fit" <- todo replace by this
        ],
        "simplemath": [
            "deck.js/libs/display-latex2.user.js",
            "deck.js/extensions/simplemath/deck.simplemath.js"
        ],
        "smartsyntax": [ "deck.js/extensions/smartsyntax/deck.smartsyntax.js" ],
        "clone": [ "deck.js/extensions/clone/deck.clone.js" ],
        "goto": [
            "deck.js/extensions/goto/deck.goto.css",
            "deck.js/extensions/goto/deck.goto.js"
        ],
        "status": [
            "deck.js/extensions/status/deck.status.css",
            "deck.js/extensions/status/deck.status.js"
        ],
        "navigation": [
            "deck.js/extensions/navigation/deck.navigation.css",
            "deck.js/extensions/navigation/deck.navigation.js"
        ],
        "menu": [
            "deck.js/extensions/menu/deck.menu.css",
            "deck.js/extensions/menu/deck.menu.js"
        ],
        "hash": [
            "deck.js/extensions/hash/deck.hash.css",
            "deck.js/extensions/hash/deck.hash.js"
        ],
        "step": [ "deck.js/extensions/step/deck.step.js" ],
        "events": [ "deck.js/extensions/events/deck.events.js" ],
        "anim": [ "deck.js/extensions/anim/deck.anim.js" ],
        "svg": [
            "deck.js/libs/jquerysvg/jquery.svg.min.js" ,
            "deck.js/libs/jquerysvg/jquery.svganim.min.js",
            "deck.js/extensions/svg/deck.svg.js"
        ],
        dummy: {} // TODO add a newdeck
    };

    // todo: recursively process info to make metapackages (@...)
    // todo: handle default extensions (deck.js/extensions/N/deck.N.{js,css}
    // todo: have a conf to change the base path

    var toLoad = [];

    modules = ["deck"].concat(modules);

    for (i in modules) {
        toLoad = toLoad.concat(info[modules[i]]);
    }

    { // First insert a CSS, just to fit modernizr
        var c = document.createElement("style");
        c.type = "text/css";
        document.getElementsByTagName("head")[0].appendChild(c);
    }
    
    head.js.apply(head,toLoad.concat(function() {
        $(function() {
            $.deck(deckSelector, conf);
        });
    }));
}

