(function (document, window, undefined) {
    var doc = document,
        div = doc.createElement('div'),
        browserPrefixes = 'webkit moz o ms khtml'.split(' '),
        body = doc.body;

    //utils
    if ( !Array.prototype.forEach ) {
        Array.prototype.forEach = function(fn, scope) {
            for(var i = 0, len = this.length; i < len; ++i)
                fn.call(scope, this[i], i, this);
        }
    }

    function addEvent(el, type, listener) {
        if (el.addEventListener) {
            el.addEventListener(type, listener, false);
        }
        else if (el.attachEvent) {
            el.attachEvent('on' + type, function() {
                return listener.call(el, fabric.window.event);
            });
        }
    }

    function Box(index, x, y, time){
        this.index = index;
        this.x = x;
        this.y = y;
        this.time = time;
    }
    Box.prototype ={
        index: 0,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        time: 20,
        angle: 0
    };

    function imageObj() { }
    imageObj.prototype = {
        x: 0,
        y: 0,
        radius: 0,
        animRadius: 0,
        img: null,
        isAnimComplete: false,
        alpha:1,
        isError: false
    };

    imageObj.prototype.draw = function (ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.animRadius, 0, 360, false);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.globalCompositeOperation = "source-in";
        ctx.drawImage(this.img, 0, 0);
        ctx.closePath();
        ctx.restore();
    };

    function cSlider(config) {
        cSlider.extend(this, config);
        /*
        this.arr.forEach(function (obj) {
            obj.isAnim = false;
            obj.aradius = 0;
            obj.start = null;
        });
        var w = this.width / this.columns;
        var h = this.height / this.rows;
        this.box = this.createBox(this.rows, this.columns, w, h);
        */
        this._init();
    }

    //Animation Enum Types
    cSlider.animationType = {
        fadeIn: 0,
        randomBubble: 1,
        squares: 2,
        slideIn: 3,
        slideOut: 4,
        slideUp: 5,
        slideDown: 6,
        diagonal: 7,
        curtainIn: 8,
        curtainOut: 9,
        squareIn: 10,
        dizzleLeft: 11,
        fadeOut: 12,
        bounceIn: 13,
        bounceOut: 14,
        bounceUp: 15,
        bounceDown: 16

    };

    cSlider.prototype = {
        animRef : null,
        imageData : [],
        imgIndex : 0,
        nextIndex : 1,
        width: 1024,
        height: 365,
        id: "cSlider",
        imageArray: null,
        renderTo: null,
        animSpeed: 1000,
        pauseTime: 2000,
        columns: 10,
        rows: 5,
        betweenBlockDelay: 60,
        box: [],
        transitionOrder: [],
        ul: null,
        nextRef : null,
        isStopped : false,
        pauseOnHover: false,
        directionNav: true,
        controlNav: true
    };

    cSlider.prototype.vars = {
        currentSlide: 0,
        totalSlides: 0,
        running: false,
        paused: false,
        stop: false
    };

    cSlider.prototype.arr  =[
        { x: 50, y: 150, radius: 125, time: 350 },
        { x: 80, y: 50, radius: 120, time: 150 },
        { x: 90, y: 280, radius: 120, time: 0 },
        { x: 200, y: 75, radius: 120, time: 60 },

        { x: 300, y: 200, radius: 120, time: 550 },
        { x: 350, y: 110, radius: 120, time: 400 },
        { x: 295, y: 280, radius: 145, time: 520 },
        { x: 500, y: 280, radius: 120, time: 75 },

        { x: 500, y: 75, radius: 120, time: 150 },
        { x: 600, y: 200, radius:120, time: 250 },

        { x: 700, y: 30, radius: 120, time: 650 },
        { x: 800, y: 180, radius: 120, time: 0 },
        { x: 915, y: 65, radius: 130, time: 150 },
        { x: 900, y: 350, radius: 125, time: 350 },
        { x: 700, y: 300, radius: 130, time: 300 },
        { x: 930, y: 220, radius: 140,  time: 600 }
    ];

    cSlider.prototype._init = function () {
        var that = this,
            main=null;
        if(typeof this.renderTo === "string")
            main = doc.getElementById(this.renderTo);
        else
            main  = this.renderTo;

        if (!main) {
            console.error("No Object to render");
            return false;
        }
        this.main = main;

        main.style.position = 'relative';

        var canvasFront = doc.createElement("canvas");
        var canvasBack = doc.createElement("canvas");

        this.canvasFront = canvasFront;
        this.canvasBack = canvasBack;

        canvasBack.width = canvasFront.width = this.width;
        canvasBack.height = canvasFront.height = this.height;
        canvasFront.style.zIndex = 51;
        canvasBack.style.zIndex = 50;
        canvasBack.style.position = canvasFront.style.position = "absolute";
        canvasBack.style.top = canvasFront.style.top = "0px";
        canvasBack.style.left = canvasFront.style.left = "0px";

        main.style.width = this.width + "px";
        main.style.height = this.height + "px";

        addEvent(window, "resize", function(e){
            that._calcDimensions();
        });

        main.appendChild(canvasBack);
        main.appendChild(canvasFront);
        this._calcDimensions();

        //Load Images from the server
        cSlider.loadImage(this.imageArray, this, function () {
            that._addNavigation();
            canvasBack.getContext("2d").drawImage(that.imageData[that.imgIndex].img, 0, 0, that.width, that.height);
            that.nextTransition();
        });
        return true;
    };

    cSlider.prototype._addNavigation = function(){
        var main = this.main,
            imageLen = this.imageData.length,
            doc = document,
            that = this;
        if(this.directionNav){
            var next = doc.createElement("div");
            next.setAttribute("class", "next");
            main.appendChild(next);
            addEvent(next, "click", function(){
                if(that.vars.running) return;
                that.next();
                that._nextTransition();
            });

            var previous = doc.createElement("div");
            previous.setAttribute("class", "previous");
            main.appendChild(previous);
            addEvent(previous, "click", function(){
                if(that.vars.running) return;
                that.prev();
                that._nextTransition();
            });
        }

        var ul = doc.createElement("ul");
        this.ul = ul;
        ul.setAttribute("class", "nav");
        ul.style.display = this.controlNav ? "" : "none"
        main.appendChild(ul);
        for(var i=0; i<imageLen ;i++){
            (function(index){
                var obj = doc.createElement("li");
                obj.setAttribute("style", index == 0? "active" : "");
                obj.setAttribute("index", index);
                ul.appendChild(obj);
                addEvent(obj, "click", function(){
                    if(this.getAttribute("class")=="active") return;
                    that.setSlide(index);
                })
            })(i);
        }
        ul.firstChild.setAttribute("class", "active");
    };

    cSlider.prototype._calcDimensions= function(){
        var width = window.innerWidth;
        var cWidth = this.width + 6;
        var ratio = (width/cWidth);
        ratio = ratio > 1 ? 1 : ratio;

        this.main.style.width = ((this.width) * ratio ) + "px";
        this.main.style.height = ((this.height) * ratio ) + "px";
        this.canvasBack.style[cSlider.support.transform] = "scale(" + ratio + ")";
        this.canvasBack.style[cSlider.support.transformOrigin] = "0px 0px";
        this.canvasFront.style[cSlider.support.transform] = "scale(" + ratio + ")";
        this.canvasFront.style[cSlider.support.transformOrigin] = "0px 0px";
        this.canvasBack.style[cSlider.support.transform] = "scale(" + ratio + ")";
        this.canvasBack.style[cSlider.support.transformOrigin] = "0px 0px";

    };
    cSlider.prototype.transitionIndex = 0;
    cSlider.prototype.nextTransition = function(){
        var that = this;
        this.nextRef = requestTimeout(function(){
            that.next();
            that._nextTransition();
        }, this.pauseTime);
    };

    cSlider.prototype._nextTransition = function(currImg, nextImg){
        var that = this;
        that.vars.running = true;

        var temp = this.ul.getElementsByClassName("active");
        temp[0] && temp[0].setAttribute("class","");
        this.ul.children[this.nextIndex] && this.ul.children[this.nextIndex].setAttribute("class", "active");
        console.log("imgIndex: "+ this.imgIndex + " nextIndex: " + this.nextIndex);
        switch (this.transitionOrder[this.transitionIndex]) {
            case cSlider.animationType.randomBubble:
                that.randomBubble();
                break;
            case cSlider.animationType.squares:
                that.squares();
                break;
            case cSlider.animationType.slideIn:
                that._slide( cSlider.animationType.slideIn, false, currImg, nextImg);
                break;
            case cSlider.animationType.slideOut:
                that._slide( cSlider.animationType.slideOut, false, currImg, nextImg);
                break;
            case cSlider.animationType.slideUp:
                that._slide( cSlider.animationType.slideUp, false, currImg, nextImg);
                break;
            case cSlider.animationType.slideDown:
                that._slide( cSlider.animationType.slideDown, false, currImg, nextImg);
                break;
            case cSlider.animationType.diagonal:
                that.diagonal();
                break;
            case cSlider.animationType.curtainIn:
                that._curtain(true, currImg, nextImg);
                break;
            case cSlider.animationType.curtainOut:
                that._curtain(false, currImg, nextImg);
                break;
            case cSlider.animationType.squareIn:
                that.squaresIn();
                break;
            case cSlider.animationType.dizzleLeft:
                that.dizzleLeft(currImg, nextImg);
                break;
            case cSlider.animationType.fadeOut:
                that._fade(null, true, currImg, nextImg);
                break;
            case cSlider.animationType.fadeIn:
                that._fade(null, false, currImg, nextImg);
                break;
            case cSlider.animationType.bounceIn:
                that._slide( cSlider.animationType.slideIn, true, currImg, nextImg);
                break;
            case cSlider.animationType.bounceOut:
                that._slide( cSlider.animationType.slideOut, true, currImg, nextImg);
                break;
            case cSlider.animationType.bounceUp:
                that._slide( cSlider.animationType.slideUp, true, currImg, nextImg);
                break;
            case cSlider.animationType.bounceDown:
                that._slide( cSlider.animationType.slideDown, true, currImg, nextImg);
                break;
        }
        this.transitionIndex++;
        if(this.transitionIndex >= this.transitionOrder.length)
            this.transitionIndex = 0;
    };

    cSlider.prototype.setSlide = function(val){
        if(this.vars.running) return;
        clearRequestTimeout(this.nextRef);
        this.nextRef=null;
        var imgObj = this.imageData,
            currImg = imgObj[val].img,
            nextImg = imgObj[this.imgIndex].img;

        this.imgIndex = val;
        this.nextIndex = val + 1;
        if(this.nextIndex == imgObj.length)
            this.nextIndex = 0;
        this._nextTransition(currImg, nextImg);
        var temp = this.ul.getElementsByClassName("active");
        temp[0] && temp[0].setAttribute("class","");
        this.ul.children[val] && this.ul.children[val].setAttribute("class", "active");
    };

    cSlider.prototype.stopAnimation = function(){
        window.cancelAnimationFrame(this.animRef);
        this.animRef=null;
        this.vars.running = false;
    };

    cSlider.prototype.next = function(){
        if(this.vars.running) return;
        clearRequestTimeout(this.nextRef);
        this.nextRef=null;

        var imgObj = this.imageData;
        this.imgIndex++;
        if (this.imgIndex == imgObj.length)
            this.imgIndex = 0;
        this.nextIndex = this.imgIndex + 1;
        if(this.nextIndex == imgObj.length)
            this.nextIndex = 0;
    };

    cSlider.prototype.prev = function(){
        if(this.vars.running) return;
        clearRequestTimeout(this.nextRef);
        this.nextRef=null;

        var imgObj = this.imageData;
        this.imgIndex--;
        if (this.imgIndex < 0)
            this.imgIndex = imgObj.length-1;
        this.nextIndex = this.imgIndex - 1;
        if(this.nextIndex < 0)
            this.nextIndex = imgObj.length-1;
    };

    cSlider.prototype.dizzleLeft = function(currImg, nextImg){
        var that = this,
            imgObj = this.imageData,
            bctx = this.canvasBack.getContext("2d"),
            fctx = this.canvasFront.getContext("2d"),
            x = 0,
            x1 = 0,
            parts = Math.ceil(this.width / 7),
            step = Math.ceil(this.width / parts) * 2,
            dir = false,
            count = 0,
            stage = 0,
            animSpeed = this.animSpeed / step;
        currImg = currImg || imgObj[that.imgIndex].img;
        nextImg = nextImg || imgObj[that.nextIndex].img

        x1 = -parts;

        var anim = function(){
            bctx.drawImage(currImg, 0, 0, that.width, that.height);
            that.animRef = cSlider.animate({
                duration: animSpeed,
                startValue: 0,
                endValue: parts,
                easing: cSlider.easing.linearTween,
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

                    fctx.drawImage(nextImg, 0, 0, that.width, that.height);
                    fctx.restore();
                } ,
                onComplete: function(){
                    if(count >= step) {
                        stage = count = x = 0;
                        x1 = -parts;
                        that.vars.running = dir = false;
                        that.nextTransition();
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
                abort: function(){
                    var s = that.isStopped;
                    that.isStopped = false;
                    return s;
                }
            });
        };
        anim();
    };

    cSlider.prototype._fade = function (callback, fadeOut, duration, currImg, nextImg) {
        var that = this,
            imgObj = this.imageData,
            bctx = this.canvasBack.getContext("2d"),
            fctx = this.canvasFront.getContext("2d"),
            nextImg = fadeOut ? imgObj[that.nextIndex].img : imgObj[that.imgIndex].img;
            currImg = fadeOut ? imgObj[that.imgIndex].img : imgObj[that.nextIndex].img;
            anim = function(){
                bctx.drawImage(nextImg, 0, 0, that.width, that.height);
                that.animRef = cSlider.animate({
                    duration: (duration? duration : that.animSpeed),
                    startValue: fadeOut? 1 : 0,
                    endValue: fadeOut ? 0 : 1,
                    byValue: fadeOut ? -1 : 0.1,
                    onChange: function(delta){
                        fctx.clearRect(0, 0, fctx.canvas.width, fctx.canvas.height);
                        fctx.globalAlpha = fadeOut ? delta : (delta *10);
                        fctx.drawImage(currImg, 0, 0, that.width, that.height);
                    } ,
                    onComplete: function(){
                        that.vars.running = false;
                        if(callback) {
                            callback();
                        } else {
                            that.nextTransition();
                        }
                    },
                    abort: function(){
                        var s = that.isStopped;
                        that.isStopped = false;
                        return s;
                    }
                });
            };
        anim();
    };

    cSlider.prototype.randomBubble = function () {
        var imgObj = this.imageData,
            canvas = this.canvasBack,
            bctx = this.canvasBack.getContext("2d"),
            fctx = this.canvasFront.getContext("2d"),
            that = this,
            duration = 1500,
            arr = this.arr;

        bctx.drawImage(imgObj[this.imgIndex].img, 0, 0, that.width, that.height);

        arr.forEach(function (obj) {
            obj.isAnim = false;
            obj.aradius = 0;
            obj.start = null;
        });

        var start = (new Date()).valueOf();

        var anim = function() {
            var isIn = false;
            arr.forEach(function(obj) {
                if (!obj.isAnim)
                    isIn = true;
            });

            if (isIn) {
                fctx.save();
                fctx.beginPath();
                fctx.fillStyle = "white";
                fctx.fillRect(0, 0, canvas.width, canvas.height);

                for (var i = 0, len = arr.length; i < len; i++)
                {
                    var obj = arr[i];
                    var time = ( new Date()).valueOf();
                    var end = (time +500);
                    if(start.valueOf() + (obj.time) > time)
                       continue;
                    if(!obj.start) obj.start = new Date();
                    isIn = true;
                    fctx.save();
                    fctx.beginPath();
                    fctx.globalCompositeOperation = "destination-out";
                    fctx.arc(obj.x, obj.y, obj.aradius, 0, 360, false);

                    fctx.fill();
                    fctx.lineWidth = 2;

                    // line color
                    fctx.strokeStyle = 'black';
                    fctx.stroke();
                    fctx.restore();

                    if (obj.isAnim) continue;

                    var currentTime = time > end ? duration : (time - start);
                    var change = end - start;
//                  console.log(obj.aradius = (  cSlider.easing.linearTween(currentTime, start, change, 500)));

                    var timePassed = new Date - obj.start;
                    var progress = timePassed / duration;
                    if (progress > 1) progress = 1;
                    obj.aradius = (Math.pow(progress, 2)) * obj.radius * 3;

                    obj.isAnim = obj.aradius >= obj.radius;
                }
                this.animRef =  requestAnimationFrame(anim);
            } else {
                that.vars.running = false;
                that.nextTransition();
            }
        };
        anim();
    };

    cSlider.prototype._slide = function(type, isBounce, currImg, nextImg){
        var that = this,
            imgObj = this.imageData,
            bctx = this.canvasBack.getContext("2d"),
            fctx = this.canvasFront.getContext("2d"),
            startValue = 0,
            endValue = 0,
            dir = false;
        switch(type){
            case cSlider.animationType.slideIn:   {
                endValue  = 0;
                startValue= this.width;
                currImg = currImg || imgObj[that.imgIndex].img;
                nextImg = nextImg || imgObj[that.nextIndex].img;
                break;
            }
            case cSlider.animationType.slideOut:{
                startValue = 0;
                endValue = this.width;
                currImg = currImg || imgObj[that.nextIndex].img;
                nextImg = nextImg || imgObj[that.imgIndex].img;
                break;
            }
            case cSlider.animationType.slideUp:{
                startValue = this.height;
                endValue = 0;
                dir = true;
                currImg = currImg || imgObj[that.imgIndex].img;
                nextImg = nextImg || imgObj[that.nextIndex].img;
                break;
            }
            case cSlider.animationType.slideDown:{
                startValue = 0;
                endValue = this.height;
                dir = true;
                currImg = currImg || imgObj[that.nextIndex].img;
                nextImg = nextImg || imgObj[that.imgIndex].img;
                break;
            }
        }
        var anim = function(){
            bctx.drawImage(currImg, 0, 0, that.width, that.height);
            that.animRef = cSlider.animate({
                duration: that.animSpeed,
                startValue: startValue,
                endValue: endValue,
                easing: isBounce? cSlider.easing.easeOutBounce : cSlider.easing.easeInOutSine,
                onChange: function(delta){
                    fctx.clearRect(0, 0, fctx.canvas.width, fctx.canvas.height);
                    if(dir)
                        fctx.drawImage(nextImg, 0, delta, that.width, that.height);
                    else
                        fctx.drawImage(nextImg, delta, 0, that.width, that.height);
                },
                onComplete: function(){
                    that.vars.running = false;
                    that.nextTransition();
                },
                abort: function(){
                    var s = that.isStopped;
                    that.isStopped = false;
                    return s;
                }
            });
        };
        anim();
    };

    cSlider.prototype._curtain = function(type){
        var imgObj = this.imageData,
            bctx = this.canvasBack.getContext("2d"),
            fctx = this.canvasFront.getContext("2d"),
            that = this,
            currImg = type? imgObj[that.imgIndex].img : imgObj[that.nextIndex].img;
            nextImg = type? imgObj[that.nextIndex].img : imgObj[that.imgIndex].img;

        var anim = function(){
            bctx.drawImage(currImg, 0, 0, that.width, that.height);
            that.animRef = cSlider.animate({
                duration: that.animSpeed,
                startValue: 0,
                endValue: that.width / 2,
                easing: cSlider.easing.easeOutBounce,
                onChange: function(delta){
                    var delta = Math.round(delta);
                    fctx.clearRect(0, 0, fctx.canvas.width, fctx.canvas.height);
                    if(type){
                        fctx.drawImage(nextImg, 0, 0, that.width /2, that.height, (-(that.width / 2) + delta ), 0, that.width /2, that.height);
                        fctx.drawImage(nextImg, that.width /2, 0, that.width /2, that.height, ((that.width) - delta ), 0, that.width /2, that.height);
                    }else{
                        fctx.drawImage(nextImg, 0, 0, that.width /2, that.height, -delta, 0, that.width /2, that.height);
                        fctx.drawImage(nextImg, that.width /2, 0, that.width /2, that.height, ((that.width / 2 ) + delta ), 0, that.width /2, that.height);
                    }
                } ,
                onComplete: function(){
                    that.vars.running = false;
                    that.nextTransition();
                },
                abort: function(){
                    var s = that.isStopped;
                    that.isStopped = false;
                    return s;
                }
            });
        };
        anim();
    };

    cSlider.prototype.squares = function(){
        var imgObj = this.imageData,
            canvas = this.canvasBack,
            bctx = this.canvasBack.getContext("2d"),
            fctx = this.canvasFront.getContext("2d"),
            that = this,
            duration = 1500;
        bctx.drawImage(imgObj[this.imgIndex].img, 0, 0);

        var w = this.width / this.columns;
        var h = this.height / this.rows;
        var w1=0, h1= 0, img;

        anim = function(){
            img = imgObj[that.nextIndex].img;
            that.animRef = cSlider.animate({
                duration: (duration? duration : that.animSpeed),
                startValue: 0,
                endValue: 1,
                byValue: 1,
                //easing: cSlider.easing.easeOutSine,
                onChange: function(delta){
                    fctx.save();
                    fctx.clearRect(0,0,canvas.width, canvas.height);
                    var w2 = w * delta, h2 = h * delta;
                    for(var i= 0, len = Math.ceil(canvas.width/w), len1 = Math.ceil(canvas.height/w); i<= len;i++ ){
                        for(j=0;j<=len1;j++){
                            fctx.drawImage(img, i * w , j * h, w2, h2, i * w, j * h, w2, h2);
                        }
                    }
                    fctx.restore();
                } ,
                onComplete: function(){
                    bctx.drawImage(imgObj[that.nextIndex].img, 0, 0);
                    fctx.clearRect(0,0,canvas.width, canvas.height);
                    requestTimeout(anim, 1250);
                },
                abort: function(){
                    var s = that.isStopped;
                    that.isStopped = false;
                    return s;
                }
            });
        };
        anim();
    };

    cSlider.prototype.squaresIn = function(){
        if(!this.vars.running) return;
        var imgObj = this.imageData,
            canvas = this.canvasBack,
            bctx = this.canvasBack.getContext("2d"),
            fctx = this.canvasFront.getContext("2d"),
            that = this,
            duration = 1500;

        bctx.drawImage(imgObj[this.imgIndex].img, 0, 0);


        var w1=0, h1= 0, img;
        var clone = this.box.slice(0);

        anim = function(){

        };
        anim();
    };

    cSlider.prototype.createBox = function(row, column, w, h){
        var arr = [];
        for(var i=0; i< row;i++){
            for(var j=0; j<column; j++){
                var index = (i * column) + j;
                arr[index] = new Box(index, i * w , j * h, index * this.betweenBlockDelay);
            }
        }
        return arr;
    };

    cSlider.prototype.randomize = function(){
        var box = this.box.splice(0),
            length = box.length,
            objectSorted = box;
        if (length == 0) return false;
        while (--length) {
            var newObject = Math.floor(Math.random() * (length + 1)),
                temp1 = objectSorted[length],
                temp2 = objectSorted[newObject];
            objectSorted[length] = temp2;
            objectSorted[newObject] = temp1
        }
        return objectSorted
    };

    //Static Methods
    cSlider.loadImage = function (arr, ref, onComplete) {
        var len = arr.length;
        var loadIndex = 0;
        for (var i = 0; i < len; i++) {
            (function (url, index) {
                var img = new Image();
                var tempObj = new imageObj();

                img.onload = function () {
                    var temp = document.createElement("canvas");

                    temp.width =  ref.width;
                    temp.height =  ref.height;

                    var ctx = temp.getContext("2d");
                    ctx.drawImage(this, 0, 0, ref.width, ref.height);
                    loadIndex++;
                    tempObj.img = temp;
                    if (loadIndex == len)
                        onComplete();
                };
                img.onerror = function () {
                    tempObj.isError = true;
                    loadIndex++;
                    if (loadIndex == len)
                        onComplete();
                };
                img.src = url;
                ref.imageData[index] = tempObj;
            })(arr[i], i);
        }
    };

    cSlider.extend = function (obj1, obj2) {
        for (var obj in obj2) {
            obj1[obj] = obj2[obj];
        }
    };

    /**
     * See <a href="http://gizma.com/easing/">Easing Equations by Robert Penner</a>
     */
    cSlider.easing = {
        linearTween : function (t, b, c, d) {
            return c*t/d + b;
        },
        easeInQuad: function(t, b, c, d) {
            return c*(t/=d)*t + b;
        },
        easeOutQuad: function (t, b, c, d) {
            t /= d;
            return -c * t*(t-2) + b;
        },
        easeInOutQuad: function (t, b, c, d) {
            t /= d/2;
            if (t < 1) return c/2*t*t + b;
            t--;
            return -c/2 * (t*(t-2) - 1) + b;
        },
        easeInCubic: function (t, b, c, d) {
            t /= d;
            return c*t*t*t + b;
        },
        easeOutCubic: function (t, b, c, d) {
            t /= d;
            t--;
            return c*(t*t*t + 1) + b;
        },
        easeInOutCubic: function (t, b, c, d) {
            t /= d/2;
            if (t < 1) return c/2*t*t*t + b;
            t -= 2;
            return c/2*(t*t*t + 2) + b;
        },
        easeInQuart: function (t, b, c, d) {
            t /= d;
            return c*t*t*t*t + b;
        },
        easeOutQuart: function (t, b, c, d) {
            t /= d;
            t--;
            return -c * (t*t*t*t - 1) + b;
        },
        easeInOutQuart: function (t, b, c, d) {
            t /= d/2;
            if (t < 1) return c/2*t*t*t*t + b;
            t -= 2;
            return -c/2 * (t*t*t*t - 2) + b;
        },
        easeInQuint: function (t, b, c, d) {
            t /= d;
            return c*t*t*t*t*t + b;
        },
        easeOutQuint: function (t, b, c, d) {
            t /= d;
            t--;
            return c*(t*t*t*t*t + 1) + b;
        },
        easeInOutQuint: function (t, b, c, d) {
            t /= d/2;
            if (t < 1) return c/2*t*t*t*t*t + b;
            t -= 2;
            return c/2*(t*t*t*t*t + 2) + b;
        },
        easeInSine: function (t, b, c, d) {
            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
        },
        easeOutSine: function (t, b, c, d) {
            return c * Math.sin(t/d * (Math.PI/2)) + b;
        },
        easeInOutSine: function (t, b, c, d) {
            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
        },
        easeInExpo: function (t, b, c, d) {
            return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
        },
        easeOutExpo: function (t, b, c, d) {
            return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
        },
        easeInOutExpo: function (t, b, c, d) {
            t /= d/2;
            if (t < 1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;
            t--;
            return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
        },
        easeInCirc:  function (t, b, c, d) {
            t /= d;
            return -c * (Math.sqrt(1 - t*t) - 1) + b;
        },
        easeOutCirc: function (t, b, c, d) {
            t /= d;
            t--;
            return c * Math.sqrt(1 - t*t) + b;
        },
        easeInOutCirc: function (t, b, c, d) {
            t /= d/2;
            if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
            t -= 2;
            return c/2 * (Math.sqrt(1 - t*t) + 1) + b;
        },
        easeInElastic: function (t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t===0) return b;
            t /= d;
            if (t===1) return b+c;
            if (!p) p=d*0.3;
            if (a < Math.abs(c)) { a=c; s=p/4; }
            else s = p/(2*Math.PI) * Math.asin (c/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        },
        easeOutElastic: function (t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t===0) return b;
            t /= d;
            if (t===1) return b+c;
            if (!p) p=d*0.3;
            if (a < Math.abs(c)) { a=c; s=p/4; }
            else s = p/(2*Math.PI) * Math.asin (c/a);
            return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
        },
        easeInOutElastic: function (t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t===0) return b;
            t /= d/2;
            if (t===2) return b+c;
            if (!p) p=d*(0.3*1.5);
            if (a < Math.abs(c)) { a=c; s=p/4; }
            else s = p/(2*Math.PI) * Math.asin (c/a);
            if (t < 1) return -0.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
        },
        easeInBack:   function (t, b, c, d, s) {
            if (s === undefined) s = 1.70158;
            return c*(t/=d)*t*((s+1)*t - s) + b;
        },
        easeOutBack: function (t, b, c, d, s) {
            if (s === undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },
        easeInOutBack: function (t, b, c, d, s) {
            if (s === undefined) s = 1.70158;
            t /= d/2;
            if (t < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
        },
        easeInBounce: function (t, b, c, d) {
            return c - cSlider.easing.easeOutBounce (d-t, 0, c, d) + b;
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
        },
        easeInOutBounce: function (t, b, c, d) {
            if (t < d/2) return cSlider.easing.easeInBounce (t*2, 0, c, d) * 0.5 + b;
            return cSlider.easing.easeOutBounce (t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
        }
    };

    cSlider.animate = function(options) {
        options || (options = {});

        var start = +new Date(),
            duration = options.duration || 500,
            finish = start + duration, time,
            onChange = options.onChange || function () { },
            abort = options.abort || function () { return false; },
            easing = options.easing || function (t, b, c, d) { return -c * Math.cos(t / d * (Math.PI / 2)) + c + b; },
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
    };

    cSlider.getVendorPropertyName = function(prop){
        var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);
        for (var i = 0; i < browserPrefixes.length; ++i) {
            var vendorProp = browserPrefixes[i] + prop_;
            if (vendorProp in div.style)  return vendorProp;
        }
        if (prop in div.style) return prop;
    }

    cSlider.support = {};
    cSlider.support.transform = cSlider.getVendorPropertyName('transform');
    cSlider.support.transformOrigin = cSlider.getVendorPropertyName('transformOrigin');
    cSlider.support.canvasSupport = !!window.HTMLCanvasElement;

    var webkit = window.webkitRequestAnimationFrame,
        moz = window.mozRequestAnimationFrame,
        opera = window.oRequestAnimationFrame,
        ms = window.msRequestAnimationFrame,
        req = window.requestAnimationFrame,
        creq = window.cancelAnimationFrame,
        cwebkit = window.webkitCancelAnimationFrame,
        cmoz = window.mozCancelRequestAnimationFrame,
        copera = window.oCancelRequestAnimationFrame,
        cms = window.msCancelRequestAnimationFrame;

    var requestAnimationFrame = (req || webkit || moz || ms || opera ||function (callback) { return window.setTimeout(callback, 17 /*~ 1000/60*/); });
    var cancelAnimationFrame = (window.cancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame ||
        window.msCancelAnimationFrame || cms || window.oCancelAnimationFrame || copera || window.clearTimeout);

    window.requestTimeout = function(fn, delay) {
        if( !req && !webkit && !(moz && cmoz) && !opera && !ms)
            return window.setTimeout(fn, delay);

        var start, handle;
        start = new Date().getTime();
        handle = new Object();

        function loop(){
            var current = new Date().getTime(),
                delta = current - start;

            delta >= delay ? fn.call() : handle.value = requestAnimationFrame(loop);
        };

        handle.value = requestAnimationFrame(loop);
        return handle;
    };

    window.requestInterval = function(fn, delay) {
        if( !req && !webkit && !(moz && cmoz) && !opera && !ms)
            return window.setInterval(fn, delay);

        var start = new Date().getTime(),
            handle = new Object();

        function loop() {
            var current = new Date().getTime(),
                delta = current - start;
            if(delta >= delay) {
                fn.call();
                start = new Date().getTime();
            }
            handle.value = requestAnimFrame(loop);
        };

        handle.value = requestAnimFrame(loop);
        return handle;
    }

    window.clearRequestTimeout = function(handle) {
        if(!handle) return;
        window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
            window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
                window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
                    window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
                        window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame(handle.value) :
                            window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
                                clearTimeout(handle);
    };

    window.clearRequestInterval = function(handle) {
        if(!handle) return;
        window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
            window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
                window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
                    window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
                        window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame(handle.value) :
                            window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
                                clearInterval(handle);
    };

    window.cSlider = cSlider;
    //expose to the outside world
    if (!window.requestAnimationFrame)
        window.requestAnimFrame = window.requestAnimationFrame = requestAnimationFrame;
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = cancelAnimationFrame;
})(document, window, undefined);
