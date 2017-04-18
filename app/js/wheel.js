import { document }  from './common/browser';
import { withDefault } from './common/base';
import { mustExist, checkState } from './common/preconditions';
import Coordinate from './svg/coordinate';
import WheelRenderer from './wheel_renderer';

export default function WheelMediator(constraints) {
  const { maxValue, tickCount, categories } = constraints;
  this.maxValue = mustExist(maxValue);
  this.tickCount = mustExist(tickCount);
  this.categories = mustExist(categories);
};

WheelMediator.prototype.createRendererWithSelector = function(selector) {
  const element = document.querySelector(selector);
  return this.createRenderer(element);
};

WheelMediator.prototype.createRenderer = function(container) {
  return new WheelRenderer(container, {
    ringCount: this.tickCount,
    rayCount: this.categories.length
  });
};
