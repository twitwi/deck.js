/*!
Deck JS - deck.savedom
Copyright (c) 2017 Rémi Emonet
Licensed under the MIT license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
*/

/*
This module adds a function (and buttons) to export the current DOM.
The feature is useful in the process of make a single-file presentation.
*/

(function($, deck, undefined) {
    $.extend(true, $.deck.defaults, {
        selectors: {
            savedomOnClick: '.save-dom-button'
        },
        keys: {
            // 'd'
            saveDOM: [68],
        },
        alert: {
            howToInline: true
        }
    });
    var $d = $(document);
    $[deck]('extend', 'saveDOM', function(directDownload) {
        console.log("Save DOM");

        var addSaveLink = function() {
            var scrpt = document.createElement('script');
            scrpt.textContent = 'IS_AN_EXPORTED_DECK = true;';
            document.body.prepend(scrpt);
            var content = '<!DOCTYPE html>\n<html>\n'+document.body.parentElement.innerHTML+'\n</html>';
            scrpt.remove();
            IS_AN_EXPORTED_DECK = undefined;

            var objectURL = URL.createObjectURL(new Blob([content], {type : 'text/html'}));
            var a = document.createElement('a');
            a.classList.add('save-dom-link');
            a.innerText = "GO" ;
            a.download = 'export.html';
            a.href = objectURL;
            a.onclick = function() {
                var opts = $.deck('getOptions');
                if (opts.alert.howToInline) alert(
                    "To make a single-file standalone presentation:"
                        +"\n"
                        +"\n 1) save the download next to your presentation file"
                        +"\n 2) name it for example export.html"
                        +"\n 3) install nodejs and https://github.com/remy/inliner"
                        +"\n 4) invoke the inliner with this command:"
                        +"\n       inliner -n -m export.html > standalone.html"
                        +"\n"
                        +"\n ⇒⇒⇒ 'standalone.html' should now contain everything,"
                        +"\n                       you can move where you want.");
                setTimeout(function() {
                    a.parentElement.removeChild(a);
                }, 222);
            };
            /*
            var refresh = function() {
                setTimeout(function(){a.parentElement.removeChild(a);}, 800);
                setTimeout(addSaveLink, 1000);
            };*/
            document.body.prepend(a);
            //refresh();
            if (!directDownload) {
                a.click();
            }
        };
        addSaveLink();
    });
    $d.bind('deck.init', function() {
        var o = $.deck('getOptions');
        $(o.selectors.savedomOnClick).click(function(i, el){
            $[deck]('saveDOM');
        });
        $d.unbind('keydown.saveDOM').bind('keydown.saveDOM', function(e) {
            var $opts = $[deck]('getOptions');
            var key = $opts.keys.saveDOM;
            if (e.which === key || $.inArray(e.which, key) > -1) {
                e.preventDefault();
                $[deck]('saveDOM');
            }
        });
        if (window.helpAreaAvailable) { // always add, as a means of discovery
            $.deck('helpAdvertiseKey', 'saveDOM', 'Dump current slides (DOM) to a .html file');
        }
    });
})(jQuery, 'deck');
