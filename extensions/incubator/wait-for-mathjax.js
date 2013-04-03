
$(function() {
    $(document).bind('deck.init', function() {
        var removeCssClass = function () {
            $(".deck-container").removeClass("mathjaxwait")
        }
        if (window.MathJax === undefined) {
            removeCssClass()
        } else {
            MathJax.Hub.Register.StartupHook("End", removeCssClass)
            MathJax.Hub.Configured()
        }
    });
});
