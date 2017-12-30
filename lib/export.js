function serializeToXML(svgNode) {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgNode);

  // Add XML declaration
  const xmlDeclaration = '<?xml version="1.0" standalone="no"?>';
  return `${xmlDeclaration}${svgString}`;
}

function constructDataURI(mime, data) {
  return `data:${mime};charset=utf-8,${encodeURIComponent(source)}`;
}

export function dataURIForSVG(svgNode) {
  const xml = serializeToXML(svgNode);
  const mime = 'image/svg+xml';
  return constructDataURI(mime, xml);
}
