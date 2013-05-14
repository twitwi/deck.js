
$(document).bind('deck.init', function() {

    var removeAdd = function(arr, rm, ad) {
        while (arr.indexOf(rm) != -1) arr.splice(arr.indexOf(rm), 1);
        arr.push(ad);
        return arr;
    }

    var optionskeysNext = $["deck"]("getOptions").keys.next;
    var optionskeysPrevious = $["deck"]("getOptions").keys.previous;

    removeAdd(optionskeysNext, 33, 34);
    removeAdd(optionskeysPrevious, 34, 33);
    
    var esp = function(e) {
	e.stopPropagation();
    };

    /* Remove any previous bindings, and rebind key events */
    $(document).unbind('keydown.deck').bind('keydown.deck', function(e) {
        if (e.which === optionskeysNext || $.inArray(e.which, optionskeysNext) > -1) {
            $["deck"]("next");
            e.preventDefault();
        }
        else if (e.which === optionskeysPrevious || $.inArray(e.which, optionskeysPrevious) > -1) {
            $["deck"]("prev");
            e.preventDefault();
        }
    })
    /* Stop propagation of key events within editable elements */
    .undelegate('input, textarea, select, button, meter, progress, [contentEditable]', 'keydown', esp)
    .delegate('input, textarea, select, button, meter, progress, [contentEditable]', 'keydown', esp);
    
});
