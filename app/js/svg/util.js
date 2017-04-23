export function serializePoints(coordList) {
  return coordList.map(coord => `${coord.svgX},${coord.svgY}`).join(' ');
}
