import { exists } from '../common/base';
import { setAttributes } from '../common/dom';
import { createSVGElement } from './dom';
import Coordinate from './coordinate';

export function makeText(text, position, attrs = {}) {
  position = position || Coordinate.ORIGIN;
  attrs['x'] = position.svgX;
  attrs['y'] = position.svgY;

  const textElement = createSVGElement('text', attrs);
  if (exists(text)) {
    element.textContent = text;
  };
  return textElement;
}

export function makeMultilinedText(text, lineHeight, position, attrs = {}) {
  position = position || Coordinate.ORIGIN;
  lineHeight = lineHeight || '1em';
  const textElement = makeText(null, position, attrs);

  const lines = text.split("\n");
  lines.forEach(line => {
    const tspan = createSVGElement('tspan', {x: position.svgX, dy: lineHeight});
    tspan.textContent = line;
    textElement.appendChild(tspan);
  });

  return textElement;
}

// Move the parent text element. This doesn't move any tspans.
export function repositionText(textElement, position) {
  setAttributes(textElement, {x: position.svgX, y: position.svgY});
};

export function repositionMultilinedText(textElement, position) {
  repositionText(textElement, position);
  const tspans = textElement.querySelectorAll('tspan');
  // a NodeList is not an array
  for (let i = 0; i < tspans.length; i += 1) {
    let tspan = tspans[i];
    setAttributes(tspan, {x: position.svgX});
  }
};
