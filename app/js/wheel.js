import Coordinate from './coordinate';
import WheelRenderer from './wheel_renderer';
import { withDefault } from './util';
import { mustExist, checkState } from './preconditions';

export default function WheelMediator(constraints) {
  const { maxValue, tickCount, categories } = constraints;
  this.maxValue = mustExist(maxValue);
  this.tickCount = mustExist(tickCount);
  this.categories = mustExist(categories);
};

WheelMediator.prototype.createRendererWithSelector = function(document, selector) {
  const element = document.querySelector(selector);
  return this.createRenderer(document, element);
};

WheelMediator.prototype.createRenderer = function(document, container) {
  return new WheelRenderer(document, container, {
    ringCount: this.tickCount,
    rayCount: this.categories.length
  });
};
