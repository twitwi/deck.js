(function($, deck, undefined) {
  var $deck = $[deck];
  var $d = $(document);
  var canvases;

  var x; // function to transform click events
  var y; // function to transform click events
	
	// Each shape has this interface:
  //
  // canvas: DOM object for the canvas
  // params: {
  //   color: shape color,
  //   diameter: shape diameter
  // }
  //
  // function Shape(canvas, params){
  //   // Begin the shape. This is called when the user clicks.
  //   this.begin = function(event);
  //
  //   // Continue the shape. On mousemove.
  //   this.extend = function(event);
  //
  //   // End the shape. On mouseup.
  //   this.end = function(event);
  //
  //   // Draw the shape.
  //   // Use the given 2dcontext to draw the object.
  //   this.draw = function(context);
  var shapes = {
    line: function(canvas, params){
      var _canvas = canvas;
      this.params = params;
      var _lineJoin = "round";
      var _lineCap = "round";
      
      var clicks = []
      function addClick(x, y, dragging){
        clicks.push({
          x: x,
          y: y,
          dragging: dragging
        });
      }
      
      // Start drawing this shape.
      this.begin = function(e){
        var mouseX = x(e);
        var mouseY = y(e);
        addClick(mouseX, mouseY);
      };
      
      // The shape is being extended.
      // This is typically due to a mouse drag
      this.extend = function(e){
        var mouseX = x(e);
        var mouseY = y(e);
        addClick(mouseX, mouseY, true);
      }
      
      this.draw = function(context){
        var opts = $deck('getOptions');
        var m = opts.annotate.designSizeMultiplier;

        context.strokeStyle = this.params.color;
        context.lineJoin = _lineJoin;
        context.lineCap = _lineCap;
        context.lineWidth = this.params.diameter;
        context.beginPath();
        for(var i = 0; i < clicks.length; i++){
          if(clicks[i].dragging && i){
            context.moveTo(clicks[i - 1].x, clicks[i - 1].y);
          }
          else{
            context.moveTo(clicks[i].x - 1, clicks[i].y);
          }
          context.lineTo(clicks[i].x, clicks[i].y);
        }
        context.closePath();
        context.stroke();
      }
    },
    
    circle: function(canvas, params){
      var _canvas = canvas;
      this.params = params;
      
      var start;
      var end;
      
      this.begin = function(e){
        var mouseX = x(e);
        var mouseY = y(e);
        
        start = {x: mouseX, y: mouseY};
        end = start;
      };
      
      this.extend = function(e){
        var mouseX = x(e);
        var mouseY = y(e);
        end = {x: mouseX, y: mouseY};
      };
      
      this.draw = function(context){
        if(start){
          context.beginPath();
          var radius = Math.sqrt(
            Math.pow(Math.abs(start.x - end.x), 2) +
            Math.pow(Math.abs(start.y - end.y), 2));
          
          var centerX = start.x; // + (end.x - start.x) / 2;
          var centerY = start.y; // + (end.y - start.y) / 2;
          
          context.strokeStyle = this.params.color;
          context.lineWidth = this.params.diameter;
          context.arc(centerX, centerY, radius, 2 * Math.PI, false);
          context.stroke();
        }
      };
    },
    
    rectangle: function(canvas, params){
      var _canvas = canvas;
      this.params = params;
      var start;
      var end;
      
      this.begin = function(e){
          var mouseX = x(e);
          var mouseY = y(e);
        start = {x: mouseX, y: mouseY};
        end = start;
      };
      
      this.extend = function(e){
        var mouseX = x(e);
        var mouseY = y(e);
        end = {x: mouseX, y: mouseY};
      };
      
      this.draw = function(context){
        if(start && end){
          context.beginPath();
          context.rect(start.x, start.y, end.x - start.x, end.y - start.y);
          context.strokeStyle = this.params.color;
          context.lineWidth = this.params.diameter;
          context.stroke();        
        }
      };
    }
  };
  
  $.extend(true, $deck.defaults, {
    ids: {
      annotateTools: 'deck-annotate-tools'
    },
    classes: {
      annotateCanvas: 'deck-annotate-canvas'
    },
    keys: {
      annotate: {
        undo: {
          mod: "ctrl",
          val: 90  // "z"
        },
        redo: {
          mod: ["ctrl", "shift"],
          val: 90  // "z"
        },
        toggleCanvas: 80,  // "p"
        clearCanvas: 67,  // "c"
        clearAll: {
          mod: "ctrl",
          val: 67
        }
      }
		},
    annotate: {
      enabled: false,
      showTools: true,
			colorsPerRow: 3,
      currentColor: '#00f',
      colors: {
        'blue': '#00f',
        'green': '#0f0',
        'red': '#f00',
        'white': '#fff',
        'black': '#000',
        'gray': '#666',
        'cyan': '#0ff',
        'yellow': '#ff0',
        'magenta': '#f0f',
      },
      currentShape: null,
			shapes: shapes,
      currentLineDiameter: null,
			lineDiameters: {
        'small': 2,
        'medium': 6,
        'large': 12,
        'Large': 18,
        'tiny': 1,
      },
      persistentStorage: false,  // Uses localStorage to keep annotations beyond a refresh
      designSizeMultiplier: 1.5,
    }
	});
  
  var Canvas = function(domCanvas){
    var _shapes = [];
    var _redo = [];
    this.dom = domCanvas;
    
    this.enable = function(){
      // TODO
    }
    
    this.disable = function(){
      // TODO
    }
    
    this.addShape = function(shape){
      _shapes.push(shape);
      _redo = [];
      this.redraw();
    };
    
    this.clear = function(){
      _shapes = [];
      _redo = []; 
      this.previousCanvas = null;
      this.previousDrawnIndex = -1;
      this.backupCanvas = null;
      this.redraw();
    }
    
    this.undo = function(){
      if(_shapes.length > 0){
        _redo.push(_shapes.pop());
        this.previousCanvas = null;
        this.previousDrawnIndex = -1;
        this.backupCanvas = null;
      }
      this.redraw();
    }
    
    this.redo = function(){
      if(_redo.length > 0){
        _shapes.push(_redo.pop());
      }
      this.redraw();
    }

    this.previousCanvas = null;
    this.previousDrawnIndex = -1;
    this.backupCanvas = null;

    this.redraw = function(){
      if(!this.dom){
        return;
      }
      
      var elem = this.dom[0];

      if (this.previousCanvas !== elem) {
          this.previousDrawnIndex = -1;
      }
      this.previousCanvas = elem;

      var opts = $deck("getOptions");

      var m = opts.annotate.designSizeMultiplier;
      {
          let w = opts.designWidth * m;
          let h = opts.designHeight * m;
          if (elem.width != w || elem.height != h) {
              elem.width = opts.designWidth * m;
              elem.height = opts.designHeight * m;
              this.previousDrawnIndex = -1;
          }
          if (!this.backupCanvas || this.backupCanvas.width != w || this.backupCanvas.height != h) {
              this.backupCanvas = document.createElement('canvas');
              this.backupCanvas.width = w;
              this.backupCanvas.height = h;
          }
      }

      if(!$deck("getOptions").annotate.enabled || !elem){
        return;
      }
      
      var context = elem.getContext("2d");
      if(_shapes){
        context.resetTransform();
        context.clearRect(0, 0, elem.width, elem.height);
        context.drawImage(this.backupCanvas, 0, 0);
        context.scale(m, m);
        let start = Math.max(0, this.previousDrawnIndex+1);
        for(var i = start; i < _shapes.length-1; i++){
          _shapes[i].draw(context);
          this.previousDrawnIndex = i;
        }
        if (start < _shapes.length-1) {
          var backCtx = this.backupCanvas.getContext('2d');
          backCtx.drawImage(elem, 0, 0);
        }
        if (_shapes.length > 0) {
          _shapes[_shapes.length-1].draw(context);
        }
      }
    }
  }
  
  var ShapeMap = function(useLocalstorage){ // TODO localstorage keyed by canvas id?
    var _map = {};
    
    this.add = function(id, shape, dom){
      if(!_map[id]){
        _map[id] = new Canvas(dom);
      }
      _map[id].addShape(shape);
    }
    
    this.get = function(id){
      return _map[id];
    }
    
    this.clear = function(){
      $.each(_map, function(id, canvas){
        canvas.clear();
      });
    }
  };
  
  function isKeypress(event, bindings){
    if (!event || !bindings){
      return false;
    }
    
    var mods = $.grep(["ctrl", "alt", "shift"], function(obj){
      return event[obj + "Key"];
    });
    
    // Try single key
    if (event.which === bindings && mods.length === 0){
      return true;
    }
    
    // Try array of keys
    if ($.inArray(event.which, bindings) > -1 && mods.length === 0){
      return true;
    }
    
    function arraysAreEqual(a, b){
      return $.isArray(a) && $.isArray(b) &&
        $(a).not(b).length == 0 && $(b).not(a).length == 0;
    }
    
    // If {mod, val} match pressed modifiers and key
    if(event.which == bindings.val &&
       (mods.length == 1 && mods[0] === bindings.mod ||
       arraysAreEqual(mods, bindings.mod))){
      return true;
    }
    
    if($.isArray(bindings)){
      for(var i = 0; i < bindings.length; i++){
        if(isKeypress(event, bindings[i])){
          return true;
        }
      };
    }
    
    return false;
  }
	
  // Create tools
  function createTools(opts){
    var tools = $("<div>").attr('id', opts.ids.annotateTools);
    
    $("<div>")
      .attr('id', 'tools-title')
      .text("Drawing Tools")
      .appendTo(tools);
    
    var pickers = $("<div>")
      .attr('id', 'picker-tools')
      .addClass("hidden")
      .appendTo(tools);
    
    // Create shape chooser
    var shapePicker = $("<div>")
      .attr('id', 'shape-picker')
      .appendTo(pickers);
    $("<div>")
      .addClass('shape')
      .attr('title', 'line')
      .append($("<div>")
        .attr('id', 'shape-line'))
      .click(function(e){
        var opts = $deck('getOptions');
        $('.shape.active').removeClass('active');
        $(this).addClass('active');
        opts.annotate.currentShape = 'line';
      })
      .appendTo(shapePicker)
    
    $("<div>")
      .addClass('shape')
      .attr('title', 'rectangle')
      .append($("<div>")
        .attr('id', 'shape-rectangle'))
      .click(function(e){
        var opts = $deck('getOptions');
        $('.shape.active').removeClass('active');
        $(this).addClass('active');
        opts.annotate.currentShape = 'rectangle';
      })
      .appendTo(shapePicker);
    
    $("<div>")
      .addClass('shape')
      .attr('title', 'circle')
      .append($("<div>")
        .attr('id', 'shape-circle'))
      .click(function(e){
        var opts = $deck('getOptions');
        $('.shape.active').removeClass('active');
        $(this).addClass('active');
        opts.annotate.currentShape = 'circle';
      })
      .appendTo(shapePicker);
    
    // Select default shape
    shapePicker.children().first().click();
    
    // Create size chooser
    var sizePicker = $("<div>")
      .attr('id', 'size-picker')
      .appendTo(pickers);
    $.each(opts.annotate.lineDiameters, function(name, size){
      $("<div/>")
        .addClass('sizebox')
        .appendTo(sizePicker)
        .attr('title', name)
        .click(function(e){
            var opts = $deck('getOptions');
            $('.sizebox.active').removeClass('active');
            $(this).addClass('active');
            opts.annotate.currentLineDiameter = size;
        })
        .append(
          $("<span>")
            .addClass('size')
            .width(size)
            .height(size)
            .css('background-color', 'black')
        );
    });
    
    // Select default size
    sizePicker.children().first().click();
    
    // Create color picker
    var colorPicker = $("<table>")
      .attr('id', 'color-picker')
      .appendTo(pickers);

    var currentRow;
    var idx = 0;
    $.each(opts.annotate.colors, function(name, color){
      if(idx % opts.annotate.colorsPerRow == 0){
        currentRow = $("<tr>");
        colorPicker.append(currentRow);
      }
      
      var col = $('<td>');
      var picker = $('<div>')
        .css('background-color', color)
        .addClass('color')
        .appendTo(col)
        .click(function(e){
          var opts = $deck('getOptions');
          $('.color.active').removeClass('active');
          $(this).addClass('active');
          opts.annotate.currentColor = $(this).css('background-color');
        }
      );
      if(idx == 0){
        picker.addClass('active');
      }
      picker.attr('title', name);
      currentRow.append(col);
      idx++;
    });
    
    // Select default color
    colorPicker.children().first().click();

    // Create undo/do/clear buttons
    let button = function(text, method) {
      $("<div/>")
        .addClass('actionbutton')
        .appendTo(tools)
        .click(function() {
          var cv = getCanvas();
          if(cv){
            cv[method]();
          }
        })
        .text(text);
    };
    button('↶', 'undo');
    button('↷', 'redo');
    button('↯', 'clear');

    // Create expand link.
    $("<div>")
      .addClass('expand-arrow')
      .addClass('right')
      .appendTo(tools)
      .click( function (e){
          $(this).toggleClass('right left');
          $("#picker-tools").toggleClass("hidden");
      });
      
    $(document.body).append(tools);
  }

  var getSlide = function(ind) {
    return $[deck]('getToplevelSlideOf', $[deck]('getSlide', ind)).node;
  }

  // Add canvases to slides
	$d.bind('deck.init', function(){
    var opts = $deck('getOptions');
    var slides = $deck('getTopLevelSlides');
    canvases = new ShapeMap(opts.annotate.persistentStorage);
    
    $.each(slides, function(idx, slide){
      var container = $("<div>");
      container.hide().addClass(opts.classes.annotateCanvas);
      
      var canvas = $("<canvas>");
      canvas[0].id = opts.classes.annotateCanvas + "-" + idx;
      initializeCanvas(canvas);
      
      container.append(canvas);
      slide.prepend(container);
    });
    
    createTools(opts);
    
    if(opts.annotate.enabled){
      enableCanvasOnSlide(getSlide());
      if(opts.annotate.showTools){
        $("#" + opts.ids.annotateTools).show();
      }
    }
    
    // Slide change event
    $d.bind('deck.change', function(event, from, to){

      if ($[deck]('getToplevelSlideOfIndex', to).node.is($[deck]('getToplevelSlideOfIndex', from).node)) {
        return;
      }

      $('.' + opts.classes.annotateCanvas).hide();  // Hide all canvases

        {
          let w = opts.designWidth;
          let h = opts.designHeight;
          // set the coordinates extractors
          x = function(e) {
              let current = getSlide();
              let r = current.get(0).getBoundingClientRect();
              return w * (e.clientX - r.left) / r.width;
          };
          y = function(e) {
              let current = getSlide();
              let r = current.get(0).getBoundingClientRect();
              return h * (e.clientY - r.top) / r.height;
          };
      }

      if(opts.annotate.enabled){
        var slide = getSlide(to);
        enableCanvasOnSlide(slide);
        var cv = getCanvas(slide);
        if(cv){
          cv.redraw();
        }
      }
    });
    
    $d.bind('keyup.deck', function(e){
      var opts = $deck('getOptions');
      if(isKeypress(e, opts.keys.annotate.toggleCanvas)){
        opts.annotate.enabled = !opts.annotate.enabled;
        if(opts.annotate.enabled){
          if(opts.annotate.showTools){
            $("#" + opts.ids.annotateTools).show();
          }
          enableCanvasOnSlide();
        }
        else{
          $("#" + opts.ids.annotateTools).hide();
          disableCanvasOnSlide();
        }
        var cv = getCanvas();
        if(cv){
          cv.redraw();
        }
      }
      else if(opts.annotate.enabled){
        if(isKeypress(e, opts.keys.annotate.clearCanvas)){
          var cv = getCanvas();
          if(cv){
            cv.clear();
          }
        }
        else if(isKeypress(e, opts.keys.annotate.clearAll)){
          canvases.clear();
        }
        else if(isKeypress(e, opts.keys.annotate.undo)){
          var cv = getCanvas();
          if(cv){
            cv.undo();
          }
        }
        else if(isKeypress(e, opts.keys.annotate.redo)){
          var cv = getCanvas();
          if(cv){
            cv.redo();
          }
        }
      }
    });
  });
  
  function getContainer(slide){
    slide = slide || getSlide();
    var opts = $deck('getOptions');
    return slide.children('.' + opts.classes.annotateCanvas);
  }
  
  // Get the canvas for a slide
  function getCanvas(slide){
    var dom = getContainer(slide).children("canvas");
    return canvases.get(dom.attr('id'));
  }
  
  // Enable the canvas on the given slide
  // or the current slide if not provided
  function enableCanvasOnSlide(slide){
    $deck("getOptions").annotate.enabled = true;
    getContainer(slide).show();
  }
  
  // Disable the canvas on the given slide
  // or the current slide if not provided
  function disableCanvasOnSlide(slide){
    $deck("getOptions").annotate.enabled = false;
    getContainer(slide).hide();
  }
  
  // Set up the click hooks for a canvas
  function initializeCanvas(canvas){
    var opts = $deck('getOptions');
    var currentShape;
    var painting = false;
    var canvasId = canvas.attr('id');
    
    canvas.mousedown(function(e){
      // Left click only
      if(e.which == 1) {
        currentShape = new shapes[opts.annotate.currentShape](
          this,
          {
            color: opts.annotate.currentColor,
            diameter: opts.annotate.currentLineDiameter
          }
        );
        canvases.add(canvasId, currentShape, canvas);
        currentShape.begin(e);
        canvases.get(canvasId).redraw();
        painting = true;
      }
    });
    
    canvas.mousemove(function(e){
      if(painting && currentShape && currentShape.extend){
        currentShape.extend(e);
        canvases.get(canvasId).redraw();
      }
    });
    
    canvas.mouseup(function(e){
      if(currentShape && currentShape.end){
        currentShape.end(e);
        currentShape = null;
      }
      painting = false;
    });
    
    canvas.mouseleave(function(e){
      if(currentShape && currentShape.end){
        currentShape.end(e);
        currentShape = null;
      }
      painting = false;
    });
  }
    
  // Make sure resizing the window changes the canvas size
  $(window).resize(function(){
    var cv = getCanvas();
    if(cv){
      cv.redraw();
    }
  });
  
})(jQuery, 'deck');
