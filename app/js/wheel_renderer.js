import Coordinate from './coordinate';
import { exists, withDefault, removeAllChildren } from './util';
import { mustExist, checkState } from './preconditions';

export default function WheelRenderer(document, container, options) {
  this.document = document;
  this.svgContainer = container;

  options = options || {};
  const {
    radius, drawingRadius, viewBox, id, rayCount, ringCount
  } = options;

  this.id = id;
  this.radius = withDefault(radius, 250);
  // Total circle radius is 250, but depending on styling, you may have to
  // adjust further.
  this.viewBox = withDefault(viewBox, '-257 -257 514 514');
  this.rayCount = withDefault(rayCount, 16);
  this.ringCount = withDefault(ringCount, 5);
}

WheelRenderer.prototype.renderBase = function() {
  const svg = this._newSvgElement('svg', {
    version: '1.1',
    baseProfile: 'full',
    viewBox: this.viewBox
  });
  if (exists(this.id)) {
    svg.setAttribute('id', this.id);
  }
  this.svgContainer.appendChild(svg);

  const circleGroup = this._drawRings(this.ringCount);
  svg.appendChild(circleGroup);

  const rayGroup = this._drawRays(this.rayCount);
  svg.appendChild(rayGroup);

  const debug = this._newSvgElement('g', { class: 'debug' });
  const labels = this._newSvgElement('g', { class: 'labels hidden' });
  const data = this._newSvgElement('g', { class: 'data' });
  svg.appendChild(debug);
  svg.appendChild(labels);
  svg.appendChild(data);

  this.svgContainer.appendChild(svg);

  this.debugGroup = debug;
  this.labelGroup = labels;
  this.dataGroup = data;
};

WheelRenderer.prototype._debugRect = function(coord, bbox, data) {
  const rect = this._newSvgElement('rect', {
    x: coord.svgX, y: coord.svgY, width: bbox.width, height: bbox.height,
    'data-debug': data || ''
  });
  this.debugGroup.appendChild(rect);
};

WheelRenderer.prototype._debugRay = function(coord, data) {
  const line = this._makeLine(new Coordinate({x: 0, y: 0}), coord);
  line.setAttribute('data-debug', data || '');
  this.debugGroup.appendChild(line);
};

WheelRenderer.prototype._clearDebug = function() {
  removeAllChildren(this.debugGroup);
};

WheelRenderer.prototype.renderLabels = function(labelList) {
  checkState(this.rayCount == labelList.length,
    'Length of labels must match number of rays');

  // Preload text labels so that we can get their bounding box.
  // The `texts` array ordering corresponds to the label ordering.
  this.labelGroup.classList.add('hidden');
  let texts = this._createTextNodes(labelList);
  texts.forEach(text => this.labelGroup.appendChild(text));

  // As a result of adding the texts to the DOM, they get rendered in accordance
  // to any supplied CSS rules as well. So, let's render them in the proper
  // spots now.
  // Our strategy will be as follows:
  // 1. Draw a slightly larger imaginary circle than the outer radius.
  // 2. For each ray, draw an imaginary collinear line to the imaginary circle.
  // 3. At each point of intersection, place a text box centered there.

  // 1. Draw the new circle
  const labelRadius = this.radius + 50;

  texts.forEach((text, i) => {
    // 2. Draw an imaginary line to the circle
    const theta = (2 * i / this.rayCount) * Math.PI;
    const labelCenter = new Coordinate({r: labelRadius, theta: theta});

    const width = text.getBBox().width;
    const height = text.getBBox().height;

    // 3. Place a text box centered at the intersection
    // Label draw point is the top-left corner of the bounding box
    // To move left, subtract from x coordinate
    // To move up, add to y coordinate
    const labelOrigin = new Coordinate({
      x: labelCenter.x - width / 2,
      y: labelCenter.y + height / 2
    });
    repositionText(text, labelOrigin);
  });

  this.labelGroup.classList.remove('hidden');
};

