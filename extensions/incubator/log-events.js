
$(document).bind('deck.init', function() {

    if (!window.localStorage) {
        alert("LocalStorage is unsupported in your browser, slide time logs are disabled");
        return;
    }

    var clearStorage = function(what) {
        localStorage.setItem("logs", "");
        log("CLEARED BY USER");
    }
    var log = function(what) {
        var now = new Date();
        var time = now.toString()
        var log = time + " " + what;
        
        var data = localStorage.getItem("logs");
        data = log + "\n" + data;
        localStorage.setItem("logs", data);
        $(".logs").html(data);
    }

    $(document).bind('deck.change', function(e, from, to) {
        log(from + " " + to)
    });   

    // Bind key event to add a marker in the logs
    var $d = $(document);
    $d.unbind('keydown.logbang').bind('keydown.logbang', function(e) {
        var K = 27; // escape
        if (e.which === K || $.inArray(e.which, K) > -1) {
            log("BANG");
            if (e.shiftKey) {
                clearStorage();
            }
        }
    });

});
