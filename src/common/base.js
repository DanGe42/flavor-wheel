// undefined can be redefined. A true undefined can be produced by not passing
// anything as an argument.
const undefined = (function(undef) { return undef; })();

export function exists(value) {
  return !(value === null || value === undefined);
};

export function withDefault(value, def) {
  return exists(value) ? value : def;
};
