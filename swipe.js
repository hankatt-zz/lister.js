/*
 * Swipe 2.0
 *
 * Brad Birdsall
 * Copyright 2013, MIT License
 *
*/

function Swipe(container, options) {

  "use strict";

  // utilities
  var noop = function() {}; // simple no operation function
  var offloadFn = function(fn) { setTimeout(fn || noop, 0) }; // offload a functions execution

  // check browser capabilities
  var browser = {
    addEventListener: !!window.addEventListener,
    touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
    transitions: (function(temp) {
      var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
      for ( var i in props ) if (temp.style[ props[i] ] !== undefined) return true;
      return false;
    })(document.createElement('swipe'))
  };

  // quit if no root element
  if (!container) return;
  var element = container.children[0];
  var slides, slidePos, width, length;
  options = options || {};
  var index = parseInt(options.startSlide, 10) || 0;
  var speed = options.speed || 300;
  var debug = false;


  function setup() {

    // cache slides
    slides = element.children;
    length = slides.length;
    width = $(element).children('.row').outerWidth();

    // create an array to store current positions of each slide
    slidePos = new Array(slides.length);

    //if there's an option on the left, offset other elements by its width
    var offsetLeft = 0;

    // Determine width of each slide
    var slideWrapWidth = 0;

    $(slides).each(function(i) {
      if(i === 0 && $(this).hasClass('options'))
        offsetLeft = $(this).outerWidth();

      slidePos[i] = slideWrapWidth - offsetLeft;
      slideWrapWidth += $(this).outerWidth();
    });

    // Set total swipe element container width
    element.style.width = slideWrapWidth + 'px';

    // stack elements
    var pos = slides.length;
    while(pos--) {

      var slide = slides[pos];
      slide.style.width = slide.clientWidth + 'px';
      slide.setAttribute('data-index', pos);
      move(pos, -offsetLeft, 0);
    }

    container.style.visibility = 'visible';

  }

  function move(index, dist, speed) {
    // index = item we're viewing, dist = initiated translation distance (used for resets)
    translate(index, dist, speed);
    slidePos[index] = dist; //sets the new position for the item with # index
  }

  function translateAll(dist, speed) {
    translate(index-1, dist + slidePos[index], speed);
    translate(index, dist + slidePos[index], speed);
    translate(index+1, dist + slidePos[index], speed);
  }

  function translate(index, dist, speed) {
    var slide = slides[index];
    var style = slide && slide.style; 
    if (!style) return;

    style.webkitTransitionDuration =
    style.MozTransitionDuration =
    style.msTransitionDuration =
    style.OTransitionDuration =
    style.transitionDuration = speed + 'ms';

    style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
    style.msTransform =
    style.MozTransform =
    style.OTransform = 'translateX(' + dist + 'px)';

  }

  function translateContent(row, delta, optionswidth) {

    /* Swiping left

    //Allow row content to slowly stop sliding beyond this point
      translateContent(activeRow, Math.abs(delta.x + activeOptions.rightWidth), false);

    */

    /* Swiping right

    //Allow row content to slowly stop sliding beyond this point
      translateContent(activeRow, (delta.x - activeOptions.leftWidth), true);

    */

    // Returns 1 or -1 depending on direction of delta (1 => Left to right swipe)
    if(delta !== 0) {
      var directionalMultiplier = delta / Math.abs(delta);
      var actualTranslateDistance = (delta*directionalMultiplier) - optionswidth;

      actualTranslateDistance = actualTranslateDistance * ((width - actualTranslateDistance) / (3*width) * directionalMultiplier);
    } else {
      actualTranslateDistance = 0;
    }

    if(delta === 0)
      $(row).children().css('-webkit-transition', '-webkit-transform 0.2s');

    $(row).children().css('-webkit-transform', 'translate(' +(actualTranslateDistance) +'px, 0) translateZ(0)');
  }

  // setup initial vars
  var start = {};
  var delta = {};
  var isScrolling;

  // setup event capturing
  var events = {

    handleEvent: function(event) {

      switch (event.type) {
        case 'touchstart': this.start(event); break;
        case 'touchmove': this.move(event); break;
        case 'touchend': offloadFn(this.end(event)); break;
        case 'webkitTransitionEnd':
        case 'msTransitionEnd':
        case 'oTransitionEnd':
        case 'otransitionend':
        case 'transitionend': offloadFn(this.transitionEnd(event)); break;
        case 'resize': offloadFn(setup); break;
      }

      if (options.stopPropagation) event.stopPropagation();

    },
    start: function(event) {
      if(debug)  $("h2").html('touch');

      var touches = event.touches[0];
      // measure start values
      start = {

        // get initial touch coords
        x: touches.pageX,
        y: touches.pageY,

        // store time to determine touch duration
        time: +new Date

      };

      // used for testing first move event
      isScrolling = undefined;

      // reset delta and end measurements
      delta = {};

      // attach touchmove and touchend listeners
      if(!$(event.target).hasClass('options')) {
        element.addEventListener('touchmove', this, false);
        element.addEventListener('touchend', this, false);
      }

    },
    move: function(event) {
      if(debug) $("h2").html('move');

      // ensure swiping with one touch and not pinching
      if ( event.touches.length > 1 || event.scale && event.scale !== 1) return
      if (options.disableScroll) event.preventDefault();

      var touches = event.touches[0];

      // measure change in x and y
      delta = {
        x: touches.pageX - start.x,
        y: touches.pageY - start.y
      }

      // determine if scrolling test has run - one time test
      if (typeof isScrolling == 'undefined')
        isScrolling = !!(isScrolling || Math.abs(delta.x) < Math.abs(delta.y));

      /*  #   #   #   #   #   #   #   #   #   #

      This is where the magic happens.

      #   #   #   #   #   #   #   #   #   #   # */

      var activeRow = ($(event.target).hasClass('row')) ? event.target : event.target.parentElement;
      var activeOptions, revealedOptions;

      if (!isScrolling) {
        event.preventDefault();


        /*  # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
            
            WHEN SWIPING TO CLOSE REVEALED OPTIONS

            # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # */

        // Used to check if we have any revealed options
        revealedOptions = $(".fn-reveal.st-revealed");

        if(revealedOptions.length === 1) {

          if(revealedOptions.hasClass('left') && delta.x < 0 && delta.x > -(revealedOptions.outerWidth() + 3))
            translateAll(revealedOptions.outerWidth() + delta.x, 0);

          else if(revealedOptions.hasClass('right') && delta.x > 0 && delta.x < (revealedOptions.outerWidth() + 3))
            translateAll(-revealedOptions.outerWidth() + delta.x, 0);

        }



        /*  # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
            
            HANDLES ALL THE MOVING OF THE ROW AND TRIGGERING OF OPTIONS

            # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # */

        else {
          activeOptions = (delta.x < 0) ? activeRow.nextElementSibling : activeRow.previousElementSibling;
        }


        if(Math.abs(delta.x) < activeOptions.clientWidth) // If the swipe hasnt gone past the width of the options container, keep things moving
          translateAll(delta.x, 0);
        else {
          var directionalMultiplier = delta.x / Math.abs(delta.x);
          translateAll(directionalMultiplier*activeOptions.clientWidth, 0);
          translateContent(activeRow, delta.x, activeOptions.clientWidth); // Allow row content to slowly stop sliding beyond this point

          $(activeOptions).addClass('st-triggered');
          
          if($(activeOptions).hasClass('fn-toggle'))
            ($(".row").hasClass('st-completed')) ? $(activeOptions).removeClass('st-activated') : $(activeOptions).addClass('st-activated');
          
        }
      }

    },
    end: function(event) {
      if(debug) $("h2").html("end");

      var triggeredOptions = $(".options.st-triggered");
      var activeRow = triggeredOptions.siblings('.row');
      var touchpoint = event.target;

       /* 
          # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 

          Trigger this if the right option has been triggered.

          # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
        */ 

      if(triggeredOptions.hasClass('fn-toggle')) {
        
        translateAll(0, speed); // Resets position of elements
        translateContent(activeRow, 0, false); // Resets position of content to initial position

        // Toggle row status
        activeRow.toggleClass('st-completed');

        // Reset triggered status on triggered options pane
        $(".options.st-triggered").removeClass('st-triggered');

      } else if(triggeredOptions.hasClass('fn-reveal')) {

        if(triggeredOptions.hasClass('st-revealed') && !$(touchpoint).hasClass('option')) {

          // Update status to not revealed
          triggeredOptions.removeClass('st-revealed');

          // Reset all elements to their initial position
          translateAll(0, speed);

          // Reset triggered status on triggered options pane
          $(".options.st-triggered").removeClass('st-triggered');

        } else {
          triggeredOptions.addClass('st-revealed');
        }
      }

      // Resets content in row to initial position
      translateContent(activeRow, 0, false);

      if(triggeredOptions.length === 0) {
        // Resets elements
        translateAll(0, speed);
      }

      // measure duration
      var duration = +new Date - start.time;

      // determine if slide attempt triggers next/prev slide
      var isValidSlide =
            Number(duration) < 250               // if slide duration is less than 250ms
            && Math.abs(delta.x) > 20            // and if slide amt is greater than 20px
            || Math.abs(delta.x) > 79;           // or if slide amt is greater than half the width

      // determine if slide attempt is past start and end
      var isPastBounds =
            !index && delta.x > 0                            // if first slide and slide amt is greater than 0
            || index == slides.length - 1 && delta.x < 0;    // or if last slide and slide amt is less than 0

      if (options.continuous) isPastBounds = false;

      // determine direction of swipe (true:right, false:left)
      var fromRightToLeft = delta.x < 0;


      // kill touchmove and touchend event listeners until touchstart called again
      element.removeEventListener('touchmove', events, false)
      element.removeEventListener('touchend', events, false)

    },
    transitionEnd: function(event) {

      if (parseInt(event.target.getAttribute('data-index'), 10) == index) {

        options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

      }

    }

  }

  // trigger setup
  setup();

  // add event listeners
  if (browser.addEventListener) {

    // set touchstart event on element

    if (browser.touch) element.addEventListener('touchstart', events, false);

    if (browser.transitions) {
      element.addEventListener('webkitTransitionEnd', events, false);
      element.addEventListener('msTransitionEnd', events, false);
      element.addEventListener('oTransitionEnd', events, false);
      element.addEventListener('otransitionend', events, false);
      element.addEventListener('transitionend', events, false);
    }

    // set resize event on window
    window.addEventListener('resize', events, false);

  } else {

    window.onresize = function () { setup() }; // to play nice with old IE

  }

  // expose the Swipe API
  return {
    setup: function() {

      setup();

    },
    getPos: function() {

      // return current index position
      return index;

    },
    getNumSlides: function() {

      // return total number of slides
      return length;
    },
    kill: function() {

      // cancel slideshow
      stop();

      // reset element
      element.style.width = '';
      element.style.left = '';

      // reset slides
      var pos = slides.length;
      while(pos--) {

        var slide = slides[pos];
        slide.style.width = '';
        slide.style.left = '';

        if (browser.transitions) translate(pos, 0, 0);

      }

      // removed event listeners
      if (browser.addEventListener) {

        // remove current event listeners
        element.removeEventListener('touchstart', events, false);
        element.removeEventListener('webkitTransitionEnd', events, false);
        element.removeEventListener('msTransitionEnd', events, false);
        element.removeEventListener('oTransitionEnd', events, false);
        element.removeEventListener('otransitionend', events, false);
        element.removeEventListener('transitionend', events, false);
        window.removeEventListener('resize', events, false);

      }
      else {

        window.onresize = null;

      }

    }
  }

}


if ( window.jQuery || window.Zepto ) {
  (function($) {
    $.fn.Swipe = function(params) {
      return this.each(function() {
        $(this).data('Swipe', new Swipe($(this)[0], params));
      });
    }
  })( window.jQuery || window.Zepto )
}
