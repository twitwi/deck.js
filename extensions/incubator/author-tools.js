
(function($, deck, undefined) {
    // Should be included after any slide-generating extension (like smartdown).
    $(document).bind('deck.beforeInit', function() {
        var $d = $(document);
        var container = $[deck]('getContainer');

        // range a-b, for heavy decks, to avoid loading everything
        // specify the range of slides (top-level) to keep.
        if (sessionStorage.getItem('range')) {
            var slides = $('>.slide', container);
            var parts = sessionStorage.getItem('range').split('-');
            var start = parts[0] == '' ? 0 : parseInt(parts[0]);
            var end = parts[1] == '' ? slides.size() : parseInt(parts[1]);
            slides.each(function (i, e) {
                if (i < start || i >= end) {
                    e.parentNode.removeChild(e);
                }
            });
        }
    });
    $(document).bind('deck.init', function() {
        if (window.helpAreaAvailable) { // always add, as a means of discovery
            $[deck]('helpSessionStorage', 'range', 'Select a subset of the slides to load (e.g., 12-15 or 0-5 or 10-).', true, true);
        }
    });
})(jQuery, 'deck');
