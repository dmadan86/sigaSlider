(function ($) {
    $.shiningImage = function (element, options) {
        var defaults = {
            color: '#FFFFFF',
            delay: 2000,
            direction: 'z',
            onComplete: function () {},
            onLoopComplete: function () {},
            opacity: 0.5,
            playOnLoad: true,
            scale: 0.25,
            speed: 60
        };
        var plugin = this;
        plugin.settings = {};
        var $element = $(element),
            element = element,
            $imgElement = $(element),
            ctx, timer, stopAfterLoop = false,
            isOver = false,
            playFx, width, height, img, _originalImg, canvas, gradPointPos_1 = 0,
            gradPointPos_2 = 0,
            gradPointPos_3 = 0;
        plugin.init = function () {
            if (isCanvasSupported()) {
                plugin.settings = $.extend({}, defaults, options);
                playFx = plugin.settings.playOnLoad;
                width = $imgElement.width();
                height = $imgElement.height();
                canvas = $('<canvas width="' + width + '" height="' + height + '"></canvas>');
                canvas.attr('id', $imgElement.attr('id') + '_canvas');
                canvas.attr('style', $imgElement.attr('style'));
                canvas.attr('class', $imgElement.attr('class'));
                img = new Image();
                img.onload = function () {
                    $imgElement.after(canvas);
                    $imgElement.hide();
                    ctx = canvas.get(0).getContext('2d');
                    initDesign();
                    plugin.settings.onComplete()
                };
                img.src = $imgElement.attr('src');
                canvas.click(function () {
                    $imgElement.trigger('click')
                });
                canvas.mouseover(function () {
                    $imgElement.trigger('mouseover');
                    return false
                });
                canvas.mouseout(function () {
                    $imgElement.trigger('mouseout')
                });
                canvas.mouseup(function () {
                    $imgElement.trigger('mouseup')
                });
                canvas.mousedown(function () {
                    $imgElement.trigger('mousedown')
                })
            }
        };
        plugin.shine = function () {
            if (!isOver) {
                isOver = true;
                stopAfterLoop = false;
                clearTimeout(timer);
                playFx = true;
                initDesign()
            }
        };
        plugin.stopshine = function () {
            isOver = false;
            clearTimeout(timer);
            stopAfterLoop = true, initDesign()
        };
        var initDesign = function () {
            gradPointPos_1 += plugin.settings.scale / 3;
            gradPointPos_2 += plugin.settings.scale / 3;
            gradPointPos_3 += plugin.settings.scale / 3;
            if (plugin.settings.direction == 'x') {
                grad = ctx.createLinearGradient(0, 0, width, 0)
            } else if (plugin.settings.direction == 'y') {
                grad = ctx.createLinearGradient(0, 0, 0, height)
            } else {
                grad = ctx.createLinearGradient(0, 0, width, height)
            } if ((gradPointPos_1 == plugin.settings.scale / 3) && (gradPointPos_2 == plugin.settings.scale / 3) && (gradPointPos_3 == plugin.settings.scale / 3)) {
                gradPointPos_1 = 0;
                gradPointPos_3 = (plugin.settings.scale / 3) * 2
            } else if ((gradPointPos_1 == plugin.settings.scale / 3) && (gradPointPos_2 == plugin.settings.scale / 3)) {
                gradPointPos_2 = (plugin.settings.scale / 3) * 2
            }
            if (gradPointPos_3 > 1) {
                gradPointPos_3 = 1
            }
            if (gradPointPos_2 > 1) {
                gradPointPos_2 = 1
            }
            if (gradPointPos_1 > 1) {
                playFx = false;
                plugin.settings.onLoopComplete();
                if (!stopAfterLoop) {
                    timer = setTimeout(function () {
                        playFx = true;
                        initDesign()
                    }, plugin.settings.delay)
                }
            }
            if (playFx) {
                grad.addColorStop(gradPointPos_1, 'rgba(' + hexToRGBA(plugin.settings.color) + ',0)');
                grad.addColorStop(gradPointPos_2, 'rgba(' + hexToRGBA(plugin.settings.color) + ',1)');
                grad.addColorStop(gradPointPos_3, 'rgba(' + hexToRGBA(plugin.settings.color) + ',0)')
            } else {
                gradPointPos_1 = 0;
                gradPointPos_2 = 0;
                gradPointPos_3 = 0;
                grad.addColorStop(gradPointPos_1, 'rgba(' + hexToRGBA(plugin.settings.color) + ',0)');
                grad.addColorStop(gradPointPos_2, 'rgba(' + hexToRGBA(plugin.settings.color) + ',0)');
                grad.addColorStop(gradPointPos_3, 'rgba(' + hexToRGBA(plugin.settings.color) + ',0)')
            }
            ctx.clearRect(0, 0, width, height);
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = 1;
            ctx.drawImage(img, 0, 0, width, height);
            ctx.globalAlpha = plugin.settings.opacity;
            ctx.globalCompositeOperation = "source-atop";
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
            ctx.globalAlpha = 1;
            if (playFx) {
                timer = setTimeout(initDesign, plugin.settings.speed)
            }
        };
        var cutHex = function (hex) {
            return (hex.charAt(0) == "#") ? hex.substring(1, 7) : hex
        };
        var hexToRGBA = function (hex) {
            var rgba = parseInt((cutHex(hex)).substring(0, 2), 16);
            rgba += ',' + parseInt((cutHex(hex)).substring(2, 4), 16);
            rgba += ',' + parseInt((cutHex(hex)).substring(4, 6), 16);
            return rgba
        };
        var isCanvasSupported = function () {
            var elem = document.createElement('canvas');
            return !!(elem.getContext && elem.getContext('2d'))
        };
        plugin.init()
    };
    $.fn.shiningImage = function (options) {
        return this.each(function () {
            if (undefined == $(this).data('shiningImage')) {
                var plugin = new $.shiningImage(this, options);
                $(this).data('shiningImage', plugin)
            }
        })
    }
})(jQuery);