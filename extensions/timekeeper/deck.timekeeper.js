/*!
Deck JS - deck.timekeeper
Copyright (c) 2013-2016 Rémi Emonet
Licensed under the MIT license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
*/

/*
This module provides a support for displaying current time, time from start and logging the time spent on each slide etc.
It also injects some default html for it if none is found (and styles it for the presenter/clone view).
*/

(function($, deck, undefined) {
    var $d = $(document);

    $.extend(true, $[deck].defaults, {	
        selectors: {
            timekeeper: ".timekeeper", /* inject if this is not present */ // TODO inject
            timekeeperTime: ".timekeeper-time",
            timekeeperRelativeTime: ".timekeeper-relative-time",
            timekeeperLocalRelativeTime: ".timekeeper-local-relative-time",
            timekeeperLogs: ".timekeeper-logs",
            timekeeperLogsPre: ".timekeeper-logs pre",
            timekeeperLogsToggle: ".timekeeper-logs-toggle",
            timekeeperBang: ".timekeeper-bang",
            timekeeperClear: ".timekeeper-clear"
        },
        classes: {
            timekeeperNotification: "timekeeper-notification",
            timekeeperLogsVisible: "timekeeper-logs-visible"
        },
        snippets: {
            timekeeper: true
        },
        alert: {
            localStorageUnsupported: true
        },
        localStorage: {
            timekeeperArchivesMaxSize: 500*1000,
            timekeeperArchives: 'deckjs-timekeeper-archives',
            timekeeperLogs: 'deckjs-timekeeper-logs',
            timekeeperBase: 'deckjs-timekeeper-base',
            timekeeperLocalBase: 'deckjs-timekeeper-local-base'
        },
        timekeeperPeriod: 1000,
        timekeeperNotificationPeriod: 100,
        keys: {
            timekeeper: [27, 75] // escape, k (combine with SHIFT to reset the counter (when starting presenting))
        }
    });

    $d.bind('deck.init', function() {
        var opts = $[deck]('getOptions');
        var container = $[deck]('getContainer');

        // sligthly edited from
        var selectText = function(text) {
            var doc = document
            , range, selection
            ;
            if (doc.body.createTextRange) { //ms
                range = doc.body.createTextRange();
                range.moveToElementText(text);
                range.select();
            } else if (window.getSelection) { //all others
                selection = window.getSelection();
                range = doc.createRange();
                range.selectNodeContents(text);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        if (opts.snippets.timekeeper) {
            $('.timekeeper.auto-inserted, .timekeeper-logs.auto-inserted').remove();
            var d = function() {return $('<div/>');}
            var divTK = d().addClass("timekeeper timekeeper-logs-toggle auto-inserted");
            divTK.append(d().addClass("timekeeper-local-relative-time"));
            divTK.append(d().addClass("timekeeper-time"));
            divTK.append(d().addClass("timekeeper-relative-time"));
            divTK.append(d().addClass("timekeeper-clear"));
            divTK.append(d().addClass("timekeeper-bang"));
            divTK.appendTo(container);
            var divLog = d().addClass("timekeeper-logs auto-inserted");
            var pre = $('<pre/>').appendTo(divLog);
            divLog.append(d().addClass("button").click(function() { doBang() }).html("Bang!"));
            divLog.append(d().addClass("button").click(function() { selectText(pre.get(0)) }).html("select all"));
            divLog.append(d().addClass("button").click(function() { clearStorage() }).html("Clear").css({color:'#f44', marginLeft: '2em'}));
            divLog.append(d().addClass("button").addClass("timekeeper-logs-toggle").css({position:'float', float:'right', color:'#0f0'}).html("X"));
            divLog.appendTo(container);
        }

        if (!window.localStorage && opts.alert.localStorageUnsupported) { alert(
            "LocalStorage is unsupported in your browser, timing features are disabled (timekeeper extension).");
            return;
        }

        var pad = function(base, right) {
            var s = ""+right;
            if (s.length >= base.length) return s;
            else return base.substring(0, base.length - s.length) + s
        }
        var formatTime = function(t, daily) {
            daily = daily || false;
            var min = parseInt(t / 1000 / 60);
            var sec = parseInt(t / 1000 - 60 * min);
            if (min > 60) {
                var hours = parseInt(t / 1000 / 60 / 60);
                min = parseInt(t / 1000 / 60 - 60 * hours);
                if (daily) {
                    hours = t.getHours();
                }
                return pad("00", hours) +":"+ pad("00", min) + ":" + pad("00", sec);
            } else {
                return pad("00", min) + ":" + pad("00", sec);
            }
        }
        var formatDate = function(t) {
            var y = t.getFullYear();
            var m = t.getMonth() + 1;
            var d = t.getDate();
            return y + "-" + pad("00", m) + "-" + pad("00", d);
        }
        var clearStorage = function(what) {
            { // archive
                var currentArchives = localStorage.getItem(opts.localStorage.timekeeperArchives);
                var currentLogs = localStorage.getItem(opts.localStorage.timekeeperLogs);
                currentArchives = currentLogs + "\n\n" + currentArchives;
                currentArchives = currentArchives.substr(0, opts.localStorage.timekeeperArchivesMaxSize);
                localStorage.setItem(opts.localStorage.timekeeperArchives, currentArchives);
            }
            // clear
            localStorage.setItem(opts.localStorage.timekeeperLogs, null);
            log("CLEARED BY USER");
            localStorage.setItem(opts.localStorage.timekeeperBase, JSON.stringify(new Date()));
            $(opts.selectors.timekeeperClear).addClass(opts.classes.timekeeperNotification);
            setTimeout(function() {
                $(opts.selectors.timekeeperClear).removeClass(opts.classes.timekeeperNotification);
            }, opts.timekeeperNotificationPeriod);
        }
        var reset = function() {
            localStorage.setItem(opts.localStorage.timekeeperLocalBase, JSON.stringify(new Date()));
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
            var dateString = formatDate(now);
            var timeString = formatTime(now, true);
            var localBase = getDateOrSet(opts.localStorage.timekeeperLocalBase, now);
            var base = getDateOrSet(opts.localStorage.timekeeperBase, now);
            var db = (now - localBase)/1000;
            var dcb = (now - base)/1000;
            var dbtime = formatTime(now - localBase);
            var dcbtime = formatTime(now - base);
            var log = dateString + " " + timeString + " " + what + " " + dcb + " " + db + " " + dcbtime + " " + dbtime;
            
            var data = localStorage.getItem(opts.localStorage.timekeeperLogs);
            data = log + "\n" + data;
            localStorage.setItem(opts.localStorage.timekeeperLogs, data);
            $(opts.selectors.timekeeperLogsPre).html(data);
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
            $(opts.selectors.timekeeperBang).addClass(opts.classes.timekeeperNotification);
            setTimeout(function() {
                $(opts.selectors.timekeeperBang).removeClass(opts.classes.timekeeperNotification);
            }, opts.timekeeperNotificationPeriod);
            reset();
        }
        $d.unbind('keydown.logbang').bind('keydown.logbang', function(e) {
            if (e.ctrlKey) return;
            var K = opts.keys.timekeeper;
            if (e.which === K || $.inArray(e.which, K) > -1) {
                doBang();
                if (e.shiftKey) {
                    clearStorage();
                }
            }
        });
        $(opts.selectors.timekeeperLogsToggle).unbind('click.timekeeper').bind('click.timekeeper', function(e) {
            $(opts.selectors.timekeeperLogs).toggleClass(opts.classes.timekeeperLogsVisible);
        });


        // Refresh display
        var period = opts.timekeeperPeriod;
        setInterval(function() {
            var today = new Date();
            today.setMinutes(0);
            today.setHours(0);
            today.setSeconds(0);
            var now = new Date();
            $(opts.selectors.timekeeperTime).html(formatTime(now - today));
            var v = localStorage.getItem(opts.localStorage.timekeeperBase);
            if (v != null) {
                var t = now - new Date(JSON.parse(v));
                var time = formatTime(t);
                $(opts.selectors.timekeeperRelativeTime).html(time);
            }
            var v2 = localStorage.getItem(opts.localStorage.timekeeperLocalBase);
            if (v2 != null) {
                var t = now - new Date(JSON.parse(v2));
                var time = formatTime(t);
                $(opts.selectors.timekeeperLocalRelativeTime).html(time);
            }
        }, period);
    
    });

})(jQuery, 'deck');

