(function ($, window, document, undefined) {
    var VERSION = 1.00;
    var CanvasSlider = function (element, options) {
        this._options = options;
        this._frame = $(element);
        this.init();
        return this;
    };
    CanvasSlider.prototype = {
        _validateOptions: function () {
            var o = this._options,
                i;
            if ((o.startIndex >= this._length) || (o.startIndex < 0)) {
                o.startIndex = 0;
            }
            if (o.width <= 0) {
                o.width = 960;
            }
            if (o.height <= 0) {
                o.height = 400;
            }
            if (o.speed <= 0) {
                o.speed = 500;
            }
            if (o.interval <= o.speed) {
                o.interval = 5000;
            }
            if ('ontouchstart' in window) {
                this._hasTouch = true;
            }
            if (o.barColumns < 1) {
                o.barColumns = 12;
            }
            if (o.barRows < 1) {
                o.barRows = 5;
            }
            if (o.gridColumns < 1) {
                o.gridColumns = 12;
            }
            if (o.gridRows < 1) {
                o.gridRows = 5;
            }
            if (document.createElement('canvas').getContext) {
                this._useCanvas = true;
            } else {
                this._useCanvas = false;
            }
            return this;
        },
        init: function () {
            var self = this;
            this._slideContainer = this._frame.children('ul.slides');
            this._slides = this._slideContainer.children('li');
            if (this._options.captionAnimation) {
                this._frame.find('.canvas-caption').css({
                    'opacity': '0'
                });
            }
            this._slideWidth = this._options.width;
            this._slideHeight = this._options.height;
            this._length = this._slides.length;
            this._useCanvas = false;
            this._imgArr = [];
            this._validateOptions();
            this._current = this._options.startIndex;
            this._beforeCurrent;
            this._isAnimationRunning = false;
            this._effect;
            this._isPlaying = false;
            this._isPaused = false;
            this._isHover = false;
            this._dirNext;
            this._dirPrev;
            this._createSlider();
            if (this._options.controlNav) {
                this._createControlNav();
            }
            if (this._options.directionNav) {
                this._createDirectionNav();
            }
            this._playButton;
            this._playBtn;
            this._pauseBtn;
            if (this._options.playButton) {
                this._createPlayButton();
            }
            this.SWIPE_MIN = 50;
            this._slideCoordX = {
                start: 0,
                end: 0
            };
            this._slideCoordY = {
                start: 0,
                end: 0
            };
            this._hasTouch = false;
            this._isTouch = false;
            this._initEvents();
            this._options.start.call(self);
            this._loadContents(0, this._length);
        },
        _createSlider: function () {
            var self = this;
            this._frame.css({
                'width': self._slideWidth,
                'height': self._slideHeight
            });
            if (this._options.fluid) {
                this._resetSize();
            }
            this._slides.hide().eq(self._current).show();
            return this;
        },
        _resetSize: function () {
            var self = this;
            this._frame.css({
                'width': '100%'
            });
            this._slideWidth = this._frame.width();
            this._slideHeight = Math.round((this._options.height / this._options.width) * this._slideWidth);
            this._frame.css({
                'height': self._slideHeight + 'px'
            });
            $(window).resize(function () {
                self._slideWidth = self._frame.width();
                self._slideHeight = Math.round((self._options.height / self._options.width) * self._slideWidth);
                self._frame.css({
                    'height': self._slideHeight + 'px'
                });
            });
            return this;
        },
        _showSlide: function (index, callback) {
            var self = this;
            this._slides.fadeOut(self._options.speed).eq(index).fadeIn(self._options.speed, function () {
                callback();
            });
        },
        _createDirectionNav: function () {
            var self = this;
            this._dirPrev = $('<a class="directionNav prev" href="#">' + this._options.prevText + '</a>').bind("click.cs", function (e) {
                e.preventDefault();
                self._stopSlideshow().prev();
            }).appendTo(this._frame);
            this._dirNext = $('<a class="directionNav next" href="#">' + this._options.nextText + '</a>').bind("click.cs", function (e) {
                e.preventDefault();
                self._stopSlideshow().next();
            }).appendTo(this._frame);
            if (this._options.directionNavHide) {
                this._dirNext.hide();
                this._dirPrev.hide();
            }
            if (!this._options.loop) {
                this._setDirectionNavState();
            }
            return this;
        },
        _setDirectionNavState: function () {
            if (this._current === 0) {
                this._dirPrev.addClass("first");
                this._dirNext.removeClass("last");
            } else if (this._current === (this._length - 1)) {
                this._dirNext.addClass("last");
                this._dirPrev.removeClass("first");
            } else {
                this._dirPrev.removeClass("first");
                this._dirNext.removeClass("last");
            }
            return this;
        },
        _createControlNav: function () {
            var self = this,
                thumbUrl;
            this._frame.append('<ul class="controlNav"></ul>');
            this._controlNav = this._frame.find(".controlNav");
            if (this._options.controlNavThumbs) {
                thumbUrl = this._slides;
                this._controlNav.addClass('thumbs');
            }
            for (i = 0; i < this._length; i += 1) {
                if (self._options.controlNavThumbs) {
                    thumbUrl = this._slides.eq(i).data('thumb') || this._slides.eq(i).data('src');
                }
                $('<li> <a href="#">' + (self._options.controlNavThumbs === true ? '<img src="' + thumbUrl + '" />' : this._createIndex(i)) + '</a> </li>').bind("click.cs", {
                    self: self,
                    index: i
                }, self._controlNavClick).appendTo(self._controlNav);
            }
            this._controlNavItems = this._controlNav.find('li');
            this._setControlNavActive(self._current);
            if (this._options.controlNavHide) {
                this._controlNav.hide();
            }
            return this;
        },
        _setControlNavActive: function (index) {
            this._controlNavItems.find('a').removeClass("active");
            this._controlNavItems.eq(index).find('a').addClass("active");
            return this;
        },
        _createIndex: function (index) {
            var index = '';
            if (this._options.customIndex.length !== this._length) {
                index = i + 1;
            } else {
                index = this._options.customIndex[i];
            }
            return index;
        },
        _controlNavClick: function (e) {
            e.preventDefault();
            e.data.self._stopSlideshow().show(e.data.index);
        },
        _initEvents: function () {
            var self = this;
            if (this._options.mouse) {
                this._slides.bind('mousewheel.cs', {
                    elem: self
                }, self._mouseScrollSlide).bind('DOMMouseScroll.cs', {
                        elem: self
                    }, self._mouseScrollSlide);
            }
            if (this._options.keyboard) {
                $(document).bind('keydown.cs', function (e) {
                    if (e.keyCode === 39) {
                        self._stopSlideshow().next();
                        return false;
                    } else if (e.keyCode === 37) {
                        self._stopSlideshow().prev();
                        return false;
                    }
                });
            }
            this._frame.bind('mouseenter.cs', function () {
                if (self._isPlaying && self._options.pauseOnHover) {
                    self._isPaused = true;
                    self._pause(true);
                    self._isHover = true;
                }
                if (self._options.directionNav && self._options.directionNavHide) {
                    self._dirNext.stop(true, true).fadeIn();
                    self._dirPrev.stop(true, true).fadeIn();
                }
                if (self._options.controlNav && self._options.controlNavHide) {
                    self._controlNav.stop(true, true).fadeIn();
                }
                if (self._options.playButton && self._options.playButtonHide) {
                    self._playButton.stop(true, true).fadeIn();
                }
            });
            this._frame.bind('mouseleave.cs', function () {
                if (self._isPlaying && self._options.pauseOnHover) {
                    if (self._isPaused) {
                        self._play(self._options.interval);
                        self._isHover = false;
                    }
                }
                if (self._options.directionNav && self._options.directionNavHide) {
                    self._dirNext.stop(true, true).fadeOut();
                    self._dirPrev.stop(true, true).fadeOut();
                }
                if (self._options.controlNav && self._options.controlNavHide) {
                    self._controlNav.stop(true, true).fadeOut();
                }
                if (self._options.playButton && self._options.playButtonHide) {
                    self._playButton.fadeOut();
                }
            });
            if (this._hasTouch && this._options.swipe) {
                this._slideCoordX = {
                    start: 0,
                    end: 0
                };
                this._slideCoordY = {
                    start: 0,
                    end: 0
                };
                this._slides.bind('touchstart', {
                    elem: self
                }, self._touchStart).bind('touchmove', {
                        elem: self
                    }, self._touchMove).bind('touchend', {
                        elem: self
                    }, self._touchEnd);
            }
            return this;
        },
        _mouseScrollSlide: function (e) {
            var self = e.data.elem,
                delta = (typeof e.originalEvent.wheelDelta == 'undefined') ? -e.originalEvent.detail : e.originalEvent.wheelDelta;
            delta > 0 ? self.prev() : self.next();
            self._stopSlideshow();
            return false;
        },
        _touchStart: function (e) {
            e.data.elem._slideCoordX.start = e.originalEvent.touches[0].pageX;
            e.data.elem._slideCoordY.start = e.originalEvent.touches[0].pageY;
            e.data.elem._isTouch = true;
        },
        _touchMove: function (e) {
            if (e.originalEvent.touches.length > 1) {
                e.data.elem._isTouch = false;
                return false;
            }
            e.preventDefault();
            e.data.elem._slideCoordX.end = e.originalEvent.touches[0].pageX;
            e.data.elem._slideCoordY.end = e.originalEvent.touches[0].pageY;
        },
        _touchEnd: function (e) {
            var self = e.data.elem;
            if (self._slideCoordX.end > 0) {
                if (Math.abs(self._slideCoordX.start - self._slideCoordX.end) > self.SWIPE_MIN) {
                    if (self._slideCoordX.end < self._slideCoordX.start) {
                        self.next();
                    } else {
                        self.prev();
                    }
                }
                self._stopSlideshow();
            }
            self._slideCoordX.start = self._slideCoordY.end = 0;
            self._isTouch = false;
        },
        _stopSlideshow: function () {
            if (this._isPlaying && this._options.pauseOnClick) {
                this.pause();
            }
            return this;
        },
        _play: function (interval) {
            var self = this;
            if (!this._isPlaying) {
                this._isPlaying = true;
            }
            this._isPaused = false;
            autoplay = setInterval(function () {
                self.next();
                if (!self._options.loop && self._current === self._length - 1) {
                    self._pause();
                    return;
                }
            }, interval);
            if (this._options.playButton) {
                this._setPlayButtonState();
            }
            return this;
        },
        _pause: function (isHover) {
            clearInterval(autoplay);
            if (!isHover) {
                this._isPlaying = false;
                this._isPaused = false;
            }
            if (this._options.playButton) {
                this._setPlayButtonState();
            }
            return this;
        },
        _createPlayButton: function () {
            var self = this;
            $('<ul class="playButton"></ul>').appendTo(self._frame).append($('<li class="play">' + self._options.playText + '</li>').bind("click.es", function () {
                    self.play(self._options.interval);
                })).append($('<li class="pause">' + self._options.pauseText + '</li>').bind("click.es", function () {
                    if (self._isPlaying) {
                        self.pause();
                    }
                }));
            this._playButton = this._frame.find('.playButton');
            this._playBtn = this._playButton.find('.play');
            this._pauseBtn = this._playButton.find('.pause');
            if (this._options.playButtonHide) {
                this._playButton.hide();
            }
            this._setPlayButtonState();
            return this;
        },
        _setPlayButtonState: function () {
            if (this._isPlaying) {
                this._pauseBtn.show();
                this._playBtn.hide();
            } else {
                this._pauseBtn.hide();
                this._playBtn.show();
            }
            return this;
        },
        _loadImage: function (imgSrc, slide, success, fail) {
            var self = this,
                img, url, target;
            img = new Image();
            img.src = imgSrc;
            $(img).bind('load', function () {
                url = slide.data('url');
                $(this).prependTo(slide).addClass('main-image');
                if (self._options.addLinkToImage && url !== undefined) {
                    target = slide.data('target') || self._options.linkTarget;
                    $(this).wrap('<a href="' + url + '" target="' + target + '"></a>');
                }
                if ($.isFunction(success)) {
                    success();
                }
            }).bind('error', function () {
                    if ($.isFunction(fail)) {
                        fail();
                    }
                });
            if ($.browser.msie) {
                $(img).attr({
                    'src': imgSrc
                });
            }
            return this;
        },
        _loadContents: function (index, max) {
            var self = this,
                src, slide, callback;
            if (index >= this._length) {
                return this;
            }
            if (index < max) {
                slide = this._slides.eq(index);
                src = slide.data('src');
                callback = function () {
                    self._loadContents(index + 1, max);
                    if (index === self._options.startIndex) {
                        self._showCaption(self._current, true, function () {
                            if (self._options.autoplay) {
                                self.play(self._options.interval);
                            }
                        });
                    }
                    if (index === self._length - 1) {
                        self._options.complete.call(self);
                    }
                };
                this._loadImage(src, slide, function () {
                    slide.data('load', 'true');
                    self._imgArr[index] = new Image();
                    self._imgArr[index].src = src;
                    callback();
                }, function () {
                    slide.data('load', 'false');
                    self._imgArr[index] = new Image();
                    self._imgArr[index].src = src;
                    callback();
                });
                return this;
            }
        },
        _showAnimatedCaption: function (elem, effect, move, speed, easing, delay, callback, finish) {
            var t, l, startTop, startLeft;
            t = parseInt(elem.css('top'), 10);
            l = parseInt(elem.css('left'), 10);
            switch (effect) {
                case 'up':
                    startLeft = l;
                    startTop = t + move;
                    break;
                case 'down':
                    startLeft = l;
                    startTop = t - move;
                    break;
                case 'left':
                    startLeft = l + move;
                    startTop = t;
                    break;
                case 'right':
                    startLeft = l - move;
                    startTop = t;
                    break;
                default:
                    startLeft = l;
                    startTop = t;
            }
            elem.css({
                'left': startLeft + 'px',
                'top': startTop + 'px',
                'opacity': '0'
            }).animate({
                    'left': l + 'px',
                    'top': t + 'px',
                    'opacity': '1'
                }, speed, easing, function () {
                    if (jQuery.isFunction(finish)) {
                        finish();
                    }
                });
            setTimeout(function () {
                callback();
            }, delay);
            return this;
        },
        _hideAnimatedCaption: function (elem, effect, move, speed, easing, delay, callback, finish) {
            var t, l, endTop, endLeft;
            t = parseInt(elem.css('top'), 10);
            l = parseInt(elem.css('left'), 10);
            switch (effect) {
                case 'up':
                    endLeft = l;
                    endTop = t - move;
                    break;
                case 'down':
                    endLeft = l;
                    endTop = t + move;
                    break;
                case 'left':
                    endLeft = l - move;
                    endTop = t;
                    break;
                case 'right':
                    endLeft = l + move;
                    endTop = t;
                    break;
                default:
                    endLeft = l;
                    endTop = t;
            }
            elem.animate({
                'left': endLeft + 'px',
                'top': endTop + 'px',
                'opacity': '0'
            }, speed, easing, function () {
                $(this).css({
                    'top': t + 'px',
                    'left': l + 'px'
                });
                if (jQuery.isFunction(finish)) {
                    finish();
                }
            });
            setTimeout(function () {
                callback();
            }, delay);
            return this;
        },
        _animatedCaption: function (elem, index, max, isShow, finish) {
            var self = this,
                effect, move, speed, easing, delay, currentElem, finishCallback, callback, nextCaption;
            if (index < max) {
                currentElem = elem.eq(index);
                nextCaption = elem.eq(index + 1);
                effect = currentElem.data('effect') || this._options.captionEffect;
                move = parseInt(currentElem.data('move'), 10) || this._options.captionMove;
                speed = parseInt(currentElem.data('speed'), 10) || this._options.captionSpeed;
                easing = currentElem.data('easing') || this._options.captionEasing;
                delay = parseInt(nextCaption.data('delay'), 10) || this._options.captionDelay;
                finishCallback = function () {
                    if (index === max - 1) {
                        if (jQuery.isFunction(finish)) {
                            finish();
                        }
                    }
                }
                callback = function () {
                    self._animatedCaption(elem, index + 1, max, isShow, finish);
                }
                if (isShow) {
                    this._showAnimatedCaption(currentElem, effect, move, speed, easing, delay, function () {
                        callback()
                    }, function () {
                        finishCallback();
                    });
                } else {
                    this._hideAnimatedCaption(currentElem, effect, move, speed, easing, delay, function () {
                        callback();
                    }, function () {
                        finishCallback();
                    });
                }
                return this;
            } else {
                return this;
            }
        },
        _showCaption: function (i, isShow, callback) {
            var caption = this._slides.eq(i).find('.canvas-caption');
            if (this._options.captionAnimation) {
                if (caption.length === 0) {
                    callback();
                } else {
                    this._animatedCaption(caption, 0, caption.length, isShow, function () {
                        callback();
                    });
                }
            } else {
                callback();
            }
            return this;
        },
        _fade: function (context, cw, ch, callback) {
            var self = this,
                zoom = 1.1,
                img1 = self._imgArr[self._current],
                img2 = self._imgArr[self._beforeCurrent],
                img1Width = img1.width,
                img1Height = img1.height,
                zoom1Width = img1Width / zoom,
                zoom1Height = img1Height / zoom,
                img2Width = img2.width,
                img2Height = img2.height,
                zoom2Width = img2Width / zoom,
                zoom2Height = img2Height / zoom,
                shape1 = {
                    image: img1,
                    sx: self._effect === 'fadeIn' ? (img1Width - zoom1Width) / 2 : 0,
                    sy: self._effect === 'fadeIn' ? (img1Height - zoom1Height) / 2 : 0,
                    sw: self._effect === 'fadeIn' ? zoom1Width : img1Width,
                    sh: self._effect === 'fadeIn' ? zoom1Height : img1Height,
                    dx: 0,
                    dy: 0,
                    dw: cw,
                    dh: ch,
                    op: self._effect === 'fadeIn' ? 0 : 1
                }, shape2 = {
                    image: img2,
                    sx: 0,
                    sy: 0,
                    sw: img2Width,
                    sh: img2Height,
                    dx: 0,
                    dy: 0,
                    dw: cw,
                    dh: ch,
                    op: 1
                }, t = this._options.speed / 33,
                animShape, lastOp;
            if (this._effect === 'fadeIn') {
                animShape = shape1;
                lastOp = 1;
            } else {
                animShape = shape2;
                lastOp = 0;
            }
            var runEffects = function () {
                context.clearRect(0, 0, cw, ch);
                if (self._effect === 'fadeOut') {
                    context.globalAlpha = shape1.op;
                    context.drawImage(shape1.image, shape1.sx, shape1.sy, shape1.sw, shape1.sh, shape1.dx, shape1.dy, shape1.dw, shape1.dh);
                    shape2.sw -= (img2Width - zoom2Width) / t;
                    shape2.sw = Math.max(zoom2Width, shape2.sw);
                    shape2.sh -= (img2Height - zoom2Height) / t;
                    shape2.sh = Math.max(zoom2Height, shape2.sh);
                    shape2.sx = ((img2Width - shape2.sw) / zoom);
                    shape2.sy = ((img2Height - shape2.sh) / zoom);
                    shape2.op -= 1 / t;
                    shape2.op = Math.max(0, shape2.op);
                } else {
                    shape1.sw += (img1Width - zoom1Width) / t;
                    shape1.sw = Math.min(img1Width, shape1.sw);
                    shape1.sh += (img1Height - zoom1Height) / t;
                    shape1.sh = Math.min(img1Height, shape1.sh);
                    shape1.sx = ((img1Width - shape1.sw) / zoom);
                    shape1.sy = ((img1Height - shape1.sh) / zoom);
                    shape1.op += 1 / t;
                    shape1.op = Math.min(1, shape1.op);
                }
                context.globalAlpha = animShape.op;
                context.drawImage(animShape.image, animShape.sx, animShape.sy, animShape.sw, animShape.sh, animShape.dx, animShape.dy, animShape.dw, animShape.dh);
                if (animShape.op !== lastOp) {
                    setTimeout(function () {
                        runEffects();
                    }, 33);
                } else {
                    callback();
                }
            }
            runEffects();
        },
        _barVertical: function (context, cw, ch, callback) {
            var self = this,
                img1 = self._imgArr[self._current],
                img2 = self._imgArr[self._beforeCurrent],
                minHeight = (4 / 5) * ch,
                barColumns = this._options.barColumns,
                start1 = 1,
                t = self._options.speed / 33,
                bar = function (image, sx, sy, sw, sh, dx, dy, dw, dh, op) {
                    this.img = image;
                    this.sx = sx;
                    this.sy = sy;
                    this.sw = sw;
                    this.sh = sh;
                    this.dx = dx;
                    this.dy = dy;
                    this.dw = dw;
                    this.dh = dh;
                    this.op = op;
                };
            if (this._effect === 'slideVerticalUp' || this._effect === 'slideVerticalDown') {
                barColumns = 1
            }
            var bars1 = [],
                sx1, sy1, sw1, sh1, dx1, dy1, dw1, dh1, barWidth = Math.round(cw / barColumns),
                barHeight = ch,
                img1BarWidth = Math.round(img1.width / barColumns),
                img1BarHeight = img1.height,
                pos = 'genap',
                dy = barHeight,
                x, y, imgX;
            for (var i = 0; i < barColumns; i++) {
                x = i * barWidth;
                y = 0;
                imgX = i * img1BarWidth;
                if (i === barColumns - 1) {
                    barWidth = cw - x;
                    img1BarWidth = img1.width - imgX;
                }
                sx1 = imgX;
                sy1 = y;
                sw1 = img1BarWidth;
                sh1 = img1BarHeight;
                dx1 = x;
                if (self._effect === 'barVerticalUpLeft' || self._effect === 'barVerticalUpRight' || self._effect === 'slideVerticalUp') {
                    dy1 = barHeight;
                } else if (self._effect === 'barVerticalDownLeft' || self._effect === 'barVerticalDownRight' || self._effect === 'slideVerticalDown') {
                    dy1 = -barHeight;
                } else {
                    dy1 = dy;
                }
                dw1 = barWidth;
                dh1 = barHeight;
                bars1.push(new bar(img1, sx1, sy1, sw1, sh1, dx1, dy1, dw1, dh1, 1));
                if (self._effect === 'barVerticalCrossLeft' || self._effect === 'barVerticalCrossRight') {
                    if (dy === barHeight) {
                        dy = -barHeight;
                    } else {
                        dy = barHeight;
                    }
                }
            }
            if (this._effect === 'barVerticalUpLeft' || this._effect === 'barVerticalDownLeft' || this._effect === 'barVerticalCrossLeft') {
                bars1.reverse();
            }
            if (self._slides.eq(self._beforeCurrent).data('load') === 'true') {
                var bars2 = [],
                    sx2, sy2, sw2, sh2, dx2, dy2, dw2, dh2, img2BarWidth = Math.round(img2.width / barColumns),
                    img2BarHeight = img2.height,
                    bar2Width = Math.round(cw / barColumns);
                bar2Height = ch;
                for (var e = 0; e < barColumns; e++) {
                    var x2 = e * bar2Width,
                        y2 = 0,
                        imgX2 = e * img2BarWidth;
                    if (e === barColumns - 1) {
                        bar2Width = cw - x2;
                        img2BarWidth = img2.width - imgX2;
                    }
                    sx2 = imgX2;
                    sy2 = y2;
                    sw2 = img2BarWidth;
                    sh2 = img2BarHeight;
                    dx2 = x2;
                    dy2 = 0;
                    dw2 = bar2Width;
                    dh2 = bar2Height;
                    bars2.push(new bar(img2, sx2, sy2, sw2, sh2, dx2, dy2, dw2, dh2, 1));
                }
                if (this._effect === 'barVerticalUpLeft' || this._effect === 'barVerticalDownLeft' || this._effect === 'barVerticalCrossLeft') {
                    bars2.reverse();
                }
            }
            var tmpBar1, isCrossGanjil;
            var runEffects = function () {
                context.clearRect(0, 0, cw, ch);
                for (var i = 0; i < start1; i++) {
                    if (self._effect === 'barVerticalCrossLeft' || self._effect === 'barVerticalCrossRight') {
                        if (self._effect === 'barVerticalCrossLeft') {
                            if (barColumns % 2 === 0) {
                                if (i % 2 === 0) {
                                    pos = 'genap';
                                } else {
                                    pos = 'ganjil';
                                }
                            } else {
                                if (i % 2 === 0) {
                                    pos = 'ganjil';
                                } else {
                                    pos = 'genap';
                                }
                            }
                        } else {
                            if (i % 2 === 0) {
                                pos = 'ganjil';
                            } else {
                                pos = 'genap';
                            }
                        }
                    }
                    var tmpBar1 = bars1[i],
                        isCrossGanjil;
                    if (self._effect === 'barVerticalCrossLeft' || self._effect === 'barVerticalCrossRight') {
                        isCrossGanjil = pos === 'ganjil' ? true : false;
                    }
                    if (self._slides.eq(self._beforeCurrent).data('load') === 'true') {
                        var tmpBar2 = bars2[i];
                        if (self._effect === 'barVerticalUpLeft' || self._effect === 'barVerticalUpRight' || self._effect === 'slideVerticalUp' || isCrossGanjil) {
                            tmpBar2.dy -= barHeight / t;
                            tmpBar2.dy = Math.max(-barHeight, tmpBar2.dy);
                        } else if (self._effect === 'barVerticalDownLeft' || self._effect === 'barVerticalDownRight' || self._effect === 'slideVerticalDown' || !isCrossGanjil) {
                            tmpBar2.dy += barHeight / t;
                            tmpBar2.dy = Math.min(barHeight, tmpBar2.dy);
                        }
                        context.drawImage(tmpBar2.img, tmpBar2.sx, tmpBar2.sy, tmpBar2.sw, tmpBar2.sh, tmpBar2.dx, tmpBar2.dy, tmpBar2.dw, tmpBar2.dh);
                    }
                    if (self._effect === 'barVerticalUpLeft' || self._effect === 'barVerticalUpRight' || self._effect === 'slideVerticalUp' || isCrossGanjil) {
                        tmpBar1.dy -= barHeight / t;
                        tmpBar1.dy = Math.max(0, tmpBar1.dy);
                    } else if (self._effect === 'barVerticalDownLeft' || self._effect === 'barVerticalDownRight' || self._effect === 'slideVerticalDown' || !isCrossGanjil) {
                        tmpBar1.dy += barHeight / t;
                        tmpBar1.dy = Math.min(0, tmpBar1.dy);
                    }
                    context.drawImage(tmpBar1.img, tmpBar1.sx, tmpBar1.sy, tmpBar1.sw, tmpBar1.sh, tmpBar1.dx, tmpBar1.dy, tmpBar1.dw, tmpBar1.dh);
                }
                var lastIndex = start1 - 1;
                if (start1 < barColumns) {
                    if (self._effect === 'barVerticalUpLeft' || self._effect === 'barVerticalUpRight' || self._effect === 'slideVerticalUp') {
                        if (bars1[lastIndex].dy < minHeight) {
                            start1 += 1;
                        }
                    } else if (self._effect === 'barVerticalDownLeft' || self._effect === 'barVerticalDownRight' || self._effect === 'slideVerticalDown') {
                        if (bars1[lastIndex].dy > -minHeight) {
                            start1 += 1;
                        }
                    } else {
                        if (self._effect === 'barVerticalCrossLeft') {
                            if (barColumns % 2 === 0) {
                                if (lastIndex % 2 === 0) {
                                    if (bars1[lastIndex].dy > -minHeight) {
                                        start1 += 1;
                                    }
                                } else {
                                    if (bars1[lastIndex].dy < minHeight) {
                                        start1 += 1;
                                    }
                                }
                            } else {
                                if (lastIndex % 2 === 0) {
                                    if (bars1[lastIndex].dy < minHeight) {
                                        start1 += 1;
                                    }
                                } else {
                                    if (bars1[lastIndex].dy > -minHeight) {
                                        start1 += 1;
                                    }
                                }
                            }
                        } else {
                            if (lastIndex % 2 === 0) {
                                if (bars1[lastIndex].dy < minHeight) {
                                    start1 += 1;
                                }
                            } else {
                                if (bars1[lastIndex].dy > -minHeight) {
                                    start1 += 1;
                                }
                            }
                        }
                    }
                    setTimeout(function () {
                        runEffects();
                    }, 33);
                } else {
                    if (bars1[barColumns - 1].dy !== 0) {
                        setTimeout(function () {
                            runEffects();
                        }, 33);
                    }
                }
                if (bars1[barColumns - 1].dy === 0) {
                    if ($.isFunction(callback)) {
                        callback();
                    }
                }
            }
            runEffects();
        },
        _barHorizontal: function (context, cw, ch, callback) {
            var self = this,
                img1 = self._imgArr[self._current],
                img2 = self._imgArr[self._beforeCurrent],
                barRows = self._options.barRows,
                bar = function (image, sx, sy, sw, sh, dx, dy, dw, dh, op) {
                    this.img = image;
                    this.sx = sx;
                    this.sy = sy;
                    this.sw = sw;
                    this.sh = sh;
                    this.dx = dx;
                    this.dy = dy;
                    this.dw = dw;
                    this.dh = dh;
                    this.op = op;
                };
            if (self._effect === 'slideHorizontalLeft' || self._effect === 'slideHorizontalRight') {
                barRows = 1;
            }
            var bars1 = [],
                sx1, sy1, sw1, sh1, dx1, dy1, dw1, dh1, barWidth = cw,
                barHeight = Math.round(ch / barRows),
                img1BarWidth = img1.width,
                img1BarHeight = Math.round(img1.height / barRows),
                pos = 'genap',
                dx = barWidth,
                x, y, imgY;
            for (var i = 0; i < barRows; i++) {
                x = 0;
                y = i * barHeight;
                imgY = i * img1BarHeight;
                if (i === barRows - 1) {
                    barHeight = ch - y;
                    img1BarHeight = img1.height - imgY;
                }
                sx1 = 0;
                sy1 = imgY;
                sw1 = img1BarWidth;
                sh1 = img1BarHeight;
                dy1 = y;
                if (self._effect === 'barHorizontalDownLeft' || self._effect === 'barHorizontalUpLeft' || self._effect === 'slideHorizontalLeft') {
                    dx1 = barWidth;
                } else if (self._effect === 'barHorizontalUpRight' || self._effect === 'barHorizontalDownRight' || self._effect === 'slideHorizontalRight') {
                    dx1 = -barWidth;
                } else {
                    dx1 = dx;
                }
                dw1 = barWidth;
                dh1 = barHeight;
                bars1.push(new bar(img1, sx1, sy1, sw1, sh1, dx1, dy1, dw1, dh1, 1));
                if (dx === barWidth) {
                    dx = -barWidth;
                } else {
                    dx = barWidth;
                }
            }
            if (this._effect === 'barHorizontalUpLeft' || this._effect === 'barHorizontalUpRight' || this._effect === 'barHorizontalCrossUp') {
                bars1.reverse();
            }
            if (self._slides.eq(self._beforeCurrent).data('load') === 'true') {
                var bars2 = [],
                    sx2, sy2, sw2, sh2, dx2, dy2, dw2, dh2, img2BarWidth = img2.width,
                    img2BarHeight = Math.round(img2.height / barRows);
                barWidth = cw;
                barHeight = Math.floor(ch / self._options.barRows);
                for (var e = 0; e < barRows; e++) {
                    var x2 = 0,
                        y2 = e * barHeight,
                        imgY2 = e * img2BarHeight;
                    if (e === barRows - 1) {
                        barHeight = ch - y2;
                        img1BarHeight = img2.height - imgY2;
                    }
                    sx2 = 0;
                    sy2 = imgY2;
                    sw2 = img2BarWidth;
                    sh2 = img2BarHeight;
                    dy2 = y2;
                    dx2 = 0;
                    dw2 = barWidth;
                    dh2 = barHeight;
                    bars2.push(new bar(img2, sx2, sy2, sw2, sh2, dx2, dy2, dw2, dh2, 1));
                }
                if (this._effect === 'barHorizontalUpLeft' || this._effect === 'barHorizontalUpRight' || this._effect === 'barHorizontalCrossUp') {
                    bars2.reverse();
                }
            }
            var start1 = 1,
                t = self._options.speed / 33,
                minWidth = (4 / 5) * barWidth;
            var runEffects = function () {
                context.clearRect(0, 0, cw, ch);
                for (var i = 0; i < start1; i++) {
                    if (self._effect === 'barHorizontalCrossUp' || self._effect === 'barHorizontalCrossDown') {
                        if (self._effect === 'barHorizontalCrossUp') {
                            if (barRows % 2 === 0) {
                                if (i % 2 === 0) {
                                    pos = 'genap';
                                } else {
                                    pos = 'ganjil';
                                }
                            } else {
                                if (i % 2 === 0) {
                                    pos = 'ganjil';
                                } else {
                                    pos = 'genap';
                                }
                            }
                        } else {
                            if (i % 2 === 0) {
                                pos = 'ganjil';
                            } else {
                                pos = 'genap';
                            }
                        }
                    }
                    var tmpBar1 = bars1[i],
                        isCrossGanjil;
                    if (self._effect === 'barHorizontalCrossUp' || self._effect === 'barHorizontalCrossDown') {
                        isCrossGanjil = pos === 'ganjil' ? true : false;
                    }
                    if (self._slides.eq(self._beforeCurrent).data('load') === 'true') {
                        var tmpBar2 = bars2[i];
                        if (self._effect === 'barHorizontalDownLeft' || self._effect === 'barHorizontalUpLeft' || self._effect === 'slideHorizontalLeft' || isCrossGanjil) {
                            tmpBar2.dx -= barWidth / t;
                            tmpBar2.dx = Math.max(-barWidth, tmpBar2.dx);
                        } else if (self._effect === 'barHorizontalDownRight' || self._effect === 'barHorizontalUpRight' || self._effect === 'slideHorizontalRight' || !isCrossGanjil) {
                            tmpBar2.dx += barWidth / t;
                            tmpBar2.dx = Math.min(barWidth, tmpBar2.dx);
                        }
                        context.drawImage(tmpBar2.img, tmpBar2.sx, tmpBar2.sy, tmpBar2.sw, tmpBar2.sh, tmpBar2.dx, tmpBar2.dy, tmpBar2.dw, tmpBar2.dh);
                    }
                    if (self._effect === 'barHorizontalDownLeft' || self._effect === 'barHorizontalUpLeft' || self._effect === 'slideHorizontalLeft' || isCrossGanjil) {
                        tmpBar1.dx -= barWidth / t;
                        tmpBar1.dx = Math.max(0, tmpBar1.dx);
                    } else if (self._effect === 'barHorizontalDownRight' || self._effect === 'barHorizontalUpRight' || self._effect === 'slideHorizontalRight' || !isCrossGanjil) {
                        tmpBar1.dx += barWidth / t;
                        tmpBar1.dx = Math.min(0, tmpBar1.dx);
                    }
                    context.drawImage(tmpBar1.img, tmpBar1.sx, tmpBar1.sy, tmpBar1.sw, tmpBar1.sh, tmpBar1.dx, tmpBar1.dy, tmpBar1.dw, tmpBar1.dh);
                }
                var lastIndex = start1 - 1;
                if (start1 < barRows) {
                    if (self._effect === 'barHorizontalDownLeft' || self._effect === 'barHorizontalUpLeft' || self._effect === 'slideHorizontalLeft') {
                        if (bars1[lastIndex].dx < minWidth) {
                            start1 += 1;
                        }
                    } else if (self._effect === 'barHorizontalDownRight' || self._effect === 'barHorizontalUpRight' || self._effect === 'slideHorizontalRight') {
                        if (bars1[lastIndex].dx > -minWidth) {
                            start1 += 1;
                        }
                    } else {
                        if (self._effect === 'barHorizontalCrossUp') {
                            if (barRows % 2 === 0) {
                                if (lastIndex % 2 === 0) {
                                    if (bars1[lastIndex].dx > -minWidth) {
                                        start1 += 1;
                                    }
                                } else {
                                    if (bars1[lastIndex].dx < minWidth) {
                                        start1 += 1;
                                    }
                                }
                            } else {
                                if (lastIndex % 2 === 0) {
                                    if (bars1[lastIndex].dx < minWidth) {
                                        start1 += 1;
                                    }
                                } else {
                                    if (bars1[lastIndex].dx > -minWidth) {
                                        start1 += 1;
                                    }
                                }
                            }
                        } else {
                            if (lastIndex % 2 === 0) {
                                if (bars1[lastIndex].dx < minWidth) {
                                    start1 += 1;
                                }
                            } else {
                                if (bars1[lastIndex].dx > -minWidth) {
                                    start1 += 1;
                                }
                            }
                        }
                    }
                    setTimeout(function () {
                        runEffects();
                    }, 33);
                } else {
                    if (bars1[barRows - 1].dx !== 0) {
                        setTimeout(function () {
                            runEffects();
                        }, 33);
                    }
                }
                if (bars1[barRows - 1].dx === 0) {
                    if ($.isFunction(callback)) {
                        callback();
                    }
                }
            }
            runEffects();
        },
        _gridFadeRight: function (context, cw, ch, callback) {
            var self = this,
                img1 = self._imgArr[self._current],
                gridRows = self._options.gridRows,
                gridColumns = self._options.gridColumns,
                grid, grids = [],
                grid = function (image, sx, sy, sw, sh, dx, dy, dw, dh, op) {
                    this.img = image;
                    this.sx = sx;
                    this.sy = sy;
                    this.sw = sw;
                    this.sh = sh;
                    this.dx = dx;
                    this.dy = dy;
                    this.dw = dw;
                    this.dh = dh;
                    this.op = op;
                }, sx1, sy1, sw1, sh1, dx1, dy1, dw1, dh1, gridWidth, gridHeight, imgGridWidth, imgGridHeight, x, y, imgX, imgY;
            if (self._effect === 'barFadeRight' || self._effect === 'barFadeLeft') {
                gridColumns = self._options.barColumns
                gridRows = 1;
            }
            grids[0] = [];
            for (var c = 0; c < self._options.gridColumns; c += 1) {
                grids[c] = [];
                for (var r = 0; r < gridRows; r += 1) {
                    gridWidth = Math.round(cw / gridColumns);
                    gridHeight = Math.round(ch / gridRows);
                    imgGridWidth = Math.round(img1.width / gridColumns);
                    imgGridHeight = Math.round(img1.height / gridRows);
                    x = c * gridWidth;
                    y = r * gridHeight;
                    imgX = c * imgGridWidth;
                    imgY = r * imgGridHeight;
                    if (c === self._options.gridColumns - 1) {
                        gridWidth = cw - x;
                        imgGridWidth = img1.width - imgX;
                    }
                    if (r === gridRows - 1) {
                        gridHeight = ch - y;
                        imgGridHeight = img1.height - imgY;
                    }
                    sx1 = imgX;
                    sy1 = imgY;
                    sw1 = imgGridWidth;
                    sh1 = imgGridHeight;
                    dx1 = x + (gridWidth / 2);
                    dy1 = y + (gridHeight / 2);
                    dw1 = 0;
                    dh1 = 0;
                    grids[c][r] = new grid(img1, sx1, sy1, sw1, sh1, dx1, dy1, dw1, dh1, 0);
                }
            }
            if (this._effect === 'gridFadeLeft' || self._effect === 'barFadeLeft') {
                grids.reverse();
            }
            var start = 1,
                w, h, floorGridWidth = Math.round(cw / self._options.gridColumns),
                floorGridHeight = Math.round(ch / gridRows),
                lastGridWidth = cw - ((self._options.gridColumns - 1) * floorGridWidth),
                lastGridHeight = ch - ((gridRows - 1) * floorGridHeight),
                t = self._options.speed / 33;
            var runEffects = function () {
                context.clearRect(0, 0, cw, ch);
                for (var c = 0; c < start; c += 1) {
                    for (var r = 0; r < gridRows; r += 1) {
                        var tmpShape = grids[c][r];
                        gridWidth = floorGridWidth;
                        if (self._effect === 'gridFadeRight' || self._effect === 'barFadeRight') {
                            if (c === self._options.gridColumns - 1) {
                                gridWidth = lastGridWidth;
                            }
                        } else {
                            if (c === 0) {
                                gridWidth = lastGridWidth;
                            }
                        }
                        gridHeight = floorGridHeight;
                        if (r === gridRows - 1) {
                            gridHeight = lastGridHeight;
                        }
                        w = gridWidth / t;
                        h = gridHeight / t;
                        tmpShape.dw += w;
                        tmpShape.dw = Math.min(gridWidth, tmpShape.dw);
                        tmpShape.dh += h;
                        tmpShape.dh = Math.min(gridHeight, tmpShape.dh);
                        if (self._effect === 'gridFadeRight' || self._effect === 'barFadeRight') {
                            tmpShape.dx = (c * floorGridWidth) + ((gridWidth - tmpShape.dw) / 2);
                        } else {
                            tmpShape.dx = (((self._options.gridColumns - 1) - c) * floorGridWidth) + ((gridWidth - tmpShape.dw) / 2);
                        }
                        tmpShape.dy = (r * floorGridHeight) + ((gridHeight - tmpShape.dh) / 2);
                        tmpShape.op += 1 / t;
                        tmpShape.op = Math.min(1, tmpShape.op);
                        context.globalAlpha = tmpShape.op;
                        context.drawImage(tmpShape.img, tmpShape.sx, tmpShape.sy, tmpShape.sw, tmpShape.sh, tmpShape.dx, tmpShape.dy, tmpShape.dw, tmpShape.dh);
                    }
                }
                if (start < self._options.gridColumns) {
                    if (grids[start - 1][0].op > 0.1) {
                        start += 1;
                    }
                    setTimeout(function () {
                        runEffects();
                    }, 33);
                } else {
                    if (grids[self._options.gridColumns - 1][gridRows - 1].op < 1) {
                        setTimeout(function () {
                            runEffects();
                        }, 33);
                    }
                }
                if (grids[self._options.gridColumns - 1][gridRows - 1].op === 1) {
                    if ($.isFunction(callback)) {
                        callback();
                    }
                }
            }
            runEffects();
        },
        _gridFadeIn: function (context, cw, ch, callback) {
            var self = this,
                img1 = self._imgArr[self._current],
                img2 = self._imgArr[self._beforeCurrent],
                grid, grids = [],
                grid = function (image, sx, sy, sw, sh, dx, dy, dw, dh, op) {
                    this.img = image;
                    this.sx = sx;
                    this.sy = sy;
                    this.sw = sw;
                    this.sh = sh;
                    this.dx = dx;
                    this.dy = dy;
                    this.dw = dw;
                    this.dh = dh;
                    this.op = op;
                }, sx1, sy1, sw1, sh1, dx1, dy1, dw1, dh1, gridWidth, gridHeight, imgGridWidth, imgGridHeight, x, y, imgX, imgY, animImg = self._effect === 'gridFadeIn' ? img1 : img2;
            grids[0] = [];
            for (var c = 0; c < self._options.gridColumns; c += 1) {
                grids[c] = [];
                for (var r = 0; r < self._options.gridRows; r += 1) {
                    gridWidth = Math.round(cw / self._options.gridColumns);
                    gridHeight = Math.round(ch / self._options.gridRows);
                    imgGridWidth = Math.round(animImg.width / self._options.gridColumns);
                    imgGridHeight = Math.round(animImg.height / self._options.gridRows);
                    x = c * gridWidth;
                    y = r * gridHeight;
                    imgX = c * imgGridWidth;
                    imgY = r * imgGridHeight;
                    if (c === self._options.gridColumns - 1) {
                        gridWidth = cw - x;
                        imgGridWidth = animImg.width - imgX;
                    }
                    if (r === self._options.gridRows - 1) {
                        gridHeight = ch - y;
                        imgGridHeight = animImg.height - imgY;
                    }
                    sx1 = imgX;
                    sy1 = imgY;
                    sw1 = imgGridWidth;
                    sh1 = imgGridHeight;
                    dx1 = x + (gridWidth / 2);
                    dy1 = y + (gridHeight / 2);
                    dw1 = self._effect === 'gridFadeIn' ? 0 : gridWidth;
                    dh1 = self._effect === 'gridFadeIn' ? 0 : gridHeight;
                    grids[c][r] = new grid(animImg, sx1, sy1, sw1, sh1, dx1, dy1, dw1, dh1, self._effect === 'gridFadeIn' ? 0 : 1);
                }
            }
            var start = 1,
                w, h, floorGridWidth = Math.round(cw / self._options.gridColumns),
                floorGridHeight = Math.round(ch / self._options.gridRows),
                lastGridWidth = cw - ((self._options.gridColumns - 1) * floorGridWidth),
                lastGridHeight = ch - ((self._options.gridRows - 1) * floorGridHeight),
                t = self._options.speed / 33,
                lastOp = 1;
            if (this._effect === 'gridFadeOut') {
                lastOp = 0;
            }
            var runEffects = function () {
                context.clearRect(0, 0, cw, ch);
                if (self._effect === 'gridFadeOut') {
                    context.globalAlpha = 1;
                    context.drawImage(img1, 0, 0, img1.width, img1.height, 0, 0, cw, ch);
                }
                for (var c = 0; c < self._options.gridColumns; c += 1) {
                    for (var r = 0; r < self._options.gridRows; r += 1) {
                        var tmpShape = grids[c][r];
                        gridWidth = floorGridWidth;
                        if (c === self._options.gridColumns - 1) {
                            gridWidth = lastGridWidth;
                        }
                        gridHeight = floorGridHeight;
                        if (r === self._options.gridRows - 1) {
                            gridHeight = lastGridHeight;
                        }
                        w = gridWidth / t;
                        h = gridHeight / t;
                        if (self._effect === 'gridFadeIn') {
                            tmpShape.dw += w;
                            tmpShape.dw = Math.min(gridWidth, tmpShape.dw);
                            tmpShape.dh += h;
                            tmpShape.dh = Math.min(gridHeight, tmpShape.dh);
                            tmpShape.op += 1 / t;
                            tmpShape.op = Math.min(1, tmpShape.op);
                        } else {
                            tmpShape.dw -= w;
                            tmpShape.dw = Math.max(0, tmpShape.dw);
                            tmpShape.dh -= h;
                            tmpShape.dh = Math.max(0, tmpShape.dh);
                            tmpShape.op -= 1 / t;
                            tmpShape.op = Math.max(0, tmpShape.op);
                        }
                        tmpShape.dx = (c * floorGridWidth) + ((gridWidth - tmpShape.dw) / 2);
                        tmpShape.dy = (r * floorGridHeight) + ((gridHeight - tmpShape.dh) / 2);
                        context.globalAlpha = tmpShape.op;
                        context.drawImage(tmpShape.img, tmpShape.sx, tmpShape.sy, tmpShape.sw, tmpShape.sh, tmpShape.dx, tmpShape.dy, tmpShape.dw, tmpShape.dh);
                    }
                }
                if (grids[self._options.gridColumns - 1][self._options.gridRows - 1].op !== lastOp) {
                    setTimeout(function () {
                        runEffects();
                    }, 33);
                } else {
                    callback();
                }
            }
            runEffects();
        },
        _animate: function (callback) {
            var self = this,
                myCanvas, context, padLeft = parseInt(self._frame.css('paddingLeft'), 10),
                padTop = parseInt(self._frame.css('paddingTop'), 10),
                effects, cw = self._frame.width(),
                ch = self._frame.height(),
                dataImg, mainImage;
            $('<canvas width="' + cw + 'px" height="' + ch + 'px"></canvas>').css({
                'position': 'absolute',
                'top': padTop + 'px',
                'left': padLeft + 'px'
            }).insertAfter(self._slideContainer);
            myCanvas = this._frame.find('canvas');
            context = myCanvas.get(0).getContext('2d');
            this._effect = this._slides.eq(self._current).data('effect') || this._options.effect;
            if (this._effect === 'random') {
                effects = new Array('fadeIn', 'fadeOut', 'slideHorizontalLeft', 'slideHorizontalRight', 'slideVerticalDown', 'slideVerticalUp', 'barFadeRight', 'barFadeLeft', 'barVerticalUpLeft', 'barVerticalUpRight', 'barVerticalDownLeft', 'barVerticalDownRight', 'barVerticalCrossLeft', 'barVerticalCrossRight', 'barHorizontalDownLeft', 'barHorizontalUpLeft', 'barHorizontalDownRight', 'barHorizontalUpRight', 'barHorizontalCrossDown', 'barHorizontalCrossUp', 'gridFadeRight', 'gridFadeLeft', 'gridFadeIn', 'gridFadeOut');
                this._effect = effects[Math.floor(Math.random() * (effects.length + 1))];
                if (this._effect === undefined) {
                    this._effect = 'fadeIn';
                }
            }
            if (this._effect === 'gridFadeOut' || this._effect === 'fadeOut') {
                if (this._slides.eq(self._beforeCurrent).data('load') === 'false') {
                    callback();
                    return;
                }
            }
            var animateFinish = function () {
                setTimeout(function () {
                    dataImg = myCanvas.get(0).toDataURL();
                    mainImage = $('<img class="main-image"></img>');
                    self._slides.eq(self._current).find('img.main-image').replaceWith(mainImage);
                    mainImage.attr('src', dataImg).load(function () {
                        setTimeout(function () {
                            callback();
                        }, 33);
                    });
                }, 33);
            };
            switch (this._effect) {
                case 'fadeOut':
                    self._fade(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'barFadeRight':
                    self._gridFadeRight(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'barFadeLeft':
                    self._gridFadeRight(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'slideHorizontalLeft':
                    self._barHorizontal(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'slideHorizontalRight':
                    self._barHorizontal(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'slideVerticalDown':
                    self._barVertical(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'slideVerticalUp':
                    self._barVertical(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'barVerticalUpLeft':
                    self._barVertical(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'barVerticalUpRight':
                    self._barVertical(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'barVerticalDownLeft':
                    self._barVertical(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'barVerticalDownRight':
                    self._barVertical(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'barVerticalCrossLeft':
                    self._barVertical(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'barVerticalCrossRight':
                    self._barVertical(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'barHorizontalDownLeft':
                    self._barHorizontal(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'barHorizontalUpLeft':
                    self._barHorizontal(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'barHorizontalDownRight':
                    self._barHorizontal(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'barHorizontalUpRight':
                    self._barHorizontal(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'barHorizontalCrossDown':
                    self._barHorizontal(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'barHorizontalCrossUp':
                    self._barHorizontal(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'gridFadeRight':
                    self._gridFadeRight(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'gridFadeLeft':
                    self._gridFadeRight(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'gridFadeIn':
                    self._gridFadeIn(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                case 'gridFadeOut':
                    self._gridFadeIn(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
                default:
                    self._fade(context, cw, ch, function () {
                        animateFinish();
                    });
                    break;
            }
        },
        _removeCanvas: function (callback) {
            var self = this;
            this._frame.find('canvas').animate({
                'opacity': 0
            }, 33, function () {
                $(this).remove();
                if ($.isFunction(callback)) {
                    callback();
                }
            });
        },
        getIndex: function () {
            return this._current;
        },
        getLength: function () {
            return this._length;
        },
        getNext: function () {
            var base = this._current;
            return base === (this._length - 1) ? 0 : (base + 1);
        },
        getPrev: function () {
            var base = this._current;
            return base === 0 ? (this._length - 1) : (base - 1);
        },
        next: function () {
            if (!this._options.loop) {
                if (this._current === this._length - 1) {
                    return this;
                }
            }
            this.show(this.getNext());
            return this;
        },
        prev: function () {
            if (!this._options.loop) {
                if (this._current === 0) {
                    return this;
                }
            }
            this.show(this.getPrev());
            return this;
        },
        play: function (interval) {
            if (!this._isPlaying) {
                this._options.interval = interval || this._options.interval;
                if (this._isAnimationRunning) {
                    this._isPlaying = true;
                    this._isPaused = true;
                } else {
                    this._play(this._options.interval);
                }
            }
            return this;
        },
        pause: function () {
            if (this._isPlaying) {
                this._pause(false);
            }
            return this;
        },
        playToggle: function (interval) {
            if (!this._isPlaying) {
                this._options.interval = interval || this._options.interval;
                this._play(this._options.interval);
            } else {
                this.pause();
            }
            return this;
        },
        show: function (index) {
            var self = this;
            if (index === this._current) {
                return;
            }
            if (this._isAnimationRunning) {
                return;
            }
            if (this._isPlaying) {
                this._isPaused = true;
                this._pause(true);
            }
            this._beforeCurrent = this._current;
            this._options.before.call(self);
            this._current = index;
            this._isAnimationRunning = true;
            var showText = function () {
                self._showCaption(self._current, true, function () {
                    self._isAnimationRunning = false;
                    self._options.after.call(self);
                    if (self._isPlaying && self._isPaused) {
                        if (!self._isHover) {
                            self._play(self._options.interval);
                        }
                    }
                });
            }
            var callback = function () {
                self._showSlide(index, function () {
                    if (self._useCanvas && self._options.animation && (self._slides.eq(index).data('load') === 'true')) {
                        self._removeCanvas(function () {
                            showText();
                        });
                    } else {
                        showText();
                    }
                });
            }
            this._showCaption(self._beforeCurrent, false, function () {
                if (self._useCanvas && self._options.animation && (self._slides.eq(index).data('load') === 'true')) {
                    self._animate(function () {
                        callback();
                    });
                } else {
                    callback();
                }
            });
            if (self._options.directionNav && !self._options.loop) {
                self._setDirectionNavState();
            }
            if (self._options.controlNav) {
                self._setControlNavActive(index);
            }
        },
        destroy: function () {
            if (this._options.controlNav) {
                this._controlNavItems.unbind('.cs');
            }
            if (this._options.directionNav) {
                this._dirNext.unbind('.cs');
                this._dirPrev.unbind('.cs');
            }
            if (this._options.playButton) {
                this._playBtn.unbind('.cs');
                this._pauseBtn.unbind('.cs');
            }
            this._slides.unbind('.cs');
            this._frame.unbind('.cs');
            this._frame.remove();
            delete this._frame;
        }
    };
    $.fn.canvasSlider = function (options) {
        options = $.extend({}, $.fn.canvasSlider.options, options);
        var ret = [],
            i, n = this.length;
        for (i = 0; i < n; i += 1) {
            if (!this[i].canvasSlider) {
                this[i].canvasSlider = new CanvasSlider(this[i], options);
            }
            ret.push(this[i].canvasSlider);
        }
        return ret.length > 1 ? ret : ret[0];
    };
    $.fn.canvasSlider.options = {
        width: 960,
        height: 400,
        fluid: true,
        startIndex: 0,
        mouse: true,
        keyboard: true,
        swipe: true,
        speed: 500,
        loop: true,
        autoplay: true,
        interval: 5000,
        pauseOnHover: false,
        pauseOnClick: true,
        playButton: true,
        playButtonHide: false,
        playText: 'play',
        pauseText: 'stop',
        directionNav: true,
        directionNavHide: false,
        nextText: 'Next',
        prevText: 'Prev',
        controlNav: true,
        controlNavThumbs: false,
        controlNavHide: false,
        customIndex: [],
        addLinkToImage: true,
        linkTarget: '_blank',
        captionAnimation: true,
        captionEffect: 'fade',
        captionMove: 20,
        captionSpeed: 400,
        captionDelay: 200,
        captionEasing: 'swing',
        animation: true,
        effect: 'random',
        barColumns: 12,
        barRows: 5,
        gridColumns: 12,
        gridRows: 5,
        before: function () {},
        after: function () {},
        start: function () {},
        complete: function () {}
    };
})(jQuery, window, document);