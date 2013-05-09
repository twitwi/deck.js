
$(function() {
    // Bind key event
    var $d = $(document);
    $d.unbind('keydown.togglecomments').bind('keydown.togglecomments', function(e) {
        var K = 86;
        if (e.which === K || $.inArray(e.which, K) > -1) {
            $("body").toggleClass("show-comments");
            e.preventDefault();
        }
    });
});
