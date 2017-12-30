import { mustExist } from './preconditions';

export function removeAllChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};

export function setAttributes(element, attrs) {
  mustExist(element);

  for (let attr in attrs) {
    if (attrs.hasOwnProperty(attr)) {
      let value = attrs[attr];
      if (typeof value !== 'string') {
        value = String(value);
      }
      element.setAttribute(attr, value);
    }
  }
};

export function appendChildren(parent, children) {
  for (let i = 0; i < children.length; i += 1) {
    let child = children[i];
    parent.appendChild(child);
  }
}
