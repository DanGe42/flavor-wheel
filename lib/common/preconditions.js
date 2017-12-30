import { exists } from './base';

export function mustExist(value, message) {
  if (!exists(value)) {
    let error = new Error(message);
    error.name = 'NotExistError';
    throw error;
  }

  return value;
};

export function checkState(condition, message) {
  if (!condition) {
    let error = new Error(message);
    error.name = 'StateError';
    throw error;
  }
};
