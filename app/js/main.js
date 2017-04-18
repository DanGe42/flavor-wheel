// At first glance, requiring an SCSS file in a JS file looks very wrong. But
// here's how this works.
//
// Our webpack.config.js declares that SCSS will be compiled into CSS
// (sass-loader). The CSS will then be converted into a CommonJS module
// (css-loader); this means that it can be required and that it will get
// injected into the document as a <style> tag. The ExtractTextPlugin then
// extracts this style blob from the intermediate generated JS bundle into a
// bundle.css that gets served separately.
//
// Don't you love frontend development?
require('../css/main.scss');

import WheelMediator from './wheel';
import { initEnvironment } from './common/browser';

initEnvironment(window);

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.onload = function() {
  const categories = [
    'salty',
    'spicy',
    'floral',
    'sour/tart',
    'sweet',
    'linger/\nfinish',
    'clean',
    'body',
    'savory',
    'bitter',
    'smoky',
    'caramel',
    'chocolate',
    'stone\nfruit',
    'citrus\nfruit',
    'berry\nfruit'
  ];
  const mediator = new WheelMediator({
    maxValue: 5,
    tickCount: 5,
    categories: categories
  });
  const renderer = mediator.createRendererWithSelector('#tasting-wheel-container');
  renderer.renderBase();
  renderer.renderData(
    Array(16).fill(null).map(() => getRandomIntInclusive(1, 5)),
    5);
  renderer.renderLabels(categories);
};
