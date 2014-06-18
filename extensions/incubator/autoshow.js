

$(document).bind('deck.init', function() {

$(".autoshow, .autoshow-raw").each(function(){
    $('>div:gt(0)', this).hide();
})

$('.autoshow, .autoshow-raw').each(function(){
  var t = this
  $('>div:not(:first)', t).css('display', 'none');
  var period = parseInt($(t).attr('data-period') || 4400);
  var fadeIn = parseInt($(t).attr('data-time-in') || 1200);
  var fadeOut = parseInt($(t).attr('data-time-out') || 800);
  setInterval(function() { 
   $('>div:first', t)
    .fadeOut(fadeOut, function() {$(this).css('display', 'none');}) // work a round a bug/optim that keep display:block when parent is none (e.g. when slide is already hidden)
    .next()
    .fadeIn(fadeIn)
    .end()
    .appendTo(t);
},  period);
  });


});

