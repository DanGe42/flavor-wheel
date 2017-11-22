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

import * as d3 from 'd3';
import FlavorWheel from './flavor-wheel/flavor-wheel';

const groupClass = 'wheel-control__form-group';
const rangeClass = 'form-group__range';
const labelClass = 'form-group__label';

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalizeCategoryForName(category) {
  return category.replace(/[ \n/]+/, '-');
}

function buildInputGroup(inputGroup, categories) {
  const formGroups = d3.select(inputGroup)
    .selectAll('div')
    .data(categories)
    .enter().append('div')
    .attr('class', groupClass);

  formGroups
    .append('label')
    .attr('class', labelClass)
    .attr('for', category => normalizeCategoryForName(category))
    .text(category => category);

  formGroups
    .append('input')
    .attr('class', rangeClass)
    .attr('name', category => normalizeCategoryForName(category))
    .attr('type', 'range')
    .attr('min', 1).attr('max', 5).attr('step', 1)
    .attr('value', _ignored => getRandomIntInclusive(1, 5))
    .attr('data-category', category => category);
}

function getData(form) {
  const inputs = Array.prototype.slice.call(form.querySelectorAll(`.${rangeClass}`));
  return inputs.map(input => {
    const label = input.getAttribute('data-category');
    const value = parseInt(input.value, 10);
    return { label, value };
  });
}

// TODO: too many args
function setupUpdate(form, wheel) {
  const inputs = Array.prototype.slice.call(form.querySelectorAll(`.${rangeClass}`));
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      wheel.addData(getData(form), '2');
    });
  });
}

const testData = [
  { label: 'salty', value: 1 },
  { label: 'spicy', value: 2 },
  { label: 'floral', value: 3 },
  { label: 'sour/tart', value: 4 },
  { label: 'sweet', value: 5 },
  { label: 'linger/\nfinish', value: 1 },
  { label: 'clean', value: 2 },
  { label: 'body', value: 3 },
  { label: 'savory', value: 4 },
  { label: 'bitter', value: 5 },
  { label: 'smoky', value: 1 },
  { label: 'caramel', value: 2 },
  { label: 'chocolate', value: 3 },
  { label: 'stone\nfruit', value: 4 },
  { label: 'citrus\nfruit', value: 5 },
  { label: 'berry\nfruit', value: 1 }
];

const CATEGORIES = testData.map(({ label }) => label);

window.onload = function() {
  const inputGroup = document.getElementById('wheel-control-form');
  if (inputGroup) {
    buildInputGroup('#wheel-control-form', CATEGORIES);

    const wheel = FlavorWheel.initialize("#d3wheel", {
      maxRating: 5,
      gridRadius: 250,
      viewWidth: 800,
      labels: CATEGORIES
    });

    wheel.addData(testData, '1');
    wheel.addData(getData(inputGroup), '2');

    setupUpdate(inputGroup, wheel);
  }
};
