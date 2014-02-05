/**
 * AviaSlider - A jQuery image slider
 * (c) Copyright Christian "Kriesi" Budschedl
 * http://www.kriesi.at
 * http://www.twitter.com/kriesi/
 * For sale on ThemeForest.net
 */
document.documentElement.className += 'js_active';
(function ($) {
    $.fn.aviaSlider = function (variables) {
        var defaults = {
            slides: 'li',
            animationSpeed: 900,
            autorotation: true,
            autorotationSpeed: 3,
            appendControlls: '',
            slideControlls: 'items',
            blockSize: {
                height: 'full',
                width: 'full'
            },
            betweenBlockDelay: 60,
            display: 'topleft',
            switchMovement: false,
            showText: true,
            transition: 'fade',
            backgroundOpacity: 0.8,
            transitionOrder: ['diagonaltop', 'diagonalbottom', 'topleft', 'bottomright', 'random']
        };
        var options = $.extend(defaults, variables);
        return this.each(function () {
            var slideWrapper = $(this),
                slides = slideWrapper.find(options.slides),
                slideImages = slides.find('img'),
                slideCount = slides.length,
                slideWidth = slides.width(),
                slideHeight = slides.height(),
                blockNumber = 0,
                currentSlideNumber = 0,
                reverseSwitch = false,
                currentTransition = 0,
                current_class = 'active_item',
                controlls = '',
                skipSwitch = true,
                interval = '',
                blockSelection = '',
                blockSelectionJQ = '',
                blockOrder = [];
            if (options.blockSize.height == 'full') {
                options.blockSize.height = slideHeight
            }
            if (options.blockSize.width == 'full') {
                options.blockSize.width = slideWidth
            }
            slideWrapper.methods = {
                init: function () {
                    var posX = 0,
                        posY = 0,
                        generateBlocks = true,
                        bgOffset = '';
                    slides.filter(':first').css({
                        'z-index': '5',
                        display: 'block'
                    });
                    while (generateBlocks) {
                        blockNumber++;
                        bgOffset = "-" + posX + "px -" + posY + "px";
                        $('<div class="kBlock"></div>').appendTo(slideWrapper).css({
                            zIndex: 20,
                            position: 'absolute',
                            display: 'none',
                            left: posX,
                            top: posY,
                            height: options.blockSize.height,
                            width: options.blockSize.width,
                            backgroundPosition: bgOffset
                        });
                        posX += options.blockSize.width;
                        if (posX >= slideWidth) {
                            posX = 0;
                            posY += options.blockSize.height
                        }
                        if (posY >= slideHeight) {
                            generateBlocks = false
                        }
                    }
                    blockSelection = slideWrapper.find('.kBlock');
                    blockOrder['topleft'] = blockSelection;
                    blockOrder['bottomright'] = $(blockSelection.get().reverse());
                    blockOrder['diagonaltop'] = slideWrapper.methods.kcubit(blockSelection);
                    blockOrder['diagonalbottom'] = slideWrapper.methods.kcubit(blockOrder['bottomright']);
                    blockOrder['random'] = slideWrapper.methods.fyrandomize(blockSelection);
                    slides.each(function () {
                        $.data(this, "data", {
                            img: $(this).find('img').attr('src')
                        })
                    });
                    if (slideCount <= 1) {
                        slideWrapper.aviaSlider_preloadhelper({
                            delay: 200
                        })
                    } else {
                        slideWrapper.aviaSlider_preloadhelper({
                            callback: slideWrapper.methods.preloadingDone
                        });
                        slideWrapper.methods.appendControlls().addDescription()
                    }
                },
                appendControlls: function () {
                    if (options.slideControlls == 'items') {
                        var elementToAppend = options.appendControlls || slideWrapper[0];
                        controlls = $('<div></div>').addClass('slidecontrolls').insertAfter(elementToAppend);
                        slides.each(function (i) {
                            var controller = $('<a href="#" class="ie6fix ' + current_class + '"></a>').appendTo(controlls);
                            controller.bind('click', {
                                currentSlideNumber: i
                            }, slideWrapper.methods.switchSlide);
                            current_class = ""
                        });
                        controlls.width(controlls.width()).css('float', 'none')
                    }
                    return this
                },
                addDescription: function () {
                    if (options.showText) {
                        slides.each(function () {
                            var currentSlide = $(this),
                                description = currentSlide.find('img').attr('alt'),
                                splitdesc = description.split('::');
                            if (splitdesc[0] != "") {
                                if (splitdesc[1] != undefined) {
                                    description = "<strong>" + splitdesc[0] + "</strong>" + splitdesc[1]
                                } else {
                                    description = splitdesc[0]
                                }
                            }
                            if (description != "") {
                                $('<div></div>').addClass('feature_excerpt').html(description).css({
                                    display: 'block',
                                    'opacity': options.backgroundOpacity
                                }).appendTo(currentSlide.find('a'))
                            }
                        })
                    }
                },
                preloadingDone: function () {
                    skipSwitch = false;
                    if ($.browser.msie) {
                        slides.css({
                            'backgroundColor': '#000000',
                            'backgroundImage': 'none'
                        })
                    } else {
                        slides.css({
                            'backgroundColor': 'transparent',
                            'backgroundImage': 'none'
                        })
                    } if (options.autorotation) {
                        slideWrapper.methods.autorotate();
                        slideImages.bind("click", function () {
                            clearInterval(interval)
                        })
                    }
                },
                autorotate: function () {
                    interval = setInterval(function () {
                        currentSlideNumber++;
                        if (currentSlideNumber == slideCount) currentSlideNumber = 0;
                        slideWrapper.methods.switchSlide()
                    }, (parseInt(options.autorotationSpeed) * 1000) + (options.betweenBlockDelay * blockNumber) + options.animationSpeed)
                },
                switchSlide: function (passed) {
                    var noAction = false;
                    if (passed != undefined && !skipSwitch) {
                        if (currentSlideNumber != passed.data.currentSlideNumber) {
                            currentSlideNumber = passed.data.currentSlideNumber
                        } else {
                            noAction = true
                        }
                    }
                    if (passed != undefined) clearInterval(interval);
                    if (!skipSwitch && noAction == false) {
                        skipSwitch = true;
                        var currentSlide = slides.filter(':visible'),
                            nextSlide = slides.filter(':eq(' + currentSlideNumber + ')'),
                            nextURL = $.data(nextSlide[0], "data").img,
                            nextImageBG = 'url(' + nextURL + ')';
                        if (options.slideControlls) {
                            controlls.find('.active_item').removeClass('active_item');
                            controlls.find('a:eq(' + currentSlideNumber + ')').addClass('active_item')
                        }
                        blockSelectionJQ = blockOrder[options.display];
                        slides.find('>a>img').css({
                            opacity: 1,
                            visibility: 'visible'
                        });
                        if (options.switchMovement && (options.display == "topleft" || options.display == "diagonaltop")) {
                            if (reverseSwitch == false) {
                                blockSelectionJQ = blockOrder[options.display];
                                reverseSwitch = true
                            } else {
                                if (options.display == "topleft") blockSelectionJQ = blockOrder['bottomright'];
                                if (options.display == "diagonaltop") blockSelectionJQ = blockOrder['diagonalbottom'];
                                reverseSwitch = false
                            }
                        }
                        if (options.display == 'random') {
                            blockSelectionJQ = slideWrapper.methods.fyrandomize(blockSelection)
                        }
                        if (options.display == 'all') {
                            blockSelectionJQ = blockOrder[options.transitionOrder[currentTransition]];
                            currentTransition++;
                            if (currentTransition >= options.transitionOrder.length) currentTransition = 0
                        }
                        blockSelectionJQ.css({
                            backgroundImage: nextImageBG
                        }).each(function (i) {
                                var currentBlock = $(this);
                                setTimeout(function () {
                                    var transitionObject = new Array();
                                    if (options.transition == 'drop') {
                                        transitionObject['css'] = {
                                            height: 1,
                                            width: options.blockSize.width,
                                            display: 'block',
                                            opacity: 0
                                        };
                                        transitionObject['anim'] = {
                                            height: options.blockSize.height,
                                            width: options.blockSize.width,
                                            opacity: 1
                                        }
                                    } else if (options.transition == 'fade') {
                                        transitionObject['css'] = {
                                            display: 'block',
                                            opacity: 0
                                        };
                                        transitionObject['anim'] = {
                                            opacity: 1
                                        }
                                    } else {
                                        transitionObject['css'] = {
                                            height: 1,
                                            width: 1,
                                            display: 'block',
                                            opacity: 0
                                        };
                                        transitionObject['anim'] = {
                                            height: options.blockSize.height,
                                            width: options.blockSize.width,
                                            opacity: 1
                                        }
                                    }
                                    currentBlock.css(transitionObject['css']).animate(transitionObject['anim'], options.animationSpeed, function () {
                                        if (i + 1 == blockNumber) {
                                            slideWrapper.methods.changeImage(currentSlide, nextSlide)
                                        }
                                    })
                                }, i * options.betweenBlockDelay)
                            })
                    }
                    return false
                },
                changeImage: function (currentSlide, nextSlide) {
                    currentSlide.css({
                        zIndex: 0,
                        display: 'none'
                    });
                    nextSlide.css({
                        zIndex: 3,
                        display: 'block'
                    });
                    blockSelectionJQ.fadeOut(options.animationSpeed * 1 / 3, function () {
                        skipSwitch = false
                    })
                },
                fyrandomize: function (object) {
                    var length = object.length,
                        objectSorted = $(object);
                    if (length == 0) return false;
                    while (--length) {
                        var newObject = Math.floor(Math.random() * (length + 1)),
                            temp1 = objectSorted[length],
                            temp2 = objectSorted[newObject];
                        objectSorted[length] = temp2;
                        objectSorted[newObject] = temp1
                    }
                    return objectSorted
                },
                kcubit: function (object) {
                    var length = object.length,
                        objectSorted = $(object),
                        currentIndex = 0,
                        rows = Math.ceil(slideHeight / options.blockSize.height),
                        columns = Math.ceil(slideWidth / options.blockSize.width),
                        oneColumn = blockNumber / columns,
                        oneRow = blockNumber / rows,
                        modX = 0,
                        modY = 0,
                        i = 0,
                        rowend = 0,
                        endreached = false,
                        onlyOne = false;
                    if (length == 0) return false;
                    for (i = 0; i < length; i++) {
                        objectSorted[i] = object[currentIndex];
                        if ((currentIndex % oneRow == 0 && blockNumber - i > oneRow) || (modY + 1) % oneColumn == 0) {
                            currentIndex -= (((oneRow - 1) * modY) - 1);
                            modY = 0;
                            modX++;
                            onlyOne = false;
                            if (rowend > 0) {
                                modY = rowend;
                                currentIndex += (oneRow - 1) * modY
                            }
                        } else {
                            currentIndex += oneRow - 1;
                            modY++
                        } if ((modX % (oneRow - 1) == 0 && modX != 0 && rowend == 0) || (endreached == true && onlyOne == false)) {
                            modX = 0.1;
                            rowend++;
                            endreached = true;
                            onlyOne = true
                        }
                    }
                    return objectSorted
                }
            };
            slideWrapper.methods.init()
        })
    }
})(jQuery);
(function ($) {
    $.fn.aviaSlider_preloadhelper = function (variables, callback) {
        var defaults = {
            fadeInSpeed: 800,
            maxLoops: 10,
            callback: ''
        };
        var options = $.extend(defaults, variables);
        return this.each(function () {
            var container = $(this),
                images = $('img', this).css({
                    opacity: 0,
                    visibility: 'hidden',
                    display: 'block'
                }),
                parent = images.parent(),
                imageCount = images.length,
                interval = '',
                allImages = images;
            var methods = {
                checkImage: function () {
                    images.each(function (i) {
                        if (this.complete == true) images = images.not(this)
                    });
                    if (images.length && options.maxLoops >= 0) {
                        options.maxLoops--;
                        setTimeout(methods.checkImage, 500)
                    } else {
                        methods.showImages()
                    }
                },
                showImages: function () {
                    allImages.each(function (i) {
                        var currentImage = $(this);
                        currentImage.css('visibility', 'visible').animate({
                            opacity: 1
                        }, options.fadeInSpeed, function () {
                            if (allImages.length == i + 1) methods.callback(i)
                        })
                    })
                },
                callback: function () {
                    if (variables instanceof Function) {
                        callback = variables
                    }
                    if (callback instanceof Function) {
                        callback.call(this)
                    }
                    if (options.callback != '') {
                        (options.callback)()
                    }
                }
            };
            methods.checkImage()
        })
    }
})(jQuery);