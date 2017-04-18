import { exists } from '../common/base';
import { document } from '../common/browser';
import { setAttributes } from '../common/dom';

export function createSVGElement(tag, attrs) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  if (exists(attrs)) {
    setAttributes(element, attrs);
  }
  return element;
}
