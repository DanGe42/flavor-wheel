import * as d3 from 'd3';

import FlavorWheelConfig from './internal/config';
import GridRenderer from './internal/grid-renderer';
import { invertArray, wrapAroundArray } from './util/arrays';
import Coordinate from './util/coordinate';

class FlavorWheel {
    constructor({ rootSvg, config }) {
        this.rootSvg = rootSvg;
        this.config = config;

        this.dataPointsGroup = rootSvg.select('.flavor-wheel__data-points');
        this.dataPolyGroup = rootSvg.select('.flavor-wheel__data-polyline');

        this.dataSeries = [];
    }

    /**
     *
     * @param {object} config
     */
    static initialize(targetSelector, config) {
        config = new FlavorWheelConfig(config);
        const rootSvg = FlavorWheel.renderBaseSvg(targetSelector, config);
        new GridRenderer(config).render(rootSvg);

        const appendGroup = function appendGroup(klass) {
            return rootSvg.append('g').attr('class', klass);
        }
        appendGroup('flavor-wheel__data-polyline');
        appendGroup('flavor-wheel__data-points');

        return new FlavorWheel({ rootSvg, config });
    }

    static renderBaseSvg(targetSelector, config) {
        return d3.select(targetSelector)
            .attr('viewBox', config.viewBox)
            .attr('version', '1.1')
            .attr('baseProfile', 'full');
    }

    addData(data, key, className = null) {
        this._pushData(data, key, className);
        this._renderData();
    }

    _pushData(data, key, className = null) {
        data = this._preprocessData(data);
        const existingData = this.dataSeries.find(ds => ds.key === key);

        if (!existingData) {
            this.dataSeries.push({ data, key, className });
        } else {
            existingData.data = data;
            existingData.className = className;
        }
    }

    // Convert raw rating data to coordinates ahead of time
    _preprocessData(data) {
        const config = this.config;
        return data.map(({ label, value }) => {
            const index = config.getLabelIndex(label);

            const r = config.ratingRadialScale(value);
            const theta = config.labelAngularScale(index);

            const coordinate = Coordinate.polar({ r, theta });
            return { label, coordinate };
        });
    }

    _renderData() {
        const config = this.config;
        const dataSeries = this.dataSeries;

        const polyPointGenerator = d3.line()
            .x(datum => datum.coordinate.svgX)
            .y(datum => datum.coordinate.svgY);

        this.dataPolyGroup.selectAll('path')
            .data(dataSeries, ds => ds.key)
            .enter()
            .append('path')
            .attr('class', 'data-polyline__path')
            .attr('d', ds => polyPointGenerator(wrapAroundArray(ds.data)))
            .exit();

        const pointsForSeries = this.dataPointsGroup.selectAll('g')
            .data(dataSeries, ds => ds.key)
            .enter().append('g')
            .attr('class', 'data-points__point-group');

        pointsForSeries.selectAll('circle').data(ds => ds.data)
            .enter().append('circle')
            .attr('class', 'data-points__point')
            .attr('cx', datum => datum.coordinate.svgX)
            .attr('cy', datum => datum.coordinate.svgY)
            .attr('r', 4);
    }
}

export default FlavorWheel;
export const FlavorTown = FlavorWheel;