function repositionText(text, coordinate) {
  text.setAttribute('x', coordinate.svgX);
  text.setAttribute('y', coordinate.svgY);
  const tspans = text.children;
  for (let i = 0; i < tspans.length; i += 1) {
    let tspan = tspans[i];
    tspan.setAttribute('x', coordinate.svgX);
  }
}

WheelRenderer.prototype.renderData = function(dataPoints, upperBound) {
  mustExist(upperBound);
  const radii = dataPoints.map(d => this.scaleToRadius(d, upperBound));
  this.renderRadii(radii);
};

WheelRenderer.prototype.renderRadii = function(radiiList) {
  checkState(this.rayCount == radiiList.length,
    'Length of supplied data points must match number of rays');
  const points = radiiList.map((radius, i) => {
    const theta = (2 * i / this.rayCount) *  Math.PI;
    return new Coordinate({r: radius, theta: theta});
  });

  const polygonPoints = points.map(coord => `${coord.svgX},${coord.svgY}`).join(' ');
  const polygon = this._newSvgElement('polygon', {
    class: 'data__poly',
    points: polygonPoints,
    "stroke-width": 4
  });

  const dots = points.map(coord => {
    return this._newSvgElement('circle', {
      class: 'data__point',
      cx: coord.svgX, cy: coord.svgY, r: 4
    })
  });

  removeAllChildren(this.dataGroup);
  this.dataGroup.appendChild(polygon);
  dots.forEach(dot => this.dataGroup.appendChild(dot));
};

WheelRenderer.prototype.scaleToRadius = function(value, upperBound) {
  return value * this.radius / upperBound;
};

WheelRenderer.prototype._createTextNodes = function(labels) {
  return labels.map(labelText => {
    const lines = labelText.split('\n');
    const text = this._newSvgElement('text');
    lines.forEach(line => {
      const tspan = this._newSvgElement('tspan', {x: 0, dy: '1em'});
      tspan.textContent = line;
      text.appendChild(tspan);
    });

    return text;
  });
};

WheelRenderer.prototype._drawRings = function(ringCount) {
  // First create the ring group
  const g = this._newSvgElement('g', { class: 'grid__circle' });

  // Create the outer circle
  const outerCircle = this._newSvgElement('circle', {
    class: 'circle__outer',
    cx: 0, cy: 0, r: this.radius,
    "stroke-width": 6, fill: 'none'
  });
  g.appendChild(outerCircle);

  // Build inner circles. Subtract 1 because we've build the outer circle, and
  // start at 1 because we won't draw the origin.
  for (let i = 1; i <= ringCount - 1; i += 1) {
    let ring = this._newSvgElement('circle', {
      class: 'circle__inner',
      cx: 0, cy: 0,
      r: i * (this.radius / ringCount),
      "stroke-width": 3, fill: 'none'
    });
    g.appendChild(ring);
  }

  return g;
};

WheelRenderer.prototype._drawRays = function(rayCount) {
  const g = this._newSvgElement('g', { class: 'ray-grid' });

  const origin = new Coordinate({x: 0, y: 0});
  // Draw each ray from the origin to the perimeter
  for (let i = 0; i < rayCount; i += 1) {
    let theta = (2 * i / rayCount) *  Math.PI;
    let endPoint = new Coordinate({r: this.radius, theta: theta});
    let line = this._makeLine(origin, endPoint);
    line.setAttribute('stroke-width', 1);
    g.appendChild(line);
  }

  return g;
};

WheelRenderer.prototype._makeLine = function(c1, c2) {
  return this._newSvgElement('line', {
    x1: c1.svgX, y1: c1.svgY,
    x2: c2.svgX, y2: c2.svgY
  });
};

WheelRenderer.prototype._newSvgElement = function(tag, attrs) {
  const element = this.document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (let attr in attrs) {
    if (attrs.hasOwnProperty(attr)) {
      let value = attrs[attr];
      if (typeof value !== 'string') {
        value = String(value);
      }
      element.setAttribute(attr, value);
    }
  }
  return element;
};
