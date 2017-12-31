/**
 * Invert an array into a Map that maps values to their original indexes
 *
 * Example:
 *
 * ```
 * > invertArray(['a', 'b', 'c'])
 * Map { 'a' => 0, 'b' => 1, 'c' => 2 }
 * ```
 * @param {[any]} array  The array to invert.
 */
export function invertArray(array) {
  const inverse = new Map();
  array.forEach((value, index) => {
    inverse.set(value, index);
  });
  return inverse;
}

/**
 * Wraps an array around by one element. Does not modify original array.
 *
 * Example:
 *
 * ```
 * > wrapAroundArray([1, 2, 3, 4])
 * [1, 2, 3, 4, 1]
 * ```
 *
 * @param {[any]} array  The array to wrap around.
 */
export function wrapAroundArray(array) {
  const first = array[0];
  return array.concat(first);
}
