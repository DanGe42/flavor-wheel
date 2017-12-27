// undefined can be redefined. A true undefined can be produced by not passing
// anything as an argument.
const undefined = (function(undef) { return undef; })();

function exists(value) {
    return !(value === null || value === undefined);
}

class Coordinate {
    constructor({ x: x, y: y, r: r, theta: theta }) {
        if (exists(x) && exists(y)) {
            this.x = x;
            this.y = y;

            this.r = Math.sqrt(x * x + y * y);
            this.theta = Math.atan2(y, x);
        } else if (exists(r) && exists(theta)) {
            this.r = r;
            this.theta = theta;

            this.x = r * Math.cos(theta);
            this.y = r * Math.sin(theta);
        } else {
            throw new Error(`Invalid Coordinate arg ${JSON.stringify(coords)}`);
        }
        this._throwIfInvalid();
    }

    static polar({ r: r, theta: theta }) {
        return new Coordinate({ r, theta });
    }

    static cartesian({ x: x, y: y }) {
        return new Coordinate({ x, y });
    }

    // Normalize for SVG coordinate system (origin is top-left)
    // When computing math, these properties should never be used. These should only
    // be accessed when setting positions for SVG elements.
    get svgX() {
        return this.x;
    }

    get svgY() {
        return -this.y;
    }

    toString() {
        return `{xy=(${this.x}, ${this.y}), polar=(${this.r}, ${this.theta} rad)}`;
    }

    _throwIfInvalid() {
        if (isNaN(this.x) || isNaN(this.y) || isNaN(this.r) || isNaN(this.theta)) {
            throw new Error(`Bad coordinates given: ${this.toString()}`);
        }
    }
}

Coordinate.ORIGIN = Coordinate.cartesian({x: 0, y: 0});

export default Coordinate;