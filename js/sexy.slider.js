/*!
 * SexySlider v1.3 - for jQuery 1.3+
 * http://codecanyon.net/item/sexy-slider/87148
 *
 * Copyright 2010, Eduardo Daniel Sada
 * You need to buy a license if you want use this script.
 * http://codecanyon.net/wiki/buying/howto-buying/licensing/
 *
 * Date: Mar 27 2010
 
 * SexySlider is a JQuery plugin that lets you easily
 * create powerful javascript Sliders with very nice
 * transition effects. Inspirated in jqFancyTransitions.
 * Developed in OOP.
 */

(function($) {
  
  var ie6 = (jQuery.browser.msie && parseInt(jQuery.browser.version, 10) < 7 && parseInt(jQuery.browser.version, 10) > 4);

  if (ie6)
  {
    try { document.execCommand("BackgroundImageCache", false, true); } catch(err) {}
  };

  if ($.proxy === undefined) // proxy is included in jquery 1.4+
  {
    $.extend({
      proxy: function( fn, thisObject ) {
        if ( fn )
        {
          proxy = function() { return fn.apply( thisObject || this, arguments ); };
        };
        return proxy;
      }
    });
  };

  var SSPrototype = function() { };

  $.extend(SSPrototype.prototype, {
  
  init: function(el, options) {
    var defaults = {
      navigation      : '',
      control         : '',
      width           : 500,
      height          : 332,
      strips          : 20,
      auto            : true,
      autopause       : true,
      delay           : 3000, // in ms
      stripSpeed      : 400,  // in ms
      titleOpacity    : 0.7,
      titleSpeed      : 1000, // in ms
      titlePosition   : 'bottom',    // top, right, bottom, left
      direction       : 'alternate', // left, right, alternate, random
      effect          : 'random'     // curtain, zipper, wave, fountain, cascade, fade, random
    };

    this.dom    = {};
    this.img    = [];
    this.titles = [];
    this.links  = [];
    this.imgInc = 0;
    this.imgInterval = 0;
    this.inc    = 0;
    this.order  = [];
    this.controls = [];
    this.direction = 0;

    this.options = $.extend({}, defaults, options);
    this.element = el;

    var params = this.options;
    var self   = this;

		$('img', el).each(function(i) {
      var item       = $(this);
      self.img[i]    = item.attr('src');
      self.titles[i] = item.attr('alt') ? item.attr('alt') : (item.attr('title') ? item.attr('title') : '');
      self.links[i]  = item.parent().is('a') ? item.parent().attr('href') : false;
      
      if (self.options.control)
      {
        self.controls[i] = $('<a href="#" class="sexyslider-control" rel="'+i+'"><span>'+(i+1)+'</span></a>');
        $(self.options.control).append(self.controls[i]);
        
        if (i==0)
        {
          self.controls[i].addClass('active');
        }

        self.controls[i].click(function(event) {
          self.transition($(this).attr('rel'));
          event.preventDefault();
        });
      };
      
      item.hide();
		});

		$(this.element).css({
			'background-image'    : 'url('+this.img[0]+')',
			'background-position' : 'top left',
			'position'  : 'relative',
			'overflow'  : 'hidden',
			'width'     : params.width,
			'height'    : params.height
    });

    this.dom.title = $("<div class='sexyslider-title'>"+this.titles[0]+"</div>");
    this.dom.title.css({
      'background-color' : '#000000',
      'color'     : '#FFFFFF',
      'position'  : 'absolute',
      'padding'   : '5px 10px',
      'z-index'   : 5
    });
    if (params.titlePosition=='bottom') {
      this.dom.title.css({ 'bottom'    : 0, 'left'      : 0, 'width'     : params.width - 20 });
    } else if (params.titlePosition=='top') {
      this.dom.title.css({ 'top'       : 0, 'left'      : 0, 'width'     : params.width - 20 });
    } else if (params.titlePosition=='right') {
      this.dom.title.css({ 'top'       : 0, 'right'     : 0, 'width'     : parseInt(params.width * 30 / 100), 'height'    : params.height });
    } else if (params.titlePosition=='left') {
      this.dom.title.css({ 'top'       : 0, 'left'      : 0, 'width'     : parseInt(params.width * 30 / 100), 'height'    : params.height });
    };
    $(this.element).append(this.dom.title);

    if (this.titles[this.imgInc])
    {
      $(this.dom.title).css({
        'opacity' : params.titleOpacity
      });
    }
    else
    {
      $(this.dom.title).css({
        'opacity' : 0
      });
    };
    
		var sWidth      = parseInt(params.width / params.strips);
		var sobrante    = params.width - sWidth * params.strips; // lo que sobra, se lo vamos comiendo de a uno.
		var sLeft       = 0;
    this.dom.strip  = [];

    // creating strips
    for (i=0; i < params.strips; i++)
    {

      if ( sobrante > 0)
      {
        tsWidth = sWidth + 1;
        sobrante--;
      }
      else
      {
        tsWidth = sWidth;
      }
			
      var eachStrip = $("<div class='sexyslider-strip'></div>").get(0);
      $(eachStrip).css({
        'background-position': -sLeft +'px top',
        'width'   : tsWidth + "px",
        'height'  : params.height + "px",
        'position': 'absolute',
        'left'    : sLeft
      });
      
      this.dom.strip.push ( eachStrip );

      sLeft += tsWidth;

      this.order[i] = i;

    }; // end for
    $(this.element).append(this.dom.strip);

    this.dom.link = $("<a class='sexyslider-link'></a>");
    this.dom.link.css({
      'text-decoration' : 'none',
      'position'  : 'absolute',
      'top'       : 0,
      'left'      : 0,
      'border'    : 0,
      'z-index'   : 8,
      'width'     : params.width,
      'height'    : params.height
    });
    $(this.element).append(this.dom.link);

    if (this.links[this.imgInc])
    {
      this.dom.link.attr('href', this.links[this.imgInc]);
    }
    else
    {
      this.dom.link.css({'display':'none'});
    };

    // add events
    if (params.navigation)
    {
      var prev = $('<a href="#" class="sexyslider-prev"><span>Prev</span></a>');
      var next = $('<a href="#" class="sexyslider-next"><span>Next</span></a>');

      prev.click($.proxy(function(event) { this.transition("prev"); event.preventDefault(); }, this));
      next.click($.proxy(function(event) { this.transition("next"); event.preventDefault(); }, this));

      $(params.navigation).append(prev, next);
    };
        
    $(el).bind('mouseover', $.proxy(function() { this.setpause(true) }, this));
    $(el).bind('mouseout',  $.proxy(function() { this.setpause(false) }, this));

    $(this.dom.title).bind('mouseover', $.proxy(function() { this.setpause(true) }, this));
    $(this.dom.title).bind('mouseout',  $.proxy(function() { this.setpause(false)}, this));


		if (params.auto)
		{
      this.slideshow();
    }

    return this;
  },
  
  slideshow: function() {
    clearInterval(this.imgInterval);
    this.imgInterval = setInterval($.proxy(function() {this.transition();}, this ), this.options.delay+((this.options.stripSpeed / 6)*this.options.strips)+this.options.stripSpeed);
  },

  setpause: function(val) {
    this.pause = val;
  },

  transition: function(dir) {
    if (this.pause == true || dir == this.imgInc)
    {
      return false;
    };
    
    this.pause = true;
    this.stripInterval = setInterval($.proxy(function() { this.strips(this.order[this.inc]); }, this), this.options.stripSpeed / 6);

    $(this.element).css({
      'background-image' : 'url('+this.img[this.imgInc]+')'
    });

    switch (dir)
    {
      case "next":
        this.imgInc = (this.imgInc+1 >= this.img.length) ? 0 : this.imgInc+1;
        break;
      case "prev":
        this.imgInc = (this.imgInc-1 < 0) ? this.img.length-1 : this.imgInc-1;
        break;
      case "first":
        this.imgInc = 0;
        break;
      case "last":
        this.imgInc = this.img.length-1;
        break;
      default:
        if (!isNaN(parseFloat(dir)) && isFinite(dir)) //is numeric
        {
          this.imgInc = parseInt(dir);
        }
        else // for auto
        {
          this.imgInc = (this.imgInc+1 >= this.img.length) ? 0 : this.imgInc+1;
        };
        break;
    }; //end switch
    
    if (dir !== undefined)
    {
      if (this.options.autopause)
      {
        clearInterval(this.imgInterval);
      }
      else
      {
        this.slideshow();
      }
    }

    if (this.titles[this.imgInc]!='')
    {
      $(this.dom.title).html(this.titles[this.imgInc]);
      opacity = this.options.titleOpacity;
    }
    else
    {
      opacity = 0;
    };

    $(this.dom.title).animate({ 'opacity' : opacity }, this.options.titleSpeed);

    if (this.links[this.imgInc])
    {
      this.dom.link.attr('href', this.links[this.imgInc]);
      this.dom.link.css({'display':'block'});
    }
    else
    {
      this.dom.link.css({'display':'none'});
    };
    
    if (this.options.control)
    {
      $.each(this.controls, function(i, el) {
        $(el).removeClass('active');
      });
      $(this.controls[this.imgInc]).addClass('active');
    }

    this.inc = 0;

    switch (this.options.effect) // ordenar strips
    {
      case 'fountain':
        $.proxy(this.effects.fountain, this)();
        break;
      case 'wave':
        $.proxy(this.effects.wave, this)();
        break;
      case 'zipper':
        $.proxy(this.effects.zipper, this)();
        break;
      case 'cascade':
        $.proxy(this.effects.cascade, this)();
        break;
      case 'curtain':
        $.proxy(this.effects.curtain, this)();
        break;
      case 'fade':
        $.proxy(this.effects.fade, this)();
        break;
      case 'random':
        $.proxy(this.effects.random, this)();
        break;
    }; // end switch

    // left, right, alternate, random
    if ((this.options.direction == 'right' && this.order[0] == 1))
    {
      this.order.reverse();
      this.direction = 1;
    }
    else if (this.options.direction == 'random')
    {
      this.order = this.shuffle(this.order);
    }
    else if (this.options.direction == 'alternate')
    {
      if (this.direction == 0)
      {
        this.direction = 1;
      }
      else
      {
        this.order.reverse();
        this.direction = 0;
      };
    }
    else
    {
      this.direction = 0;
    };
  },

  shuffle: function(arr) {
    for(
      var j, x, i = arr.length; i;
      j = parseInt(Math.random() * i),
      x = arr[--i], arr[i] = arr[j], arr[j] = x
    );
    return arr;
  },
  
  effects: {
    cascade: function() {
      var odd   = 1;
      var total = this.order.length;
      var mitad = parseInt(this.options.strips/2);
      for (i=0; i < total; i++) {
        $(this.dom.strip[i]).css( 'bottom', 'auto' );
        this.order[i] = mitad - (parseInt((i+1)/2)*odd);
        odd *= -1;
      };
      this.order[this.options.strips-1] = 0;
    },
    
    curtain: function() {
      $.proxy(this.effects.wave, this)();
    },
    
    wave: function() {
      for (i=0; i < this.order.length; i++) {
          $(this.dom.strip[i]).css( 'bottom', 'auto' );
          this.order[i] = i;
      };
    },
    
    zipper: function() {
      for (i=0; i < this.order.length; i++) {
        if (i%2 == 0) {
          $(this.dom.strip[i]).css( 'bottom', 0 );
        } else {
          $(this.dom.strip[i]).css( 'bottom', 'auto' );
        };
        this.order[i] = i;
      };
    },
    
    fountain: function() {
      var odd   = 1;
      var total = this.order.length;
      var mitad = parseInt(this.options.strips/2);

      for (i=0; i < total; i++) {
        $(this.dom.strip[i]).css( 'bottom', 0 );
        this.order[i] = mitad - (parseInt((i+1)/2)*odd);
        odd *= -1;
      };
      this.order[this.options.strips-1] = 0;
    },
    
    fade: function() {
      $.proxy(this.effects.wave, this)();
    },
    
    random: function() {
      var i = parseInt(Math.random() * 4);
      switch (i) {
        case 0:
          $.proxy(this.effects.fountain, this)();
          this.options.usewidth = false;
          break;
        case 1:
          $.proxy(this.effects.wave, this)();
          this.options.usewidth = false;
          break;
        case 2:
          $.proxy(this.effects.fountain, this)();
          $.proxy(this.effects.wave, this)();
          $.proxy(this.effects.zipper, this)();
          this.options.usewidth = false;
          break;
        case 3:
          $.proxy(this.effects.wave, this)();
          this.options.usewidth = true;
          break;
        case 4:
          $.proxy(this.effects.cascade, this)();
          this.options.usewidth = false;
          break;
      }
    }
  },
  
  strips: function(itemId) {
    if (this.inc == this.options.strips) {
      // end animation
      clearInterval(this.stripInterval);
      
      setTimeout($.proxy(function() {this.pause = false;}, this), this.options.stripSpeed);
      return false;
    };
    
    this.pause = true;
    
    var strip = $(this.dom.strip[itemId]);
    
    if (!ie6 || this.options.effect == 'fade') {
      strip.css({ 'opacity' : 0 });
    };

    if (this.options.effect == 'curtain' || this.options.usewidth == true)
    {
      currWidth = strip.width();
      
      strip.css({
        'width'   : 0,
        'background-image' : 'url('+this.img[this.imgInc]+')'
      });
      
      strip.animate({
        'width'   : currWidth,
        'opacity' : 1
      }, this.options.stripSpeed);
    }
    else if (this.options.effect == 'fade')
    {
      strip.css({
        'background-image' : 'url('+this.img[this.imgInc]+')'
      });
      strip.animate({
        'opacity' : 1
      }, this.options.stripSpeed);
    }
    else
    {
      strip.css({
        'height'  : 0,
        'background-image' : 'url('+this.img[this.imgInc]+')'
      });

      strip.animate({
        'height'  : this.options.height,
        'opacity' : 1
      }, this.options.stripSpeed);
    }

    this.inc++;
  }

	});


	$.fn.SexySlider = function(options) {
    this.each(function() {
      if (!this.SSObject) {
        this.SSObject = new SSPrototype().init(this, options);
      };
      return this.SSObject;
    });
  };

})(jQuery);