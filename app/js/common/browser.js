import { exists } from './base';
import { checkState } from './preconditions';

export let document = null;
export let window = {
  document: document
};

let initialized = false;

export const initEnvironment = function(_window, _document) {
  checkState(!initialized, '`initEnvironment` can only be called once');

  window = _window;
  if (!exists(_document)) {
    document = _window.document;
  } else {
    document = _document;
  }

  initialized = true;
};
