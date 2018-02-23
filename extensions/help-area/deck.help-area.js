/*!
Deck JS - deck.help-area
Copyright (c) 2018-2018 Rémi Emonet
Dual licensed under the MIT license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
*/

/*
This module create a "help popup" which other extensions can contribute to.
This popup can contain help about default keybindings (going further in a
clean manner would most likely need to refactor key handling), information
coming from the presentation itself (author, abstact, etc.), access to rare
tools that have no key binding and edition of rare configuration variables.
*/
(function($, undefined) {
  var $document = $(document);
  var rootCounter;

  var maybeAddSnippet = function() {
    var options = $.deck('getOptions');
    if (options.snippets.helparea) {
      $('.helparea-div.auto-inserted').remove();
      if ($(options.selectors.helpareaDiv).size() > 0 && options.alert.helparea) {
        alert("'options.snippets.helparea' is true but a "+options.selectors.helpareaDiv+" has been found."
              +"\nThis might cause interaction glitches."
              +"\n"
              +"\nSuggestion: remove your html snippet or pass the {snippets: {helparea: false}} option."
             );
      }
      $('<div/>').addClass('helparea-div').addClass('auto-inserted')
        .append($('<div/>').addClass('helparea').attr('data-progress', 'max-height: 0.9*screen.height')
          .append($('<h3/>').text('Help, Tools and Configuration'))
          .append($('<h4/>').text('Keys'))
          .append($('<div/>').addClass('helpkeys'))
          .append($('<h4/>').text('Session Variables'))
          .append($('<div/>').addClass('sessionvars'))
        )
      .appendTo($.deck('getContainer'));
    }
  };

  var bindKeyEvents = function() {
    $document.unbind('keydown.deckhelparea');
    $document.bind('keydown.deckhelparea', function(event) {
      var key = $.deck('getOptions').keys.helparea;
      if (event.which === key || $.inArray(event.which, key) > -1) {
        event.preventDefault();
        $.deck('toggleHelpArea');
      }
    });
  };

    /*
  var populateDatalist = function() {
    var options = $.deck('getOptions');
    var $datalist = $(options.selectors.gotoDatalist);

    $.each($.deck('getSlides'), function(i, $slide) {
      var id = $slide.attr('id');
      if (id) {
        $datalist.append('<option value="' + id + '">');
      }
    });
  };
*/


  /*
  Extends defaults/options.

  options.keys.helparea
    The numeric keycode used to show the Help Area.

  */
  $.extend(true, $.deck.defaults, {
    classes: {
      helparea: 'deck-helparea'
    },

    selectors: {
      helpareaDiv: '.helparea-div'
    },

    snippets: {
      helparea: true
    },

    alert: {
      helparea: true
    },

    keys: {
      helparea: 72 // h
    },
  });

  /*
  jQuery.deck('helpAdvertiseKey', keyPath, docStringOrElement)

  Add a key binding in the help area, from its keyPath.
  The keypath is what to put after options.keys, to get the key code.
  */
  $.deck('extend', 'helpAdvertiseKey', function(keyPath, docStringOrElement) {
    var options = $.deck('getOptions');
      $('<div/>').text(String.fromCharCode(options.keys[keyPath])).attr('title', keyPath) // TODO parse foo.bar.foo and handle list with modifiers
      .appendTo($('.helparea-div .helpkeys'))
      $('<div/>').text(docStringOrElement)
      .appendTo($('.helparea-div .helpkeys'))
  });

  /*
  jQuery.deck('helpSessionStorage', storageKey, docStringOrElement, editable=true, clearable=true)

  Adds a viewer/editor for a session storage value.
  */
  $.deck('extend', 'helpSessionStorage', function(key, docStringOrElement, editable, clearable) {
    var editable = (typeof editable !== 'undefined') ? editable : true;
    var clearable = (typeof clearable !== 'undefined') ? clearable : true;
    var options = $.deck('getOptions');
    var input = $('<input/>').val(window.sessionStorage.getItem(key));
    var div2 = $('<div/>');
    $('<span/>').text(docStringOrElement).appendTo(div2);
    $(input).appendTo(div2);
    $('<div/>').text(key).appendTo($('.helparea-div .sessionvars'));
    $(div2).appendTo($('.helparea-div .sessionvars'));

    if (!editable) {
      $(input).prop('enabled', false);
    }
    var saveForUndo = null;
    var span = $('<span>⤬</span>');
    input.change(function() {
      window.sessionStorage.setItem(key, $(this).val());
      saveForUndo = null;
      $(this).text('⤬');
    });
    span.click(function() {
      if (saveForUndo == null) {
        saveForUndo = window.sessionStorage.getItem(key);
        window.sessionStorage.removeItem(key);
        input.val('');
        $(this).text('⟲');
      } else {
        window.sessionStorage.setItem(key, saveForUndo);
        saveForUndo = null;
        $(this).text('⤬');
      }
    });
    if (clearable) {
      span.appendTo(div2);
    }
  });

  /*
  jQuery.deck('showHelpArea')

  Shows the Help Area by adding the class specified by the helparea class
  option to the deck container.
  */
  $.deck('extend', 'showHelpArea', function() {
    var options = $.deck('getOptions');
    $.deck('getContainer').addClass(options.classes.helparea);
  });

  /*
  jQuery.deck('hideHelpArea')

  Hides the Help Area by removing the class specified by the helparea class
  option from the deck container.
  */
  $.deck('extend', 'hideHelpArea', function() {
    var options = $.deck('getOptions');
    $.deck('getContainer').removeClass(options.classes.helparea);
  });

  /*
  jQuery.deck('toggleHelpArea')

  Toggles between showing and hiding the Help Area.
  */
  $.deck('extend', 'toggleHelpArea', function() {
    var options = $.deck('getOptions');
    var hasClass = $.deck('getContainer').hasClass(options.classes.helparea);
    $.deck(hasClass ? 'hideHelpArea' : 'showHelpArea');
  });

  $document.bind('deck.init', function() {
    maybeAddSnippet();
    bindKeyEvents();
    $.deck('helpAdvertiseKey', 'helparea', 'Toggle this help area');
  });

  // show other extensions that this extension has been loaded
  window.helpAreaAvailable = 1.0;
})(jQuery);

