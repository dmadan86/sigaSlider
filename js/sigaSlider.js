//https://dmadan86@bitbucket.org/dmadan86/sliderjs.git
(function (document, window, undefined, jQuery) {
        var div = document.createElement('div'),
        browserPrefixes = 'webkit moz o ms khtml'.split(' '),
        prefixes = ['-webkit', '-moz', '-o', '-ms'],
        domPrefixes = ['Webkit', 'Moz', 'O', 'Ms'];
        $ = jQuery;

    function SigaSlider(container, config){
        var isDebug = true,
            isRunning = false,
            isStopped = false,
            isPaused = false,
            current = 0,
            bctx,
            fctx,
            canvasFront,
            canvasBack,
            main,
            info,
            fromSlide,
            toSlide,
            transitionStart,
            transitionOrder = [],
            transitionIndex = 0,
            lastHumanNav,
            nextRef,
            animRef,
            wrapper,
            slides = [],
            ul,
            that,
            animationArrayData =  SigaSlider.animationArray.slice(0);

        var settings = $.extend(SigaSlider.defaults, config);

        var init = function(){
            that = this;
            // make sure excanvas is initialized
            (window.G_vmlCanvasManager && window.G_vmlCanvasManager.init_(document));

            if(typeof container == "string")
                container = document.getElementById(container);

            if(!container) {
                console.error("No Element to render");
                return;
            }

            $(container).find("img").hide().each(function(){
                var obj = $(this),
                    caption = obj.attr("alt");
                slides.push({
                    url: obj.attr("src"),
                    caption: caption
                });
                if(caption[0] == "#")
                    $(caption).hide();
            });

            $(container).addClass("sigaSlider").css({
                width:  settings.width
            });

            wrapper = $("<div/>").css({
                width:  settings.width,
                height: settings.height
            }).appendTo(container)[0];

            main = $("<div/>").css({
                width:  settings.width,
                height: settings.height,
                position: "absolute"
            }).addClass("holder").appendTo(wrapper)[0];

            setTransistionOrder.call(this);

            loadSlides.call(this);

            if(support.canvasSupport){
                var obj = $("<canvas/><canvas/>").css({
                    zIndex: 51,
                    position: "absolute",
                    top: 0,
                    left: 0
                }).attr({
                    width:  settings.width,
                    height: settings.height
                }).appendTo(main);
                canvasFront = obj[0];
                canvasBack = obj[1];
                canvasBack.style.zIndex = 50;

                bctx = canvasBack.getContext("2d");
                fctx = canvasFront.getContext("2d");
            }
            reCalibrate();
            $(window).resize(reCalibrate);
        };

        var reCalibrate = function(){
            var cWidth = settings.width + 6;
            var ratio = (window.innerWidth/cWidth);
            ratio = ratio > 1 ? 1 : ratio;
            $([main, container, wrapper]).width(settings.width * ratio).height(settings.height * ratio);
            $([bctx.canvas,fctx.canvas ]).css(support.transform, "scale(" + ratio + ")").css(support.transformOrigin, "0px 0px");
            if(ratio<=0.6)ratio =0.6;
            $(main).find(".next, .previous").css(support.transform, "scale(" + ratio + ")")
        };

        var start  = function(){
            addNavigation.call(this);
            current = settings.startSlide - 1;
            fromSlide = slides[current].imgObj;
            toSlide = slides[current + 1].imgObj;
            setSlideUl(current);
            setCaption();
            bctx.drawImage(fromSlide, 0, 0, settings.width, settings.height);
            nextTransition.call(this);
        };

        this.setTransition = function(name){
            transitionOrder = [];
            transitionIndex = 0;
            if(typeof name == "string"){
                if(name == "random")  {
                    settings.transitions = "random";
                    setTransistionOrder();
                }else{
                    transitionOrder.push(name);
                }
            }
            else {
                for(var i=0; i<name.length;i++ )
                    transitionOrder.push(name[i].toLowerCase());
            }
        };

        this.next = function () {
            this.setSlide.call(this, circular(current + 1, slides.length))
        };
        this.prev = function () {
            this.setSlide.call(this, circular(current - 1, slides.length))
        };

        this.setSlide = function(num){
            if(isRunning) return;
            num = Math.max(0, Math.min(num, slides.length - 1));
            fromSlide = slides[current].imgObj;
            toSlide = slides[num].imgObj;
            setSlideUl(num);
            current = num;
            transitionStart = now();
            settings.onChange && settings.onChange(num, transitionOrder[transitionIndex]);
            transition.call(this);
            setCaption();
        };

        var setSlideUl = function(num){
            $(ul).find("li.active").removeClass("active");
            $(ul).find("li[index=" + num + "]").addClass("active");
        };

        var nextTransition = function(){
            if(isPaused) return;
            clearTimeout(nextRef);
            nextRef = null;
            nextRef = setTimeout(function(){
                that.next();
                setCaption();
            }, settings.pauseTime);
        };

        var setCaption = function(){
            var caption = slides[current].caption, infoP = $(info.parentNode) ;
            if(caption && caption.length != ""){
                if(caption[0] == "#"){
                    var obj = $(caption).text();
                    if(obj.length != 0) {
                        info.innerHTML = $(caption).html();
                        infoP.animate({opacity: 1});
                    }
                    else
                        infoP.animate({opacity: 0});
                }
                else    {
                    infoP.animate({opacity: 1});
                    info.innerHTML = caption;
                }
            }
        };

        var render = function (transitionFunction) {
            var curr = now(), progress;
            if (curr >= transitionStart) {
                progress = Math.min(1, (curr - transitionStart) / settings.animSpeed);
                if (progress === 1) {
                    Complete.call(that);
                } else {
                    transitionFunction( progress);
                    return requestAnimationFrame((__bind(function () {
                        return render.call(that, transitionFunction)
                    }, this)))
                }
            }
        };

        var transition = function(){
            isRunning = true;
            switch (transitionOrder[transitionIndex]) {
                case "slidein":
                case "slideout":
                case "slideup":
                case "slidedown":{
                    slide.call(this, transitionOrder[transitionIndex], false);
                    break;
                }
                case "bouncein":
                case "bounceout":
                case "bounceup":
                case "bouncedown":{
                    slide.call(this, transitionOrder[transitionIndex], true);
                    break;
                }
                case "curtainin":{
                    curtain.call(this, true);
                    break;
                }
                case "curtainout":{
                    curtain.call(this, false);
                    break;
                }
                case "dizzle": {
                    dizzle.call(this);
                    break;
                }
                case "horizontalsunblind":{
                    Sunblind.call(this, true, false);
                    break;
                }
                case "verticalsunblind":{
                    Sunblind.call(this, false, false);
                    break;
                }
                case "diagonal":{
                    Sunblind.call(this, false, true);
                    break;
                }
                case "circle":{
                    render.call(this, circle);
                    break;
                }
                case "square":{
                    square.call(this);
                    break;
                }
                case "continousslide":{
                    continousSlide.call(this, "full");
                    break;
                }
                case "slidecontinuousbreakhorizontal":{
                    continousSlide.call(this, "horizontal");
                    break;
                }
                case "slidecontinuousbreakvertical":{
                    continousSlide.call(this, "vertical");
                    break;
                }
                case "jawleft":{
                    jaw.call(this, "left");
                    break;
                }
                case "jawtop":{
                    jaw.call(this, "top");
                    break;
                }
                case "squaretype":{
                    squareType.call(this, "square");
                    break;
                }
                case "squareboxin":{
                    squareType.call(this, "squareBoxIn");
                    break;
                }
                case "squareboxout":{
                    squareType.call(this, "squareBoxOut");
                    break;
                }
                case "shrinkrow":{
                    jaw.call(this, "shrinkRow");
                    break;
                }
                case "shrinkcol":{
                    jaw.call(this, "shrinkCol");
                    break;
                }
                case "rotatorcard":{
                    RotatorCard.call(this);
                    break;
                }
                case "rectanglenorthwest":{
                    rectangle.call(this, "northwest");
                    break;
                }
                case "rectanglenortheast":{
                    rectangle.call(this, "northeast");
                    break;
                }
                case "rectanglesouthwest":{
                    rectangle.call(this, "southwest");
                    break;
                }
                case "rectanglesoutheast":{
                    rectangle.call(this, "southeast");
                    break;
                }
                case "rectanglenorth":{
                    rectangle.call(this, "north");
                    break;
                }
                case "rectanglesouth":{
                    rectangle.call(this, "south");
                    break;
                }
                case "rectanglewest":{
                    rectangle.call(this, "west");
                    break;
                }
                case "rectangleeast":{
                    rectangle.call(this, "east");
                    break;
                }
                case "rectanglecenter":{
                    rectangle.call(this, "center");
                    break;
                }
                case "clock":{
                    rectangle.call(this, "clock");
                    break;
                }
                case "spinfadein":{
                    rotate.call(this, "spinFadeIn");
                    break;
                }
                case "spinfadeout":{
                    rotate.call(this, "spinFadeOut");
                    break;
                }
                case "circleout":{
                    general.call(this, "circleOut");
                    break;
                }
                case "circlein":{
                    general.call(this, "circleIn");
                    break;
                }
                case "circleflip":{
                    general.call(this, "circleFlip");
                    break;
                }
                case "centerslide":{
                    rectangle.call(this, "centerSlide");
                    break;
                }
                case "blindright":{
                    blinds("blindright");
                    break;
                }
                case "blindleft":{
                    blinds("blindleft");
                    break;
                }
                case "fade":
                default :{
                    general.call(this, "fade");
                    break;
                }
            }
            transitionIndex++;
            if(transitionIndex >= transitionOrder.length)
                transitionIndex = 0;
        };

        var Complete = function(){
            bctx.drawImage(toSlide, 0, 0, settings.width, settings.height);
            fctx.clearRect(0, 0, fctx.canvas.width, fctx.canvas.height);
            isRunning = false;
            nextTransition.call(that);
        };

        var Abort = function(){
            var cached = isStopped;
            isStopped = false;
            return cached;
        };

        var blinds = function(type){
            var w = settings.width,
                h = settings.height,
                n = 5,
                w1 = w/ n, o;
            bctx.drawImage(fromSlide, 0 , 0, w, h);
            animate({
                duration: settings.animSpeed,
                startValue: 0,
                endValue: 1,
                easing: easing.linearTween,
                onChange: function(delta){
                    delta = delta * n;
                    fctx.clearRect(0, 0, w, h);
                    for(var i=1; i<=n;i++){
                        fctx.save();
                        fctx.beginPath();
                        fctx.rect(w1*(i-1), 0, w1, h);
                        fctx.closePath();
                        fctx.clip();
                        if(type == "blindright") {
                            o = -w + (w * ((delta/n) *((n+3)-i)));
                        }
                        o = o>0? 0 : o;
                        fctx.drawImage(toSlide, o , 0, w, h);
                        fctx.restore();
                    }
                },
                onComplete: Complete,
                abort: Abort
            });
        };

        var jaw = function(type){
            var w = settings.width,
                h = settings.height,
                w1 = w / settings.boxCols,
                h1 = h / settings.boxRows,
                w2 = w1/2,
                h2 = h1/2,
                endValue = 1,
                easingType = easing.easeOutQuint;

            if(type == "left"){
                endValue = w;
            }else if(type == "top"){
                endValue = h;
            }else if(type=="shrinkCol"){
                endValue = w2;
                easingType = easing.linearTween;
            } else if(type=="shrinkRow"){
                endValue = h2;
                easingType = easing.linearTween;
            }

            bctx.drawImage(fromSlide, 0, 0, w, h);
            animate({
                duration: settings.animSpeed,
                startValue: 0,
                endValue: endValue,
                easing: easingType,
                onChange: function(delta){
                    fctx.clearRect(0,0,w,h);
                    var i=0;
                    if(type == "left"){
                        for(;i< settings.boxRows; i++){
                            if(i%2==0){
                                fctx.drawImage(toSlide, 0, i * h1, w, h1, -w+delta, i * h1, w, h1 );
                            } else {
                                fctx.drawImage(toSlide, 0, i * h1, w, h1, (w-delta), i * h1, w, h1 );
                            }
                        }
                    }else if(type == "top"){
                        for(; i < settings.boxCols; i++){
                            if(i%2==0){
                                fctx.drawImage(toSlide, i * w1, 0, w1, h, i * w1, -h+delta, w1, h );
                            } else {
                                fctx.drawImage(toSlide, i * w1, 0, w1, h, i * w1, (h-delta), w1, h );
                            }
                        }
                    } else if(type=="shrinkCol"){
                        fctx.clearRect(0,0,w,h);
                        fctx.save();
                        fctx.beginPath();
                        for(; i< settings.boxCols; i++){
                            fctx.rect((i*w1) + w2 - delta , 0, delta * 2, h);
                        }
                        fctx.closePath();
                        fctx.clip();
                        fctx.drawImage(toSlide, 0, 0, w, h );
                        fctx.restore();
                    } else if(type=="shrinkRow"){
                        fctx.clearRect(0,0,w,h);
                        fctx.save();
                        fctx.beginPath();
                        for(; i< settings.boxRows; i++){
                            fctx.rect(0, (i*h1) + h2 - delta , w, delta * 2);
                        }
                        fctx.closePath();
                        fctx.clip();
                        fctx.drawImage(toSlide, 0, 0, w, h );
                        fctx.restore();
                    }
                },
                onComplete: Complete,
                abort: Abort
            });
        };

        var continousSlide = function(type){
            var w =  settings.width,
                h = settings.height,
                n = 5,
                h1 = h / n,
                w1 = w / n,
                startValue = 0, endValue = w, eas = easing.easeOutQuint, i;
            if(type == "vertical"){
                endValue = h;
            }
            bctx.clearRect(0,0,w, h);
            animate({
                duration: settings.animSpeed,
                startValue: startValue,
                endValue: endValue,
                easing: eas,
                onChange: function(delta){
                    fctx.clearRect(0,0,w,h);
                    if(type == "full"){
                        fctx.drawImage(fromSlide, -delta, 0);
                        fctx.drawImage(toSlide, (w-delta), 0);
                    }else if(type == "horizontal"){
                        for(i=0; i< n; i++){
                            var h2 = h1 * i;
                            if(i%2 ==0 ) {
                                fctx.drawImage(fromSlide, 0, h2, w, h1, -delta, h2, w, h1);
                                fctx.drawImage(toSlide, 0, h2, w, h1,(w-delta), h2, w, h1);
                            }
                            else {
                                fctx.drawImage(fromSlide, 0, h2, w, h1, delta, h2, w, h1);
                                fctx.drawImage(toSlide, 0, h2, w, h1,(-w+delta), h2, w, h1);
                            }
                        }
                    }else if(type == "vertical"){
                        for(i=0; i< n; i++){
                            var w2 = w1 * i;
                            if(i%2 ==0 ) {
                                fctx.drawImage(fromSlide, w2, 0, w1, h, w2, -delta,  w1, h);
                                fctx.drawImage(toSlide, w2, 0, w1, h, w2, (h-delta), w1, h);
                            }
                            else {
                                fctx.drawImage(fromSlide, w2, 0, w1, h, w2, delta, w1, h);
                                fctx.drawImage(toSlide, w2, 0, w1, h, w2, (-h+delta), w1, h);
                            }
                        }
                    }
                },
                onComplete: function(){
                    Complete.call(that);
                },
                abort: Abort
            });
        };

        var squareType = function(type){
            var w = settings.width,
                h = settings.height,
                n = settings.boxCols,
                m = settings.boxRows,
                w1 = w / n,
                h1 = h / m,
                w2 = w1 / 2,
                h2 = h1 / 2,
                x, y, startValue = 0, endValue = 1,
                fromImg = fromSlide, toImg = toSlide;
            if(type == "square"){
                startValue = 1;
                endValue = 0;
            } else if(type == "squareBoxIn"){
                fromImg = toSlide;
                toImg = fromSlide;
            }
            bctx.drawImage(toImg, 0, 0 );
            animate({
                duration: settings.animSpeed,
                startValue: startValue,
                endValue: endValue,
                easing: easing.linearTween,
                onChange: function(delta){
                    fctx.clearRect(0,0,w, h);
                    fctx.save();
                    fctx.beginPath();
                    if(type == "square"){
                        var h3 = h/2 * delta,
                            w3 = w/2 * delta;
                        x = w-w3;
                        y = h-h3;

                        fctx.rect(0, 0, w3, h3);
                        fctx.rect(x, 0, w3, h3);
                        fctx.rect(0, y, w3, h3);
                        fctx.rect(x, y, w3, h3);
                    }
                    else if(type == "squareBoxIn"){
                        for(var i=0; i<n; i++){
                            for(var j=0; j<m; j++){
                                x = i*w1 + w2 - (w2 * delta);
                                y = j*h1 + h2 - (h2 * delta);
                                fctx.rect(x, y, w1 * delta, h1 * delta);
                            }
                        }
                    } else if(type == "squareBoxOut"){
                        for(var i=0; i<n; i++){
                            for(var j=0; j<m; j++){
                                x = i*w1 + (w2 * delta);
                                y = j*h1 +  (h2 * delta);
                                fctx.rect(x, y, w1 - (w1 * delta), h1 - (h1 * delta));
                            }
                        }
                    }
                    fctx.closePath();
                    fctx.clip();
                    fctx.drawImage(fromImg, 0, 0);
                    fctx.restore();
                },
                onComplete: Complete,
                abort: Abort
            });
        };

        var rectangle = function(type){
            var w = settings.width,
                h = settings.height,
                w1, h1,
                w2 = w/ 2, h2 = h/ 2,
                radius = Math.sqrt(w2*w2+h2*h2);

            animate({
                duration: settings.animSpeed,
                startValue: 0,
                endValue: 1,
                easing: easing.linearTween,
                onChange: function(delta){
                    fctx.clearRect(0, 0, w, h);
                    fctx.save();
                    fctx.beginPath();
                    w1 =  w *delta;
                    h1 =  h* delta;
                    if(type =="northwest"){
                        fctx.rect(0, 0, w1, h1 );
                    } else if(type == "northeast"){
                        fctx.rect(w - w1, 0, w1, h1 );
                    }  else if(type == "southwest"){
                        fctx.rect(0, h - h1, w1, h1 );
                    } else if(type == "southeast"){
                        fctx.rect(w - w1, h - h1, w1, h1 );
                    }else if(type == "north"){
                        fctx.rect(w2-(w2*delta), 0, w1, h1);
                    }else if(type == "south"){
                        fctx.rect(w2-(w2*delta), h-(h1), w1, h1);
                    }else if(type == "east"){
                        fctx.rect(0, h1-(h1*delta), w1, h1);
                    }else if(type == "west"){
                        fctx.rect(w-(w1*delta), h1-(h1*delta), w1, h1);
                    }else if(type == "center"){
                        fctx.rect(w2-(w2*delta), h2-(h2*delta), w1, h1);
                    }else if(type == "clock"){
                        fctx.moveTo(w2, h2);
                        fctx.arc(w2, h2, radius, convertToRadians(270), convertToRadians(270 + (360* delta)), false);
                    } else if(type == "centerSlide"){
                        fctx.rect(w2-(w2*delta), 0, w1, h);
                        fctx.closePath();
                        fctx.clip();
                        fctx.drawImage(toSlide, w2-(w2*delta), 0, w, h);
                        fctx.restore();
                        return;
                    }
                    fctx.closePath();
                    fctx.clip();
                    fctx.drawImage(toSlide, 0, 0, w, h);
                    fctx.restore();
                },
                onComplete: Complete,
                abort: Abort
            });
        };

        var RotatorCard = function(){
            var w = settings.width,
                h = settings.height,
                w1 = w/ 2, h1 = h/ 2,
                totalStage = 1,
                stage = 0, startValue, endValue,
                duration = settings.animSpeed / totalStage;

            bctx.clearRect(0,0,w,h);

            var anim = function(){
                if(stage==0){
                    startValue =  1;
                    endValue = 0.5;
                }else if(stage==1){
                    startValue =  0;
                    endValue = 1;
                }

                var start = +new Date(),
                    finish = start + duration, time,
                    byValue = endValue - startValue;
                (function tick() {
                    time = +new Date();
                    var currentTime = time > finish ? duration : (time - start);
                    var result = easing.linearTween(currentTime, startValue, byValue, duration);

                    fctx.save();
                    fctx.clearRect(0,0,w,h);
                    if(stage==0){
                        fctx.drawImage(fromSlide, 0, 0, w, h, w1-(w1*result), h1-(h1*result), w * result, h * result);
                    }else if(stage==1)  {
                        fctx.setTransform(1,0.5,0.5,1,0,0);
                        fctx.drawImage(fromSlide, 0, 0, w, h, w1-(w1*0.5), h1-(h1*0.5), w1, h1);
                    }
                    fctx.restore();

                    if (time > finish) {
                        stage++;
                        if(stage==2)
                            return;
                        return anim();
                        //return Complete();
                    }
                    requestAnimationFrame(tick);
                })();
            }
            anim();
        };

        var square = function(type){
            var w = settings.width,
                h = settings.height,
                blindHeight, blindWidth, blindsX, blindsY, prog, rh, rw, sx, sy, x, y;
            blindsY = 5;
            blindsX = Math.floor(blindsY * w / h);
            blindWidth = w / blindsX;
            blindHeight = h / blindsY;

            animate({
                duration: settings.animSpeed,
                startValue: 0,
                endValue: 1,
                easing: easing.linearTween,
                onChange: function(p){
                    fctx.save();
                    fctx.beginPath();
                    for (x = 0; 0 <= blindsX ? x <= blindsX : x >= blindsX; 0 <= blindsX ? x++ : x--) {
                        for (y = 0; 0 <= blindsY ? y <= blindsY : y >= blindsY; 0 <= blindsY ? y++ : y--) {
                            sx = blindWidth * x;
                            sy = blindHeight * y;
                            prog = Math.max(0, Math.min(3 * p - sx / w - sy / h, 1));
                            rw = blindWidth * prog;
                            rh = blindHeight * prog;
                            fctx.rect(sx - rw / 2, sy - rh / 2, rw, rh);
                        }
                    }
                    fctx.closePath();
                    fctx.clip();
                    fctx.drawImage(toSlide, 0, 0, settings.width, settings.height);
                    fctx.restore();
                },
                onComplete: Complete,
                abort: Abort
            });
        };

        var circle = function(progress){
            var w = settings.width,
                h = settings.height,
                circleH, circleW, circlesX, circlesY= 6, cx, cy, maxRad, r, x, y;
            circlesX = Math.floor(circlesY * w / h);
            circleW = w / circlesX;
            circleH = h / circlesY;
            maxRad = 0.7 * Math.max(circleW, circleH);
            fctx.save();
            fctx.beginPath();
            for (x = 0; 0 <= circlesX ? x <= circlesX : x >= circlesX; 0 <= circlesX ? x++ : x--) {
                for (y = 0; 0 <= circlesY ? y <= circlesY : y >= circlesY; 0 <= circlesY ? y++ : y--) {
                    cx = (x + 0.5) * circleW;
                    cy = (y + 0.5) * circleH;
                    r = Math.max(0, Math.min(2 * progress - cx / w, 1)) * maxRad;
                    fctx.moveTo(cx, cy);
                    fctx.arc(cx, cy, r, 0, Math.PI * 2, false);
                }
            }
            fctx.closePath();
            fctx.clip();
            fctx.drawImage(toSlide, 0, 0, settings.width, settings.height);
            fctx.restore();
        };

        var Sunblind = function(isHorizontal, isDiagonal){
            var width = settings.width,
                height = settings.height,
                columnLength = Math.ceil(width / (settings.boxCols - 1)),
                rowLength = Math.ceil(height / (settings.boxRows - 1)),
                hyp = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)),
                boxCols = settings.boxCols;
            if(isDiagonal){
                columnLength = Math.ceil(hyp / 20) + 20;
                boxCols = 20;
            }

            bctx.drawImage(fromSlide, 0, 0, width, height);
            animate({
                duration: settings.animSpeed,
                easing: easing.easeInOutQuad,
                startValue: 0,
                endValue: (isHorizontal || isDiagonal)? columnLength : rowLength,
                onChange: function(delta){
                    fctx.clearRect(0, 0, fctx.canvas.width, fctx.canvas.height);

                    for(var i=0; i<boxCols-1;i++){
                        fctx.save();
                        fctx.beginPath();
                        if(isHorizontal){
                            var x = i*columnLength;

                            fctx.moveTo(x, 0);
                            fctx.lineTo(x + delta, 0);
                            fctx.lineTo(x + delta, height);
                            fctx.lineTo(x, height);
                            fctx.lineTo(x, 0);
                        } else if(!isDiagonal){
                            var y = i*rowLength;

                            fctx.moveTo(0, y);
                            fctx.lineTo(0, y + delta);
                            fctx.lineTo(width, y + delta);
                            fctx.lineTo(width, y);
                            fctx.lineTo(0, y);
                        } else{
                            var val = i*columnLength;

                            fctx.moveTo(val, 0);
                            fctx.lineTo(0, val);
                            fctx.lineTo(0, val + delta);

                            fctx.lineTo(val + delta, 0);
                            fctx.lineTo(val, 0);
                        }
                        fctx.closePath();
                        fctx.clip();

                        fctx.drawImage(toSlide, 0, 0, width, height);
                        fctx.restore();
                    }
                } ,
                onComplete: Complete,
                abort: Abort
            });
        };

        var dizzle = function(){
            var x = 0,
                x1 = 0,
                width = settings.width,
                height = settings.height,
                parts = Math.ceil(width / 7),
                step = Math.ceil(width / parts) * 2,
                dir = false,
                count = 0,
                stage = 0,
                animSpeed = settings.animSpeed / step;
            x1 = -parts;

            var anim = function(){
                bctx.drawImage(fromSlide, 0, 0, width, height);
                animRef = animate({
                    duration: animSpeed,
                    startValue: 0,
                    endValue: parts,
                    easing: easing.linearTween,
                    onChange: function(delta){
                        fctx.clearRect(0, 0, fctx.canvas.width, fctx.canvas.height);
                        fctx.save();
                        fctx.beginPath();

                        fctx.lineWidth = 2;
                        fctx.moveTo(0, 0);

                        if(dir){
                            fctx.lineTo(x+ delta, 0);
                            fctx.lineTo(x1 , fctx.canvas.height);
                        }else{
                            fctx.lineTo(x, 0);
                            fctx.lineTo(x1+ delta, fctx.canvas.height);
                        }
                        fctx.lineTo(0, fctx.canvas.height);
                        fctx.lineTo(0, 0);

                        fctx.closePath();
                        fctx.clip();

                        fctx.drawImage(toSlide, 0, 0, width, height);
                        fctx.restore();
                    } ,
                    onComplete: function(){
                        if(count >= step) {
                            stage = count = x = 0;
                            x1 = -parts;
                            dir = false;
                            Complete();
                            return;
                        }
                        count++;
                        stage++;
                        if(dir){
                            x += parts;
                        } else{
                            x1 += parts;
                        }
                        if(stage >= 2){
                            stage = 0;
                            dir = !dir;
                        }
                        anim();
                    },
                    abort: Abort
                });
            };
            anim();
        };

        var general = function (type) {
            var width = settings.width,
                height = settings.height,
                w1 = width/ 2,
                h1 = height/2,
                radius = Math.sqrt(w1*w1 + h1*h1),
                startValue = 1,
                endValue = 0, toImg = toSlide, fromImg = fromSlide;

            if(type == "circleIn" ||  type == "circleFlip") {
                toImg = fromSlide;
                fromImg = toSlide;
                startValue = 0;
                endValue = 1;
            }

            bctx.drawImage(toImg, 0, 0, width, height);
            animate({
                duration: settings.animSpeed,
                easing: easing.linearTween,
                startValue: startValue,
                endValue: endValue,
                onChange: function(delta){
                    fctx.save();
                    fctx.clearRect(0, 0, width, height);
                    if(type=="fade")
                        fctx.globalAlpha = delta;
                    else if(type=="circleIn") {
                        fctx.beginPath();
                        fctx.moveTo(w1, h1);
                        fctx.arc(w1, h1, w1 * delta, 0, Math.PI * 2, false);
                        fctx.closePath();
                        fctx.clip();
                    } else if(type=="circleOut") {
                        fctx.beginPath();
                        fctx.moveTo(w1, h1);
                        fctx.arc(w1, h1, w1 * delta, 0, Math.PI * 2, false);
                        fctx.closePath();
                        fctx.clip();
                    } else if(type=="circleFlip"){
                        fctx.beginPath();
                        fctx.moveTo(w1, h1);
                        fctx.arc(w1, h1, radius, convertToRadians(270 - (180 * delta)), convertToRadians(270 + (180 * delta)), false);
                        fctx.closePath();
                        fctx.clip();
                    }
                    fctx.drawImage(fromImg, 0, 0, width, height);
                    fctx.restore();
                } ,
                onComplete: Complete,
                abort: Abort
            });
        };

        var rotate = function(type){
            var w = settings.width,
                h = settings.height, delta1,
                w1= w/ 2, h1=h/ 2, startValue = 0, endValue = 1, toImg = toSlide, fromImg = fromSlide;
            if(type=="spinFadeOut") {
                endValue = 0;
                startValue = 1;
                toImg = fromSlide;
                fromImg = toSlide;
            }

            //spinFade
            bctx.drawImage(toImg, 0, 0, w, h);
            animate({
                duration: settings.animSpeed,
                easing: easing.linearTween,
                startValue: startValue,
                endValue: endValue,
                onChange: function(delta){
                    delta1 = (1-delta);
                    fctx.save();
                    fctx.clearRect(0, 0, w, h);
                    fctx.globalAlpha = delta1;
                    fctx.translate(w1, h1);
                    fctx.rotate(convertToRadians(1080 * delta));
                    if(delta >= 0.60) delta = 0.60;
                    var w2 =  w * delta1,
                        h2 =  h * delta1;
                    fctx.drawImage(fromImg, -(w2/2), -(h2/2), w2, h2);
                    fctx.restore();
                },
                onComplete: Complete,
                abort: Abort
            });
        };

        var curtain = function(isCurtainIn){
            var currImg = isCurtainIn ? fromSlide : toSlide,
                nextImg = isCurtainIn ? toSlide : fromSlide,
                width = settings.width,
                height = settings.height;

            var anim = function(){
                bctx.drawImage(currImg, 0, 0, width, height);
                animRef = animate({
                    duration: settings.animSpeed,
                    startValue: 0,
                    endValue: width / 2,
                    easing: easing.easeOutBounce,
                    onChange: function(delta){
                        var delta = Math.round(delta);
                        fctx.clearRect(0, 0, fctx.canvas.width, fctx.canvas.height);
                        if(isCurtainIn){
                            fctx.drawImage(nextImg, 0, 0, width /2, height, (-(width / 2) + delta ), 0, width /2, height);
                            fctx.drawImage(nextImg, width /2, 0, width /2, height, ((width) - delta ), 0, width /2, height);
                        }else{
                            fctx.drawImage(nextImg, 0, 0, width /2, height, -delta, 0, width /2, height);
                            fctx.drawImage(nextImg, width /2, 0, width /2, height, ((width / 2 ) + delta ), 0, width /2, height);
                        }
                    } ,
                    onComplete: Complete,
                    abort: Abort
                });
            };
            anim();
        };

        var slide = function(type, isBounce){
            var startValue = 0,
                endValue = 0,
                dir = false;
            switch(type){
                case "bouncein":
                case "slidein":   {
                    endValue  = 0;
                    startValue= settings.width;
                    currImg = fromSlide;
                    nextImg = toSlide;
                    break;
                }
                case "bounceout":
                case "slideout":{
                    startValue = 0;
                    endValue = settings.width;
                    currImg = toSlide;
                    nextImg = fromSlide;
                    break;
                }
                case "bounceup":
                case "slideup":{
                    startValue = settings.height;
                    endValue = 0;
                    dir = true;
                    currImg = fromSlide;
                    nextImg = toSlide;
                    break;
                }
                case "bouncedown":
                case "slidedown":{
                    startValue = 0;
                    endValue = settings.height;
                    dir = true;
                    currImg = toSlide;
                    nextImg = fromSlide;
                    break;
                }
            }
            bctx.drawImage(currImg, 0, 0, settings.width, settings.height);
            animate({
                duration: settings.animSpeed,
                startValue: startValue,
                endValue: endValue,
                easing: isBounce? easing.easeOutBounce : easing.easeInOutSine,
                onChange: function(delta){
                    fctx.clearRect(0, 0, fctx.canvas.width, fctx.canvas.height);
                    if(dir)
                        fctx.drawImage(nextImg, 0, delta, settings.width, settings.height);
                    else
                        fctx.drawImage(nextImg, delta, 0, settings.width, settings.height);
                },
                onComplete: function(){
                    Complete.call(that);
                },
                abort: function(){
                    return isStopped;
                }
            });
        };

        var setTransistionOrder = function(){
            transitionOrder =  settings.transitions;
            if(!settings.transitions || settings.transitions == "random" || ($.type(settings.transitions) != "array" && settings.transitions.length != 0) ){
                transitionOrder = randomize(animationArrayData);
            }
            for(var i=0; i< transitionOrder.length; i++){
                transitionOrder[i] = transitionOrder[i].toLowerCase();
            }
        };

        var addNavigation = function(){
            if(settings.directionNav){
                $("<div />").addClass("next").click(function(){
                    that.next();
                }).appendTo(main);

                $("<div />").addClass("previous").click(function(){
                    that.prev();
                }).appendTo(main);
            }
            if(settings.pauseOnHover){
                $(main).hover(function(){
                    isPaused = true;
                    clearTimeout(nextRef);
                    nextRef = null;
                }, function(){
                    isPaused = false;
                    nextTransition();
                });
            }
            info = $("<div class='info' ><span></span></div>").appendTo(main).find("span")[0];
            ul = document.createElement("ul");
            ul.setAttribute("class", "nav");
            ul.style.display = settings.controlNav ? "" : "none";
            container.appendChild(ul);
            for(var i=0; i < slides.length ;i++){
                (function(index){
                    $("<li/>").addClass(index == 0? "active" : "").attr("index", index).click(function(){
                        if(this.getAttribute("class")=="active" || isRunning) return;
                        lastHumanNav= now();
                        that.setSlide(index);
                        $("li", ul).removeClass("active");
                        $(this).addClass("active");
                    }).appendTo(ul);
                })(i);
            }
            ul.firstChild.setAttribute("class", "active");
            ul.style.marginLeft = -(ul.firstChild.offsetWidth * slides.length / 2) + "px";
        };

        var loadSlides = function(){
            var len = slides.length;
            var count =0;
            var divloader = $("<div class='loader'><img src=" + settings.loader + " /><span class='text'>0%</span></div>").appendTo(main);
            var text = divloader.find(".text")[0];
            for(var i=0;i<len;i++){
                (function(index, obj){
                    obj.index = index;
                    setTimeout(function(){
                        var img = new Image();
                        img.onload = function(){
                            var temp = document.createElement("canvas");
                            temp.width =  settings.width;
                            temp.height =  settings.height;

                            var ctx = temp.getContext("2d");
                            ctx.drawImage(this, 0, 0, settings.width, settings.height);
                            obj.imgObj = temp;
                            count++;
                            if(count >= len){
                                divloader.remove();
                                start.call(that);
                                settings.afterLoad && settings.afterLoad();
                            }
                            text.innerHTML = Math.floor(100 * count / len ) + "%";
                        };
                        img.src = obj.url;
                    }, 0);
                })(i, slides[i]);
            }
        };
        init.call(this);
    }

    SigaSlider.animationArray = [
        //Misc Types
        "dizzle", "circleFlip", "circle", "clock", "diagonal", "square", "centerSlide", "blindright",
        //Jaw Types
        "jawtop", "jawleft",
        //Curtain Types
        "curtainIn", "curtainOut",
        //Circle Types
        "circleIn", "circleOut",

        "horizontalSunblind", "verticalSunblind",
        //Square Types
        "squareBoxOut", "squareboxin", "squaretype",
        //Spin type
        "spinFadeOut", "spinFadeIn",
        //Slide Types
        "slideIn", "slideOut", "slideUp", "slideDown",
        //Bounce Types
        "bounceIn", "bounceOut", "bounceUp", "bounceDown",

        //Continous Slides
        "slidecontinuousbreakvertical", "slidecontinuousbreakhorizontal", "continousSlide",
        //Rectangle Types
        "rectanglenorthwest", "rectanglenortheast", "rectanglesouthwest", "rectanglewest",
        "rectangleeast", "rectanglesoutheast",  "rectanglesouth", "rectanglenorth", "rectanglecenter",
        //Shrink Types
        "shrinkcol", "shrinkrow",
        //Simple Types
        "fade"
    ];   // "lines",

    SigaSlider.defaults = {
        transitions: SigaSlider.animationArray,
        width: 1024,
        height: 365,
        boxCols: 10,
        boxRows: 5,
        animSpeed: 1000,
        pauseTime: 3000,
        startSlide: 1,
        directionNav: true,
        controlNav: true,
        pauseOnHover: true,
        loader : "data:image/gif;base64,R0lGODlhEAAQAPIAAAAAAP///zw8PLy8vP///5ycnHx8fGxsbCH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA%3D%3D",
        onChange: function(){},
        afterLoad: function(){}
    };


    //utils
    var emptyFn = function(){},
        __bind = function (fn, me) {
            return function () {
                return fn.apply(me, arguments)
            }
        },
        mod = function (X, Y) {
            return X - Y * Math.floor(X / Y)
        },
        circular  = function(num, total){
            return mod(num, total);
        },
        convertToRadians = function (degree) {
            return degree*(Math.PI/180);
        },
        now = function () {
            return new Date().getTime()
        },
        randomize = function(arr){
            arr = arr.splice(0);
            var i = arr.length,
                j,
                tempi,
                tempj;

            if ( i === 0 ) return false;


            while ( --i ) {
                j = Math.floor( Math.random() * ( i + 1 ) );
                tempi = arr[i];
                tempj = arr[j];
                arr[i] = tempj;
                arr[j] = tempi;
            }
            return arr
        },
        easing = {
            linearTween : function (t, b, c, d) {
                return c*t/d + b;
            },
            easeInOutQuad: function (t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t + b;
                t--;
                return -c/2 * (t*(t-2) - 1) + b;
            },
            easeInSine: function (t, b, c, d) {
                return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
            },
            easeInBounce: function (t, b, c, d) {
                return c - easing.easeOutBounce (d-t, 0, c, d) + b;
            },
            easeOutQuint: function (t, b, c, d) {
                t /= d;
                t--;
                return c*(t*t*t*t*t + 1) + b;
            },

            easeOutBounce: function (t, b, c, d) {
                if ((t/=d) < (1/2.75)) {
                    return c*(7.5625*t*t) + b;
                } else if (t < (2/2.75)) {
                    return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
                } else if (t < (2.5/2.75)) {
                    return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
                } else {
                    return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
                }
            }
        },
        animate = function(options) {
            var start = +new Date(),
                duration = options.duration || 500,
                finish = start + duration, time,
                onChange = options.onChange || emptyFn,
                abort = options.abort || function () { return false; },
                easing = options.easing || function (t, b, c, d) {
                    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
                },
                startValue = 'startValue' in options ? options.startValue : 0,
                endValue = 'endValue' in options ? options.endValue : 100,
                byValue = options.byValue || endValue - startValue;

            options.onStart && options.onStart();

            (function tick() {
                time = +new Date();
                var currentTime = time > finish ? duration : (time - start);
                onChange(easing(currentTime, startValue, byValue, duration));
                if(abort()) return;
                if (time > finish) {
                    options.onComplete && options.onComplete();
                    return;
                }
                requestAnimationFrame(tick);
            })();
        },

        getVendorPropertyName = function(prop){
            var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);
            for (var i = 0; i < browserPrefixes.length; ++i) {
                var vendorProp = browserPrefixes[i] + prop_;
                if (vendorProp in div.style)  return vendorProp;
            }
            if (prop in div.style) return prop;
        };

    var support = {};
    support.transform = getVendorPropertyName('transform');
    support.transformOrigin = getVendorPropertyName('transformOrigin');
    support.canvasSupport = !!window.HTMLCanvasElement;

    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());
    window.SigaSlider = SigaSlider;


    $.fn.SigaSlider = function (options) {
        return this.each(function () {
            if (!$.data(this, "sigaslider")) {
                $.data(this, "sigaslider", new SigaSlider(this, options))
            }
        })
    };
    $.fn.SigaSlider.defaults = SigaSlider.defaults;
})(document, window, undefined, jQuery);