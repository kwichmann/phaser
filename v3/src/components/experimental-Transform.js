
// This is an abstraction for a transformation
// matrix. It shouldn't contain anything that
// is not specific to that.
function Transform(x, y)
{
    var local = Transform.allocateTransformData();
    var world = Transform.allocateTransformData();
    
    local[0] = 1;
    local[1] = 0;
    local[2] = 0;
    local[3] = 1;
    local[4] = x;
    local[5] = y;

    world[0] = 1;
    world[1] = 0;
    world[2] = 0;
    world[3] = 1;
    world[4] = 0;
    world[5] = 0;

    this.local = local;
    this.world = world;
    // More experienced developer can just access the 
    // local and world matrices. For developer who want 
    // easy access to specific components of the matrix
    // they can use the decomposition functions.
}

// This function must be called to avoid 
// Memory leaks
Transform.prototype.destroy = functions()
{
    Transform.freeTransformData(this.local);
    Transform.freeTransformData(this.world);
    this.local = null;
    this.world = null;
};

// This functions only apply to local matrix
Transform.prototype.translate = function (x, y)
{
    var local = this.local;
    local[4] = local[0] * x + local[2] * y + local[4];
    local[5] = local[1] * x + local[3] * y + local[5];
};
Transform.prototype.scale = function (x, y) 
{
    var local = this.local;
    local[0] = local[0] * x;
    local[1] = local[1] * x;
    local[2] = local[2] * y;
    local[3] = local[3] * y;
};
Transform.prototype.rotate = function (radian)
{
    var local = this.local;
    var a = local[0];
    var b = local[1];
    var c = local[2];
    var d = local[3];
    var tcos = Math.cos(radian);
    var tsin = Math.sin(radian);

    local[0] = a * tcos + c * tsin;
    local[1] = b * tcos + d * tsin;
    local[2] = a * -tsin + c * tcos;
    local[3] = b * -tsin + d * tcos;
};
Transform.prototype.transform = function (a, b, c, d, tx, ty)
{
    var local = this.local;
    var local0 = local[0];
    var local1 = local[1];
    var local2 = local[2];
    var local3 = local[3];
    
    var a2 = a * local0 + b * local2;
    var b2 = a * local1 + b * local3;
    var c2 = c * local0 + d * local2;
    var d2 = c * local1 + d * local3;
    var e2 = tx * local0 + ty * local2 + local[4];
    var f2 = tx * local1 + ty * local3 + local[5];

    this.setTransform(a2, b2, c2, d2, e2, f2);
};
Transform.prototype.setTransform = function (a, b, c, d, tx, ty)
{
    var local = this.local;
    local[0] = a;    
    local[1] = b;    
    local[2] = c;    
    local[3] = d;    
    local[4] = tx;    
    local[5] = ty;    
};
Transform.prototype.loadIdentity = function ()
{
    var local = this.local;
    local[0] = 1;
    local[1] = 0;
    local[2] = 0;
    local[3] = 1;
    local[4] = 0;
    local[5] = 0;
};
Transform.prototype.setRotation = function (radian)
{
    var local = this.local;
    var tcos = Math.cos(radian);
    var tsin = Math.sin(radian);

    local[0] = tcos + tsin;
    local[1] = tcos + tsin;
    local[2] = -tsin + tcos;
    local[3] = -tsin + tcos;
};
Transform.prototype.setScale = function (x, y)
{

};
// This is the only function that operates on the world transform
// Should only be called once per frame.
Transform.prototype.update = function (parentTransform)
{
    var local = this.local;
    var world = this.world;
    var parent = parentTransform.world;
    
    world[0] = parent[0] * local[0] + parent[1] * local[2];
    world[1] = parent[0] * local[1] + parent[1] * local[3];
    world[2] = parent[2] * local[0] + parent[3] * local[2];
    world[3] = parent[2] * local[1] + parent[3] * local[3];
    world[4] = parent[4] * local[0] + parent[5] * local[2] + local[4];
    world[5] = parent[4] * local[1] + parent[5] * local[3] + local[5];
};

// Explicit functions describe cost of operation
// Should only be used by users. If transform is
// needed it should be applied by the regular 
// matrix multiplication. 
// WARNING: THESE ARE EXPENSIVE!!

// Local
Transform.prototype.getTranslate = function (vec2)
{
    var local = this.local;
    vec2[0] = local[0];
    vec2[1] = local[1];
    return vec2;
};
Transform.prototype.getScale = function (vec2)
{
    var local = this.local;
    var a = local[0];
    var c = local[2];
    var b = local[1];
    var d = local[3];
    var a2 = a * a;
    var c2 = c * c;
    var b2 = b * b;
    var d2 = d * d;
    var sy = Math.sqrt(b2 + d2);
    var sx = Math.sqrt(a2 + c2);
    vec2[0] = sx;
    vec2[1] = sy;
    return vec2;
};
Transform.prototype.getRotation = function ()
{
    var local = this.local;
    var a = local[0];
    var c = local[2];
    var a2 = a * a;
    var c2 = c * c;
    return Math.acos(a / Math.sqrt(a2 + c2)) * (Math.atan(-c / a) < 0 ? -1 : 1);
};
// World
Transform.prototype.getWorldTranslate = function (vec2)
{
    var world = this.world;
    vec2[0] = world[0];
    vec2[1] = world[1];
    return vec2;
};
Transform.prototype.getWorldScale = function (vec2)
{
    var world = this.world;
    var a = world[0];
    var c = world[2];
    var b = world[1];
    var d = world[3];
    var a2 = a * a;
    var c2 = c * c;
    var b2 = b * b;
    var d2 = d * d;
    var sy = Math.sqrt(b2 + d2);
    var sx = Math.sqrt(a2 + c2);
    vec2[0] = sx;
    vec2[1] = sy;
    return vec2;
};
Transform.prototype.getWorldRotation = function ()
{
    var world = this.world;
    var a = world[0];
    var c = world[2];
    var a2 = a * a;
    var c2 = c * c;
    return Math.acos(a / Math.sqrt(a2 + c2)) * (Math.atan(-c / a) < 0 ? -1 : 1);
};

// Enough space for 10K transforms.
Transform.float32Buffer = new Float32Array(100000);
Transform.bumpIndex = 0;
Transform.transformSize = 5;
Transform.freeList = [];

// Fixed size of 5
Transform.allocateTransformData = function () 
{
    var freeList = Transform.freeList;
    var bumpIndex = Transform.bumpIndex;
    var float32Buffer = Transform.float32Buffer;
    // First check free list if we have available blocks
    if (freeList.length > 0)
    {
        return freeList.pop();
    }
    // if not we allocate
    var block = float32Buffer.subarray(bumpIndex, bumpIndex + Transform.transformSize);
    Transform.bumpIndex += Transform.transformSize;
    return block;
};

Transform.freeTransformData = function(transformData)
{
    var index = freeList.indexOf(transformData);
    if (transformData !== null && index < 0)
    {
        freeList.push(transformData);
    }
};