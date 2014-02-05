var context;
var canvas;
var centerx = 300;
var centery = 150;
var pointsArray = [];
var focalLength = 500;
var axis = new Point(0, 0, 0);
var targetFps = 60;
var stats = new Stats();
var mouseX = 320;
var mouseY = 220;
var cacheCube;

function init() {
    canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');
    var v = 100;
    pointsArray[0] = new Point(-v, -v, -v);
    pointsArray[1] = new Point(v, -v, -v);
    pointsArray[2] = new Point(v, -v, v);
    pointsArray[3] = new Point(-v, -v, v);
    pointsArray[4] = new Point(-v, v, -v);
    pointsArray[5] = new Point(v, v, -v);
    pointsArray[6] = new Point(v, v, v);
    pointsArray[7] = new Point(-v, v, v);
    cacheCube = context.getImageData(0, 0, 600, 400);
    setInterval(loop, 1000 / targetFps);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '8px';
    stats.domElement.style.top = '8px';
    document.body.appendChild(stats.domElement);
    canvas.onmousemove = function (event) {
        moveMouse(event)
    }
}

function loop() {
    context.clearRect(0, 0, 600, 400);
    var yrot = (mouseX - centerx) / 3000;
    var xrot = (mouseY - centery) / 3000;
    axis.x += xrot;
    axis.y += yrot;
    var pa = process3DTo2D(pointsArray, axis);
    var z;
    if (!isVisibleBetween(pa[0], pa[1], pa[3])) {
        z = Math.round((pa[0].z + pa[1].z + pa[2].z + pa[3].z) / 2);
        context.fillStyle = "rgb(" + (40 + Math.round(z / 2)) + "," + (50 + z) + ",0)";
        context.beginPath();
        context.moveTo(pa[0].x + centerx, pa[0].y + centery);
        context.lineTo(pa[1].x + centerx, pa[1].y + centery);
        context.lineTo(pa[2].x + centerx, pa[2].y + centery);
        context.lineTo(pa[3].x + centerx, pa[3].y + centery);
        context.lineTo(pa[0].x + centerx, pa[0].y + centery);
        context.fill()
    }
    if (isVisibleBetween(pa[4], pa[5], pa[6])) {
        z = Math.round((pa[4].z + pa[5].z + pa[6].z + pa[7].z) / 2);
        context.fillStyle = "rgb(" + (40 + Math.round(z / 2)) + "," + (50 + z) + ",0)";
        context.beginPath();
        context.moveTo(pa[4].x + centerx, pa[4].y + centery);
        context.lineTo(pa[5].x + centerx, pa[5].y + centery);
        context.lineTo(pa[6].x + centerx, pa[6].y + centery);
        context.lineTo(pa[7].x + centerx, pa[7].y + centery);
        context.lineTo(pa[4].x + centerx, pa[4].y + centery);
        context.fill()
    }
    if (!isVisibleBetween(pa[0], pa[3], pa[7])) {
        z = Math.round((pa[0].z + pa[3].z + pa[7].z + pa[4].z) / 2);
        context.fillStyle = "rgb(" + (40 + Math.round(z / 2)) + "," + (50 + z) + ",0)";
        context.beginPath();
        context.moveTo(pa[0].x + centerx, pa[0].y + centery);
        context.lineTo(pa[3].x + centerx, pa[3].y + centery);
        context.lineTo(pa[7].x + centerx, pa[7].y + centery);
        context.lineTo(pa[4].x + centerx, pa[4].y + centery);
        context.lineTo(pa[0].x + centerx, pa[0].y + centery);
        context.fill()
    }
    if (isVisibleBetween(pa[1], pa[2], pa[6])) {
        z = Math.round((pa[1].z + pa[2].z + pa[6].z + pa[5].z) / 2);
        context.fillStyle = "rgb(" + (40 + Math.round(z / 2)) + "," + (50 + z) + ",0)";
        context.beginPath();
        context.moveTo(pa[1].x + centerx, pa[1].y + centery);
        context.lineTo(pa[2].x + centerx, pa[2].y + centery);
        context.lineTo(pa[6].x + centerx, pa[6].y + centery);
        context.lineTo(pa[5].x + centerx, pa[5].y + centery);
        context.lineTo(pa[1].x + centerx, pa[1].y + centery);
        context.fill()
    }
    if (!isVisibleBetween(pa[3], pa[2], pa[6])) {
        z = Math.round((pa[3].z + pa[2].z + pa[6].z + pa[7].z) / 2);
        context.fillStyle = "rgb(" + (40 + Math.round(z / 2)) + "," + (50 + z) + ",0)";
        context.beginPath();
        context.moveTo(pa[3].x + centerx, pa[3].y + centery);
        context.lineTo(pa[2].x + centerx, pa[2].y + centery);
        context.lineTo(pa[6].x + centerx, pa[6].y + centery);
        context.lineTo(pa[7].x + centerx, pa[7].y + centery);
        context.lineTo(pa[3].x + centerx, pa[3].y + centery);
        context.fill()
    }
    if (isVisibleBetween(pa[0], pa[1], pa[5])) {
        z = Math.round((pa[0].z + pa[1].z + pa[5].z + pa[4].z) / 2);
        context.fillStyle = "rgb(" + (40 + Math.round(z / 2)) + "," + (50 + z) + ",0)";
        context.beginPath();
        context.moveTo(pa[0].x + centerx, pa[0].y + centery);
        context.lineTo(pa[1].x + centerx, pa[1].y + centery);
        context.lineTo(pa[5].x + centerx, pa[5].y + centery);
        context.lineTo(pa[4].x + centerx, pa[4].y + centery);
        context.lineTo(pa[0].x + centerx, pa[0].y + centery);
        context.fill()
    }
    context.save();
    context.globalAlpha = 0.2;
    context.globalCompositeOperation = "destination-over";
    context.scale(1, -0.5);
    context.drawImage(canvas, 0, -1000, 600, 400);
    context.restore();
    context.globalCompositeOperation = "destination-over";
    context.beginPath();
    context.fillStyle = "#999999";
    context.rect(0, 0, 600, 400);
    context.closePath();
    context.fill();
    stats.update()
}

