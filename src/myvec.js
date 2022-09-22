
class myVec {
    constructor(x, y, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    dist(vec) {
        return Math.sqrt(
            (this.x - vec.x) * (this.x - vec.x) + (this.y - vec.y) * (this.y - vec.y) + (this.z - vec.z) * (this.z - vec.z)
        )
    }

    angleBetween(vec) {
        const dotmagmag = this.dot(vec) / (this.mag() * vec.mag());
        // Mathematically speaking: the dotmagmag variable will be between -1 and 1
        // inclusive. Practically though it could be slightly outside this range due to
        // floating-point rounding issues. This can make Math.acos return NaN.
        //
        // Solution: we'll clamp the value to the -1,1 range
        let angle;
        angle = Math.acos(Math.min(1, Math.max(-1, dotmagmag)));
        angle = angle * Math.sign(this.cross(vec).z || 1);
        return angle;
    }

    cross(v) {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;
        return new myVec(x, y, z);
    }

    dot(vec) {
        return this.x * (vec.x || 0) + this.y * (vec.y || 0) + this.z * (vec.z || 0);
    }

    mag() {
        return Math.sqrt(
            (this.x) * (this.x) + (this.y) * (this.y) + (this.z) * (this.z)
        )
    }

    div(val) {
        return new myVec(this.x / val, this.y / val, this.z / val);
    }

    normalize() {
        return this.div(this.mag());
    }
}

module.exports = myVec;