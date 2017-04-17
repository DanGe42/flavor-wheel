import WheelMediator from './wheel';

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.onload = function() {
  const categories = [
    'sweet',
    'sour/tart',
    'floral',
    'spicy',
    'salty',
    'berry fruit',
    'citrus fruit',
    'stone fruit',
    'chocolate',
    'caramel',
    'smoky',
    'bitter',
    'savory',
    'body',
    'clean',
    'linger/finish'
  ];
  const mediator = new WheelMediator({
    maxValue: 5,
    tickCount: 5,
    categories: categories
  });
  const renderer = mediator.createRendererWithSelector(document, '#tasting-wheel-container');
  renderer.renderBase();
  renderer.renderData(
    Array(16).fill(null).map(() => getRandomIntInclusive(1, 5)),
    5);
};
