
$(document).bind('deck.init', function() {

    if (!window.localStorage) {
        alert("LocalStorage is unsupported in your browser, slide time logs are disabled");
        return;
    }

    $(document).bind('deck.change', function(e, from, to) {
        var now = new Date();
        var time = now.toString()
        var log = time + " " + from + " " + to;
        //alert(log);
        
        var data = localStorage.getItem("logs");
        data = log+"\n"+data;
        localStorage.setItem("logs", data);
        $(".logs").html(data);

    });   

});
