
$(document).bind('deck.init', function() {

    if (!window.localStorage) {
        alert("LocalStorage is unsupported in your browser, slide time logs are disabled");
        return;
    }

    var pad = function(base, right) {
        var s = ""+right;
        if (s.length >= base.length) return s;
        else return base.substring(0, base.length - s.length) + s
    }
    var formatTime = function(t) {
        var min = parseInt(t / 1000 / 60);
        var sec = parseInt(t / 1000 - 60 * min);
        var time = pad("00", min) + ":" + pad("00", sec)
        return time;
    }
    var clearStorage = function(what) {
        localStorage.setItem("deckjs-logs", null);
        log("CLEARED BY USER");
        localStorage.setItem("deckjs-logs-clearbase", JSON.stringify(new Date()));
        $(".logs-clear").stop(true,true).show(200).hide(400);
    }
    $(".logs-clear").hide(10);
    $(".logs-bang").hide(10);
    var reset = function() {
        localStorage.setItem("deckjs-logs-base", JSON.stringify(new Date()));
    }
    var getDateOrSet = function(k, or) {
        var res = localStorage.getItem(k);
        if (res == null) {
            res = JSON.stringify(or);
            localStorage.setItem(k, res);
        } else {
            res = new Date(JSON.parse(res));
        }
        return res;
    }
    var log = function(what) {
        var now = new Date();
        var time = now.toString()
        var base = getDateOrSet("deckjs-logs-base", now);
        var clearbase = getDateOrSet("deckjs-logs-clearbase", now);
        var db = (now - base)/1000;
        var dcb = (now - clearbase)/1000;
        var dbtime = formatTime(now - base);
        var dcbtime = formatTime(now - clearbase);
        var log = time.replace(/GMT.*/, "") + " " + what + " " + dcb + " " + db + " " + dcbtime + " " + dbtime;

        var data = localStorage.getItem("deckjs-logs");
        data = log + "\n" + data;
        localStorage.setItem("deckjs-logs", data);
        $(".logs").html(data);
    }

    var saveCurrent = -1;
    $(document).bind('deck.change', function(e, from, to) {
        log(from + " " + to);
        saveCurrent = to;
    });   

    // Bind key event to add a marker in the logs
    var $d = $(document);
    var doBang = function() {
        log("BANG " + saveCurrent);
        $(".logs-bang").stop(true,true).show(200).hide(400);
        reset();
    }
    $d.unbind('keydown.logbang').bind('keydown.logbang', function(e) {
        if (e.ctrlKey) return;
        var K = [27, 75]; // escape, k
        if (e.which === K || $.inArray(e.which, K) > -1) {
            doBang();
            if (e.shiftKey) {
                clearStorage();
            }
        }
    });


    // also a timer feature

    var period = 500;
    setInterval(function() {
        var k = "deckjs-logs-clearbase";
        var v = localStorage.getItem(k);
        if (v != null) {
            var t = new Date() - new Date(JSON.parse(v));
            var time = formatTime(t);
            $(".logs-timer").html(time);
        }
    }, period);
    
});

/* Example at design time

CSS:

            body:not(.has-clones):not(.show-comments) .logs { display: none;}
            body .logs { height:100%; width:10px; overflow-y: scroll; background: white; float: right; opacity: 0.2;}
            body .logs:hover { width:400px; opacity: .85;}

HTML (with the goto form etc):

     <pre class="logs" ></pre>

*/
