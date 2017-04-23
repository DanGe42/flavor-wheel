import Coordinate from './svg/coordinate';
import { exists, withDefault } from './common/base';
import { document } from './common/browser';
import { removeAllChildren, appendChildren } from './common/dom';
import { mustExist, checkState } from './common/preconditions';
import { createSVGElement } from './svg/dom';
import {
  makeLine,
  makeRoot,
  makeGroup,
  makeCircle,
  makePolygon
} from './svg/shapes';
import { serializePoints } from './svg/util';
import { makeMultilinedText, repositionMultilinedText } from './svg/text';

export default function WheelRenderer(container, options = {}) {
  this.svgContainer = container;

  const {
    radius, drawingRadius, viewBox, id, rayCount, ringCount
  } = options;

  this.id = id;
  this.radius = withDefault(radius, 250);
  // Total circle radius is 250, but depending on styling, you may have to
  // adjust further.
  this.viewBox = computeViewBox(withDefault(drawingRadius, 400));
  this.rayCount = withDefault(rayCount, 16);
  this.ringCount = withDefault(ringCount, 5);
}

function computeViewBox(drawnRadius) {
  return `-${drawnRadius} -${drawnRadius} ${2*drawnRadius} ${2*drawnRadius}`;
}

WheelRenderer.prototype.renderBase = function() {
  const svg = makeRoot({viewBox: this.viewBox});
  if (exists(this.id)) {
    svg.setAttribute('id', this.id);
  }
  this.svgContainer.appendChild(svg);

  const circleGroup = this._drawRings(this.ringCount);
  const rayGroup = this._drawRays(this.rayCount);
  const debug = makeGroup({ class: 'debug' });
  const labels = makeGroup({ class: 'labels hidden' });
  const data = makeGroup({ class: 'data' });

  this.debugGroup = debug;
  this.labelGroup = labels;
  this.dataGroup = data;

  // This is order dependent: last one is drawn on top.
  appendChildren(svg, [circleGroup, rayGroup, debug, labels, data]);

  this.svgContainer.appendChild(svg);
};

WheelRenderer.prototype._debugRect = function(coord, bbox, data) {
  const rect = createSVGElement('rect', {
    x: coord.svgX, y: coord.svgY, width: bbox.width, height: bbox.height,
    'data-debug': data || ''
  });
  this.debugGroup.appendChild(rect);
};

WheelRenderer.prototype._debugRay = function(coord, data) {
  const line = makeLine(Coordinate.ORIGIN, coord, {
      'data-debug': data || ''
    });
  this.debugGroup.appendChild(line);
};

WheelRenderer.prototype.renderLabels = function(labelList) {
  checkState(this.rayCount == labelList.length,
    'Length of labels must match number of rays');

  // Create text labels and add them to the DOM. Ensure that the group we add to
  // is hidden. We have to render these labels first in order to get their
  // bounding box.
  // The `texts` array ordering corresponds to the label ordering.
  this.labelGroup.classList.add('hidden');
  const texts = labelList.map(labelText => makeMultilinedText(labelText, '1em'));
  appendChildren(this.labelGroup, texts);

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

    const { width, height } = text.getBBox();

    // 3. Place a text box centered at the intersection
    // Label draw point is the top-left corner of the bounding box
    // To move left, subtract from x coordinate
    // To move up, add to y coordinate
    const labelOrigin = new Coordinate({
      x: labelCenter.x - width / 2,
      y: labelCenter.y + height / 2
    });
    repositionMultilinedText(text, labelOrigin);
  });

  this.labelGroup.classList.remove('hidden');
};

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

  const polygon = makePolygon(points, {
    class: 'data__poly',
    "stroke-width": 4
  });

  const dots = points.map(coord => makeCircle(coord, 4, {class: 'data__point'}));

  removeAllChildren(this.dataGroup);
  this.dataGroup.appendChild(polygon);
  appendChildren(this.dataGroup, dots);
};

WheelRenderer.prototype.scaleToRadius = function(value, upperBound) {
  return value * this.radius / upperBound;
};

WheelRenderer.prototype._drawRings = function(ringCount) {
  // First create the ring group
  const g = makeGroup({ class: 'grid__circle' });

  // Create the outer circle
  const outerCircle = makeCircle(Coordinate.ORIGIN, this.radius, {
    class: 'circle__outer',
    "stroke-width": 6, fill: 'none'
  });
  g.appendChild(outerCircle);

  // Build inner circles. Subtract 1 because we've build the outer circle, and
  // start at 1 because we won't draw the origin.
  for (let i = 1; i <= ringCount - 1; i += 1) {
    let radius = i * (this.radius / ringCount);
    let ring = makeCircle(Coordinate.ORIGIN, radius, {
      class: 'circle__inner',
      "stroke-width": 3, fill: 'none'
    });
    g.appendChild(ring);
  }

  return g;
};

WheelRenderer.prototype._drawRays = function(rayCount) {
  const g = makeGroup({ class: 'ray-grid' });

  // Draw each ray from the origin to the perimeter
  for (let i = 0; i < rayCount; i += 1) {
    let theta = (2 * i / rayCount) *  Math.PI;
    let endPoint = new Coordinate({r: this.radius, theta: theta});
    let line = makeLine(Coordinate.ORIGIN, endPoint);
    line.setAttribute('stroke-width', 1);
    g.appendChild(line);
  }

  return g;
};
