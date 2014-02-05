function Cube(width, height, depth, focalLength, ctx, color, image) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.focalLength = focalLength;
    this.ctx = ctx;
    this.color = color;
    this.image = image;
    this.rotation = {
        x: 0,
        y: 0,
        z: 0,
        parent: this
    };
    this.position = {
        x: 0,
        y: 0,
        z: 0,
        parent: this
    };
    this.canvas = this.ctx.canvas;
    this.cwidth = this.canvas.width;
    this.cheight = this.canvas.height;
    this.centerx = this.cwidth / 2;
    this.centery = this.cheight / 2;
    this.drawWidth = 0;
    this.drawHeight = 0;
    this.maxX = 0;
    this.minX = 0;
    this.maxY = 0;
    this.minY = 0;
    var w1 = this.width / 2,
        h1 = this.height / 2,
        d1 = this.depth / 2;

    this.vertexPoints = [
        Point(-w1, h1, -d1),
        Point(w1, h1, -d1),
        Point(w1, -h1, -d1),
        Point(-w1, -h1, -d1),
        Point(-w1, h1, d1),
        Point(w1, h1, d1),
        Point(w1, -h1, d1),
        Point(-w1, -h1, d1)
    ];
    this.position.z += this.depth / 2
}
Cube.prototype.render = function () {
    var pa = process3DTo2D(this.vertexPoints, this.rotation, this.position, this.focalLength, this.centerx, this.centery);
    this.ctx.clearRect(this.minX, this.minY, this.drawWidth, this.drawHeight);

     //Face 1
    if (isVisible(g[3], g[0], g[1])) {
        e = [g[0], g[1], g[3], g[2]];
        mapTexture(this.ctx, e, this.image)
    }

};

function mapTexture(ctx, coordinates, image) {
    var m = 5,
        n = 64,
        s = getProjectiveTransform(coordinates);
    var q = s.transformProjectiveVector([0, 0, 1]),
        t = s.transformProjectiveVector([1, 0, 1]),
        o = s.transformProjectiveVector([0, 1, 1]),
        r = s.transformProjectiveVector([1, 1, 1]);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(q[0], q[1]);
    ctx.lineTo(t[0], t[1]);
    ctx.lineTo(r[0], r[1]);
    ctx.lineTo(o[0], o[1]);
    ctx.closePath();
    ctx.clip();
    divide(0, 0, 1, 1, q, t, o, r, s, m, n, ctx, image);
    ctx.restore()
}

function isVisible(a, b, c) {
    if (((b.y - a.y) / (b.x - a.x) - (c.y - a.y) / (c.x - a.x) < 0) ^ (a.x <= b.x == a.x > c.x)) {
        return true
    } else {
        return false
    }
}
function process3DTo2D(vertex, axisRotations, position, focalLength, centerX, centerY) {
    var TransformedPointsArray = [],
        sin = Math.sin,
        cos = Math.cos,
        sx = sin(axisRotations.x),
        cx = cos(axisRotations.x),
        sy = sin(axisRotations.y),
        cy = cos(axisRotations.y),
        sz = sin(axisRotations.z),
        cz = cos(axisRotations.z),
        x, y, z, xy, xz, yx, yz, zx, zy, scaleFactor;
    var i = vertex.length;
    while (i--) {
        x = vertex[i].x;
        y = vertex[i].y;
        z = vertex[i].z;
        xy = cx * y - sx * z;
        zx = sx * y + cx * z;
        yz = cy * zx + sy * x;
        yx = -sy * zx + cy * x;
        zx = cz * yx - sz * xy;
        zy = sz * yx + cz * xy;
        x = zx + position.x;
        y = zy + position.y;
        z = yz + position.z;
        scaleFactor = focalLength / (focalLength + z);
        x = x * scaleFactor + centerX;
        y = -(y * scaleFactor) + centerY;
        TransformedPointsArray[i] = {
            x: x,
            y: y
        }
    }
    return TransformedPointsArray
}
