(function ($) {
    $.fn.extend({
        DDSlider: function () {
            var b = this;
            isPlaying = false;
            var c = {
                trans: 'random',
                delay: 50,
                waitTime: 5000,
                duration: 500,
                stopSlide: 1,
                bars: 15,
                columns: 10,
                rows: 3,
                ease: 'swing'
            };
            var d = arguments[0] || {};
            if (d.trans === undefined) {
                d.trans = c.trans
            }
            if (d.delay === undefined) {
                d.delay = c.delay
            }
            if (d.duration === undefined) {
                d.duration = c.duration
            }
            if (d.waitTime === undefined) {
                d.waitTime = c.waitTime
            }
            if (d.stopSlide === undefined) {
                d.stopSlide = c.stopSlide
            }
            if (d.bars === undefined) {
                d.bars = c.bars
            }
            if (d.columns === undefined) {
                d.columns = c.columns
            }
            if (d.rows === undefined) {
                d.rows = c.rows
            }
            if (d.ease === undefined) {
                d.ease = c.ease
            }
            d.width = this.width();
            d.height = this.height();
            this.children('li:first').addClass('current');
            var e = 1;
            if (d.selector === true) {
                this.append('<ul class="slider_selector"></ul>')
            }
            this.children('li').each(function () {
                $(this).addClass('slider_' + e);
                if (d.selector === undefined) {} else {
                    if (e == 1) {
                        $(d.selector).append('<li class="current sel_' + e + '"></li>')
                    } else {
                        $(d.selector).append('<li class="sel_' + e + '"></li>')
                    }
                }
                e++
            });
            var f = 0;
            if (d.prevSlide === undefined) {} else {
                $(d.prevSlide).click(function () {
                    if (isPlaying === false) {
                        b.prevSlide(d);
                        f = 1
                    }
                })
            } if (d.nextSlide === undefined) {} else {
                $(d.nextSlide).click(function () {
                    if (isPlaying === false) {
                        b.nextSlide(d);
                        f = 1
                    }
                })
            }
            $(d.selector).children('li').click(function () {
                var a = $(this).attr('class').split(' ');
                if (a[0] == 'current' || a[1] == 'current') {} else {
                    a = a[0].split('_');
                    if (isPlaying === false) {
                        f = 1;
                        b.callSlide(a[1], d)
                    }
                }
            });
            var g = 0;
            $(this).hover(function () {
                g = 1
            }, function () {
                g = 0
            });
            setInterval(function () {
                if (d.stopSlide == 1) {
                    if (g === 0 && f === 0) {
                        b.nextSlide(d)
                    }
                } else {
                    if (f === 0) {
                        b.nextSlide(d)
                    }
                }
            }, d.waitTime)
        },
        nextSlide: function (a) {
            var b = this.children('li.current');
            var c = b.next('li');
            var d = $(a.selector).children('li.current');
            var e = $(a.selector).children('li.current').next();
            if (c.length > 0) {} else {
                c = this.children('li:first');
                e = $(a.selector).children('li:first')
            }
            this.nextTransition(a, c, b, e, d)
        },
        prevSlide: function (a) {
            var b = this.children('li.current');
            var c = b.prev('li');
            var d = $(a.selector).children('li.current');
            var e = $(a.selector).children('li.current').prev();
            if (c.length > 0) {} else {
                c = this.children('li:last');
                e = $(a.selector).children('li:last')
            }
            this.nextTransition(a, c, b, e, d)
        },
        callSlide: function (a, b) {
            var c = this.children('li.current');
            var d = this.children('li.slider_' + a);
            var e = $(b.selector).children('li.current');
            var f = $(b.selector).children('li.sel_' + a);
            this.nextTransition(b, d, c, f, e)
        },
        nextTransition: function (a, b, c, d, e) {
            var f = b.attr('title');
            if (f == '') {
                f = a.trans
            }
            if (f == 'random' || f == 'fading' || f == 'barTop' || f == 'barBottom' || f == 'square' || f == 'squareMoving' || f == 'barFade' || f == 'barFadeRandom' || f == 'squareRandom' || f == 'squareOut' || f == 'squareOutMoving' || f == 'rowInterlaced') {} else {
                f = 'random'
            } if (f == 'random') {
                var g = ['barTop', 'fading', 'barBottom', 'square', 'squareRandom', 'squareMoving', 'barFade', 'barFadeRandom', 'squareOut', 'squareOutMoving', 'rowInterlaced'];
                var h = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                var i = $.shuffle(h);
                f = g[i[0]]
            }
            if (f == 'fading') {
                this.DDFading(a, b, c, d, e)
            } else if (f == 'barTop') {
                this.DDBarTop(a, b, c, d, e)
            } else if (f == 'barBottom') {
                this.DDBarBottom(a, b, c, d, e)
            } else if (f == 'square') {
                this.DDSquare(a, b, c, d, e)
            } else if (f == 'squareRandom') {
                this.DDSquareRandom(a, b, c, d, e)
            } else if (f == 'squareMoving') {
                this.DDSquareMoving(a, b, c, d, e)
            } else if (f == 'barFade') {
                this.DDBarFade(a, b, c, d, e)
            } else if (f == 'barFadeRandom') {
                this.DDBarFadeRandom(a, b, c, d, e)
            } else if (f == 'squareOut') {
                this.DDSquareOut(a, b, c, d, e)
            } else if (f == 'squareOutMoving') {
                this.DDSquareOutMoving(a, b, c, d, e)
            } else if (f == 'rowInterlaced') {
                this.DDRowInterlaced(a, b, c, d, e)
            } else {
                this.DDFading(a, b, c, d, e)
            }
        },
        DDFading: function (a, b, c, d, e) {
            var f = this;
            this.disableSelectors();
            b.css({
                opacity: 1
            });
            b.addClass('next');
            c.stop().animate({
                opacity: 0
            }, a.duration, function () {
                b.addClass('current').removeClass('next');
                c.removeClass('current').css({
                    opacity: 1
                });
                e.removeClass('current');
                d.addClass('current');
                f.enableSelectors()
            })
        },
        DDBarTop: function (a, b, c, d, e) {
            var f = this;
            this.disableSelectors();
            b.css({
                opacity: 1
            });
            var g = a.width / a.bars;
            var h = a.height;
            var i = (h - (h * 2));
            var j = 1;
            while (j <= a.bars) {
                var k = (j * g) - g;
                this.append('<div class="slider_bar slider_bar_' + j + '" style="position: absolute; overflow: hidden;' + b.attr('style') + '"></div>');
                this.children('.slider_bar_' + j).css({
                    left: k,
                    height: h,
                    width: g,
                    top: i,
                    'z-index': 3,
                    'background-position': '-' + k + 'px top'
                });
                j++
            }
            var l = 1;
            while (l <= a.bars) {
                var m = (l * g) - g;
                var n = (l * a.delay);
                this.children('.slider_bar_' + l).append('<div style="position: absolute; left: -' + m + 'px; width: ' + a.width + 'px; height: ' + a.height + 'px;">' + b.html() + '</div>');
                this.children('.slider_bar_' + l).delay(n).animate({
                    top: 0
                }, {
                    duration: a.duration,
                    easing: a.ease
                });
                l++
            }
            var o = (a.bars * a.delay);
            b.delay(o).animate({
                opacity: 0
            }, a.duration, function () {
                $(this).addClass('current').css({
                    opacity: 1
                });
                c.animate({
                    opacity: 0
                }, 200, function () {
                    $(this).removeClass('current');
                    f.children('.slider_bar').remove();
                    f.enableSelectors()
                });
                e.removeClass('current');
                d.addClass('current')
            })
        },
        DDBarBottom: function (a, b, c, d, e) {
            var f = this;
            this.disableSelectors();
            b.css({
                opacity: 1
            });
            var g = a.width / a.bars;
            var h = a.height;
            var i = h;
            var j = 1;
            while (j <= a.bars) {
                var k = (j * g) - g;
                this.append('<div class="slider_bar slider_bar_' + j + '" style="position: absolute; overflow: hidden;' + b.attr('style') + '"></div>');
                this.children('.slider_bar_' + j).css({
                    left: k,
                    height: h,
                    width: g,
                    top: i,
                    'z-index': 3,
                    'background-position': '-' + k + 'px top'
                });
                j++
            }
            var l = (1);
            var m = a.bars;
            g = a.width / a.bars;
            h = a.height;
            while (l <= a.bars) {
                var n = (l * g) - g;
                var o = (l * a.delay);
                this.children('.slider_bar_' + l).append('<div style="position: absolute; left: -' + n + 'px; width: ' + a.width + 'px; height: ' + a.height + 'px;">' + b.html() + '</div>');
                this.children('.slider_bar_' + m).delay(o).animate({
                    top: 0
                }, {
                    duration: 500,
                    easing: a.ease
                });
                l++;
                m--
            }
            var p = (a.bars * a.delay);
            b.delay(p).animate({
                opacity: 0
            }, a.duration, function () {
                $(this).addClass('current').css({
                    opacity: 1
                });
                c.animate({
                    opacity: 0
                }, 200, function () {
                    $(this).removeClass('current');
                    f.children('.slider_bar').remove();
                    f.enableSelectors()
                });
                e.removeClass('current');
                d.addClass('current')
            })
        },
        DDBarFade: function (a, b, c, d, e) {
            var f = this;
            this.disableSelectors();
            b.css({
                opacity: 1
            });
            var g = a.width / a.bars;
            var h = a.height;
            var i = 1;
            while (i <= a.bars) {
                var j = (i * g) - g;
                this.append('<div class="slider_bar slider_bar_' + i + '" style="position: absolute; overflow: hidden;' + b.attr('style') + '"></div>');
                this.children('.slider_bar_' + i).css({
                    left: j,
                    opacity: 0,
                    height: h,
                    width: g,
                    'z-index': 3,
                    'background-position': '-' + j + 'px top'
                });
                i++
            }
            var k = 1;
            while (k <= a.bars) {
                var l = (k * g) - g;
                delay = (k * a.delay);
                this.children('.slider_bar_' + k).append('<div style="position: absolute; left: -' + l + 'px; width: ' + a.width + 'px; height: ' + a.height + 'px;">' + b.html() + '</div>');
                this.children('.slider_bar_' + k).delay(delay).animate({
                    opacity: 1
                }, {
                    duration: a.duration,
                    easing: a.ease
                });
                k++
            }
            var m = (a.bars * a.delay);
            b.delay(m).animate({
                opacity: 0
            }, a.duration, function () {
                $(this).addClass('current').css({
                    opacity: 1
                });
                c.animate({
                    opacity: 0
                }, 200, function () {
                    $(this).removeClass('current');
                    f.children('.slider_bar').remove();
                    f.enableSelectors()
                });
                e.removeClass('current');
                d.addClass('current')
            })
        },
        DDBarFadeRandom: function (a, b, c, d, e) {
            var f = this;
            this.disableSelectors();
            b.css({
                opacity: 1
            });
            var g = a.width / a.bars;
            var h = a.height;
            var j = [];
            var i = 1;
            while (i <= a.bars) {
                var k = (i * g) - g;
                this.append('<div class="slider_bar slider_bar_' + i + '" style="position: absolute; overflow: hidden;' + b.attr('style') + '"></div>');
                this.children('.slider_bar_' + i).css({
                    left: k,
                    opacity: 0,
                    height: h,
                    width: g,
                    'z-index': 3,
                    'background-position': '-' + k + 'px top'
                });
                j[(i - 1)] = [i];
                i++
            }
            var l = $.shuffle(j);
            var m = 1;
            while (m <= a.bars) {
                var n = (m * g) - g;
                var o = (m * a.delay);
                this.children('.slider_bar_' + m).append('<div style="position: absolute; left: -' + n + 'px; width: ' + a.width + 'px; height: ' + a.height + 'px;">' + b.html() + '</div>');
                this.children('.slider_bar_' + l[(m) - 1]).delay(o).animate({
                    opacity: 1
                }, {
                    duration: a.duration,
                    easing: a.ease
                });
                m++
            }
            var p = (a.bars * a.delay);
            b.delay(p).animate({
                opacity: 0
            }, a.duration, function () {
                $(this).addClass('current').css({
                    opacity: 1
                });
                c.animate({
                    opacity: 0
                }, 200, function () {
                    $(this).removeClass('current');
                    f.children('.slider_bar').remove();
                    f.enableSelectors()
                });
                e.removeClass('current');
                d.addClass('current')
            })
        },
        DDSquare: function (a, b, c, d, e) {
            var f = this;
            this.disableSelectors();
            b.css({
                opacity: 1
            });
            var g = a.width / a.columns;
            var h = a.height / a.rows;
            var i = 1;
            var j = (1);
            while (i <= a.rows) {
                var k = i;
                var l = 'block_row_' + i;
                while (j <= a.columns) {
                    var m = 'block_ID_' + ((a.columns * i) - (a.columns - j));
                    var n = 'slider_block_' + (k++);
                    var o = 'block_column_' + j;
                    var p = ((i * h) - h);
                    var q = ((j * g) - g);
                    var r = (g * j) - g;
                    var s = (h * i) - h;
                    if (b.attr('style') === undefined) {
                        this.append('<div class="slider_block ' + m + ' ' + n + ' ' + l + ' ' + o + '" style="position: absolute; overflow: hidden;"></div>')
                    } else {
                        this.append('<div class="' + m + ' slider_block ' + n + ' ' + l + ' ' + o + '" style="position: absolute; overflow: hidden;' + b.attr('style') + '"></div>')
                    }
                    this.children('.' + m).css({
                        width: g,
                        height: h,
                        'z-index': 4,
                        top: p + 'px',
                        left: q + 'px',
                        opacity: 0,
                        'background-position': '-' + r + 'px -' + s + 'px'
                    }).append('<div style="position: absolute; left: -' + r + 'px; top: -' + s + 'px; width: ' + a.width + 'px; height: ' + a.height + 'px;">' + b.html() + '</div>');
                    j++;
                    k++
                }
                i++;
                j = 1
            }
            i = 1;
            j = 1;
            while (i <= a.rows) {
                var t = i;
                while (j <= a.columns) {
                    var u = '.slider_block_' + (t++);
                    delay = (a.delay * t);
                    $(u).delay(delay).animate({
                        opacity: 1
                    }, {
                        duration: a.duration,
                        easing: a.ease
                    });
                    j++;
                    t++
                }
                i++;
                j = 1
            }
            var v = (delay + a.duration);
            b.delay(v).animate({
                opacity: 0
            }, 1, function () {
                $(this).addClass('current').css({
                    opacity: 1
                });
                c.animate({
                    opacity: 0
                }, 200, function () {
                    $(this).removeClass('current');
                    f.children('.slider_block').remove();
                    f.enableSelectors()
                });
                e.removeClass('current');
                d.addClass('current')
            })
        },
        DDSquareRandom: function (a, b, c, d, e) {
            var f = this;
            this.disableSelectors();
            b.css({
                opacity: 1
            });
            var g = a.width / a.columns;
            var h = a.height / a.rows;
            var i = 1;
            var j = 1;
            var k = [];
            var l = 0;
            while (i <= a.rows) {
                var m = i;
                var n = 'block_row_' + i;
                while (j <= a.columns) {
                    k[l] = (l + 1);
                    l++;
                    var o = 'block_ID_' + ((a.columns * i) - (a.columns - j));
                    var p = 'slider_block_' + (m++);
                    var q = 'block_column_' + j;
                    var r = ((i * h) - h);
                    var s = ((j * g) - g);
                    var t = (g * j) - g;
                    var u = (h * i) - h;
                    if (b.attr('style') === undefined) {
                        this.append('<div class="' + o + ' slider_block ' + p + ' ' + n + ' ' + q + '" style="position: absolute; overflow: hidden;"></div>')
                    } else {
                        this.append('<div class="' + o + ' slider_block ' + p + ' ' + n + ' ' + q + '" style="position: absolute; overflow: hidden;' + b.attr('style') + '"></div>')
                    }
                    this.children('.' + o).css({
                        width: g,
                        height: h,
                        'z-index': 4,
                        top: r + 'px',
                        left: s + 'px',
                        opacity: 0,
                        'background-position': '-' + t + 'px -' + u + 'px'
                    }).append('<div style="position: absolute; left: -' + t + 'px; top: -' + u + 'px; width: ' + a.width + 'px; height: ' + a.height + 'px;">' + b.html() + '</div>');
                    j++;
                    m++
                }
                i++;
                j = 1
            }
            var v = $.shuffle(k);
            i = 1;
            j = 1;
            var w = 0;
            while (i <= a.rows) {
                var x = i;
                while (j <= a.columns) {
                    var y = '.block_ID_' + (v[w]);
                    delay = (a.delay * x);
                    $(y).delay(delay).animate({
                        opacity: 1
                    }, {
                        duration: a.duration,
                        easing: a.ease
                    });
                    j++;
                    x++;
                    w++
                }
                i++;
                j = 1
            }
            var z = delay + a.duration;
            b.delay(z).animate({
                opacity: 0
            }, 1, function () {
                $(this).addClass('current').css({
                    opacity: 1
                });
                c.animate({
                    opacity: 0
                }, 200, function () {
                    $(this).removeClass('current');
                    f.children('.slider_block').remove();
                    f.enableSelectors()
                });
                e.removeClass('current');
                d.addClass('current')
            })
        },
        DDSquareMoving: function (a, b, c, d, e) {
            var f = this;
            this.disableSelectors();
            b.css({
                opacity: 1
            });
            var g = a.width / a.columns;
            var h = a.height / a.rows;
            var i = 1;
            var j = 1;
            while (i <= a.rows) {
                var k = i;
                var l = 'block_row_' + i;
                while (j <= a.columns) {
                    var m = 'block_ID_' + ((a.columns * i) - (a.columns - j));
                    var n = 'slider_block_' + (k++);
                    var o = 'block_column_' + j;
                    var p = (i * h) + 80;
                    var q = (j * g) + 80;
                    var r = (g * j) - g;
                    var s = (h * i) - h;
                    if (b.attr('style') === undefined) {
                        this.append('<div class="' + m + ' slider_block ' + n + ' ' + l + ' ' + o + '" style="position: absolute; overflow: hidden;"></div>')
                    } else {
                        this.append('<div class="' + m + ' slider_block ' + n + ' ' + l + ' ' + o + '" style="position: absolute; overflow: hidden;' + b.attr('style') + '"></div>')
                    }
                    this.children('.' + m).css({
                        width: g,
                        height: h,
                        'z-index': 4,
                        opacity: 0,
                        top: p + 'px',
                        left: q + 'px',
                        'background-position': '-' + r + 'px -' + s + 'px'
                    }).append('<div style="position: absolute; left: -' + r + 'px; top: -' + s + 'px; width: ' + a.width + 'px; height: ' + a.height + 'px;">' + b.html() + '</div>');
                    j++;
                    k++
                }
                i++;
                j = 1
            }
            i = 1;
            j = 1;
            while (i <= a.rows) {
                var t = i;
                while (j <= a.columns) {
                    var u = 'block_ID_' + ((a.columns * i) - (a.columns - j));
                    var v = ((i * h) - h) + 'px';
                    var w = ((j * g) - g) + 'px';
                    delay = (a.delay * t);
                    this.children('.' + u).delay(delay).animate({
                        opacity: 1,
                        top: v,
                        left: w
                    }, {
                        duration: a.duration,
                        easing: a.ease
                    });
                    j++;
                    t++
                }
                i++;
                j = 1
            }
            var x = delay + a.duration;
            b.delay(x).animate({
                opacity: 0
            }, 1, function () {
                $(this).addClass('current').css({
                    opacity: 1
                });
                c.animate({
                    opacity: 0
                }, 200, function () {
                    $(this).removeClass('current');
                    f.children('.slider_block').remove();
                    f.enableSelectors()
                });
                e.removeClass('current');
                d.addClass('current')
            })
        },
        DDSquareOut: function (a, b, c, d, e) {
            var f = this;
            this.disableSelectors();
            var g = a.width / a.columns;
            var h = a.height / a.rows;
            var i = 1;
            var j = 1;
            while (i <= a.rows) {
                var k = i;
                var l = 'block_row_' + i;
                while (j <= a.columns) {
                    var m = 'block_ID_' + ((a.columns * i) - (a.columns - j));
                    var n = 'slider_block_' + (k++);
                    var o = 'block_column_' + j;
                    var p = ((i * h) - h);
                    var q = ((j * g) - g);
                    var r = (g * j) - g;
                    var s = (h * i) - h;
                    if (b.attr('style') === undefined) {
                        this.append('<div class="' + m + ' slider_block ' + n + ' ' + l + ' ' + o + '" style="position: absolute; overflow: hidden;"></div>')
                    } else {
                        this.append('<div class="' + m + ' slider_block ' + n + ' ' + l + ' ' + o + '" style="position: absolute; overflow: hidden;' + c.attr('style') + '"></div>')
                    }
                    this.children('.' + m).css({
                        width: g,
                        height: h,
                        'z-index': 4,
                        top: p + 'px',
                        left: q + 'px',
                        opacity: 1,
                        'background-position': '-' + r + 'px -' + s + 'px'
                    }).append('<div style="position: absolute; left: -' + r + 'px; top: -' + s + 'px; width: ' + a.width + 'px; height: ' + a.height + 'px;">' + c.html() + '</div>');
                    j++;
                    k++
                }
                i++;
                j = 1
            }
            b.addClass('current').css({
                opacity: 0
            }).animate({
                    opacity: 1
                }, 200);
            c.css({
                opacity: 0
            });
            i = 1;
            j = 1;
            while (i <= a.rows) {
                var t = i;
                while (j <= a.columns) {
                    var u = 'block_ID_' + ((a.columns * i) - (a.columns - j));
                    delay = (a.delay * t) * 3;
                    var v = (((g * j) - g) + 80) + 'px';
                    var w = (((h * i) - h) + 80) + 'px';
                    this.children('.' + u).delay(delay).animate({
                        left: v,
                        top: w,
                        opacity: 0
                    }, {
                        duration: a.duration,
                        easing: a.ease
                    });
                    j++;
                    t++
                }
                i++;
                j = 1
            }
            var x = (delay + a.duration);
            b.delay(x).animate({
                opacity: 0
            }, 1, function () {
                $(this).addClass('current').css({
                    opacity: 1
                });
                c.removeClass('current').css({
                    opacity: 1
                });
                f.children('.slider_block').remove();
                f.enableSelectors();
                e.removeClass('current');
                d.addClass('current')
            })
        },
        DDSquareOutMoving: function (a, b, c, d, e) {
            var f = this;
            this.disableSelectors();
            var g = a.width / a.columns;
            var h = a.height / a.rows;
            var i = 1;
            var j = 1;
            while (i <= a.rows) {
                var k = i;
                var l = 'block_row_' + i;
                while (j <= a.columns) {
                    var m = 'block_ID_' + ((a.columns * i) - (a.columns - j));
                    var n = 'slider_block_' + (k++);
                    var o = 'block_column_' + j;
                    var p = ((i * h) - h);
                    var q = ((j * g) - g);
                    var r = (g * j) - g;
                    var s = (h * i) - h;
                    if (b.attr('style') === undefined) {
                        this.append('<div class="' + m + ' slider_block ' + n + ' ' + l + ' ' + o + '" style="position: absolute; overflow: hidden;"></div>')
                    } else {
                        this.append('<div class="' + m + ' slider_block ' + n + ' ' + l + ' ' + o + '" style="position: absolute; overflow: hidden;' + c.attr('style') + '"></div>')
                    }
                    this.children('.' + m).css({
                        width: g,
                        height: h,
                        'z-index': 4,
                        top: p + 'px',
                        left: q + 'px',
                        opacity: 1,
                        'background-position': '-' + r + 'px -' + s + 'px'
                    }).append('<div style="position: absolute; left: -' + r + 'px; top: -' + s + 'px; width: ' + a.width + 'px; height: ' + a.height + 'px;">' + c.html() + '</div>');
                    j++;
                    k++
                }
                i++;
                j = 1
            }
            b.addClass('current').css({
                opacity: 0
            }).animate({
                    opacity: 1
                }, 200);
            c.css({
                opacity: 0
            });
            i = 1;
            j = 1;
            while (i <= a.rows) {
                var t = i;
                while (j <= a.columns) {
                    var u = 'block_ID_' + ((a.columns * i) - (a.columns - j));
                    delay = (a.delay * t) * 2;
                    var v = (((g * j) - g) - 80) + 'px';
                    var w = (((h * i) - h) - 80) + 'px';
                    this.children('.' + u).delay(delay).animate({
                        left: v,
                        top: w,
                        opacity: 0
                    }, {
                        duration: a.duration,
                        easing: a.ease
                    });
                    j++;
                    t++
                }
                i++;
                j = 1
            }
            var x = (delay + a.duration);
            b.delay(x).animate({
                opacity: 0
            }, 1, function () {
                $(this).addClass('current').css({
                    opacity: 1
                });
                c.removeClass('current').css({
                    opacity: 1
                });
                f.children('.slider_block').remove();
                f.enableSelectors();
                e.removeClass('current');
                d.addClass('current')
            })
        },
        DDRowInterlaced: function (a, b, c, d, e) {
            var f = this;
            this.disableSelectors();
            b.css({
                opacity: 1
            });
            var g = a.width;
            var h = a.height / a.rows;
            var i = 1;
            var j = (1);
            var k = 1;
            while (i <= a.rows) {
                var l = 'block_row_' + i;
                var m = 'block_ID_' + k;
                var n = (h * i) - h;
                var o = a.width + 'px';
                var p = ((i * h) - h);
                if (b.attr('style') === undefined) {
                    this.append('<div class="slider_row ' + m + ' ' + l + '" style="position: absolute; overflow: hidden;"></div>')
                } else {
                    this.append('<div class="' + m + ' slider_row ' + l + '" style="position: absolute; overflow: hidden;' + b.attr('style') + '"></div>')
                }
                this.children('.' + m).css({
                    width: g,
                    height: h,
                    'z-index': 4,
                    top: p + 'px',
                    opacity: 0,
                    'background-position': '0 -' + n + 'px',
                    left: o
                }).append('<div style="position: absolute; top: -' + n + 'px; width: ' + a.width + 'px; height: ' + a.height + 'px;">' + b.html() + '</div>');
                k++;
                i++
            }
            var q = '-' + a.width + 'px';
            this.children('.slider_row:even').css({
                left: q
            });
            i = 1;
            var r = 1;
            while (i <= a.rows) {
                var s = '.block_ID_' + r;
                delay = (a.delay * r);
                $(s).delay(delay).animate({
                    left: 0,
                    opacity: 1
                }, {
                    duration: a.duration,
                    easing: a.ease
                });
                i++;
                r++
            }
            var t = (delay + a.duration);
            b.delay(t).animate({
                opacity: 0
            }, 1, function () {
                $(this).addClass('current').css({
                    opacity: 1
                });
                c.animate({
                    opacity: 0
                }, 200, function () {
                    $(this).removeClass('current');
                    f.children('.slider_row').remove();
                    f.enableSelectors()
                });
                e.removeClass('current');
                d.addClass('current')
            })
        },
        disableSelectors: function () {
            isPlaying = true
        },
        enableSelectors: function () {
            isPlaying = false
        }
    });
    $.fn.shuffle = function () {
        return this.each(function () {
            var a = $(this).children();
            return (a.length) ? $(this).html($.shuffle(a)) : this
        })
    };
    $.shuffle = function (a) {
        for (var j, x, i = a.length; i; j = parseInt(Math.random() * i, 10), x = a[--i], a[i] = a[j], a[j] = x) {}
        return a
    }
})(jQuery);