function isVisibleBetween(a, b, c) {
    if (((b.y - a.y) / (b.x - a.x) - (c.y - a.y) / (c.x - a.x) < 0) ^ (a.x <= b.x == a.x > c.x)) {
        return true
    } else {
        return false
    }
}

function Point(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z
}

function process3DTo2D(points, axisRotations) {
    var TransformedPointsArray = [];
    var sx = Math.sin(axisRotations.x);
    var cx = Math.cos(axisRotations.x);
    var sy = Math.sin(axisRotations.y);
    var cy = Math.cos(axisRotations.y);
    var sz = Math.sin(axisRotations.z);
    var cz = Math.cos(axisRotations.z);
    var x, y, z, xy, xz, yx, yz, zx, zy, scaleFactor;
    var i = points.length;
    while (i--) {
        x = points[i].x;
        y = points[i].y;
        z = points[i].z;
        xy = cx * y - sx * z;
        xz = sx * y + cx * z;
        yz = cy * xz - sy * x;
        yx = sy * xz + cy * x;
        zx = cz * yx - sz * xy;
        zy = sz * yx + cz * xy;
        scaleFactor = focalLength / (focalLength + yz);
        x = zx * scaleFactor;
        y = zy * scaleFactor;
        z = -yz;
        TransformedPointsArray[i] = new Point(x, y, z)
    }
    return TransformedPointsArray
}

function moveMouse(event) {
    var offsetx = 8;
    var offsety = 8;
    mouseX = event.pageX - offsetx;
    mouseY = event.pageY - offsety
}