import { createSVGElement } from './dom';

function ext(target, source) {
  return Object.assign(target, source);
}

export function makeLine(coord1, coord2, attrs = {}) {
  return createSVGElement('line', ext({
    x1: coord1.svgX, y1: coord1.svgY,
    x2: coord2.svgX, y2: coord2.svgY
  }, attrs));
}

export function makeRoot(attrs = {}) {
  return createSVGElement('svg', ext({
    version: '1.1',
    baseProfile: 'full'
  }, attrs));
}

export function makeGroup(attrs = {}) {
  return createSVGElement('g', attrs);
}

export function makeCircle(center, radius, attrs = {}) {
  return createSVGElement('circle', ext({
    cx: center.svgX, cy: center.svgY,
    r: radius
  }, attrs));
}

export function makePolygon(coordList, attrs = {}) {
  const points = coordList.map(coord => `${coord.svgX},${coord.svgY}`).join(' ');
  return createSVGElement('polygon', ext({
    points: points
  }, attrs));
}
