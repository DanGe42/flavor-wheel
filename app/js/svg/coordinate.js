import { exists } from '../common/base';

/**
 * A Coordinate represents both a Cartesian coordinate and a polar coordinate.
 */
function Coordinate(coords) {
  const { x, y, r, theta } = coords;

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

// Normalize for SVG coordinate system (origin is top-left)
// When computing math, these properties should never be used. These should only
// be accessed when setting positions for SVG elements.
Object.defineProperty(Coordinate.prototype, 'svgX', {
  get: function() { return this.x; }
});

Object.defineProperty(Coordinate.prototype, 'svgY', {
  get: function() { return -this.y; }
});

Coordinate.prototype.toString = function() {
  return `{xy=(${this.x}, ${this.y}), polar=(${this.r}, ${this.theta} rad)}`;
};

Coordinate.prototype._throwIfInvalid = function() {
  if (isNaN(this.x) || isNaN(this.y) || isNaN(this.r) || isNaN(this.theta)) {
    throw new Error(`Bad coordinates given: ${this.toString()}`);
  }
};

Coordinate.ORIGIN = new Coordinate({x: 0, y: 0});

export default Coordinate;
