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

import { setAttributes } from './common/dom';
import WheelMediator from './wheel';
import { initEnvironment } from './common/browser';

initEnvironment(window);

const groupClass = 'wheel-control__form__group';
const rangeClass = 'wheel-control__form__range';
const labelClass = 'wheel-control__form__label';

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalizeCategoryForName(category) {
  return category.replace(/[ \n/]+/, '-');
}

function buildInputGroup(inputGroup, categories) {
  categories.forEach(category => {
    const name = normalizeCategoryForName(category);
    const group = document.createElement('div');
    setAttributes(group, {class: groupClass});

    const input = document.createElement('input');
    setAttributes(input, {
      name: name,
      class: rangeClass,
      type: 'range',
      min: 1, max: 5, step: 1, value: getRandomIntInclusive(1, 5),
      'data-category': category
    });

    const label = document.createElement('label');
    setAttributes(label, {for: name, class: labelClass});
    label.textContent = category;

    group.appendChild(label);
    group.appendChild(input);
    inputGroup.appendChild(group);
  });
}

function getData(form) {
  const inputs = Array.prototype.slice.call(form.querySelectorAll(`.${rangeClass}`));
  return inputs.map(input => parseInt(input.value, 10));
}

// TODO: too many args
function setupUpdate(form, renderer, categories) {
  const inputs = Array.prototype.slice.call(form.querySelectorAll(`.${rangeClass}`));
  const container = document.getElementById('tasting-wheel-container');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      if (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      buildWheel(renderer, getData(form), categories);
    });
  });
}

function buildWheel(renderer, data, categories) {
  renderer.renderBase();
  renderer.renderData(data, 5);
  renderer.renderLabels(categories);
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
  const inputGroup = document.getElementById('wheel-control__form');
  buildInputGroup(inputGroup, categories);
  const mediator = new WheelMediator({
    maxValue: 5,
    tickCount: 5,
    categories: categories
  });
  const renderer = mediator.createRendererWithSelector('#tasting-wheel-container');

  buildWheel(renderer, getData(inputGroup), categories);
  setupUpdate(inputGroup, renderer, categories);
};
