import * as d3 from 'd3';

import Datum from './internal/datum';
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

        this.flavorProfiles = [];
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
        data = data.map(({ label, value }) => new Datum(this.config, label, value));
        // _renderData() doesn't do anything explicit with the order of the
        // data, so here we sort according to the original order specified in
        // config.labels.
        data.sort((d1, d2) => {
            const config = this.config;
            const lIndex1 = config.getLabelIndex(d1.label);
            const lIndex2 = config.getLabelIndex(d2.label);
            return lIndex1 - lIndex2;
        });
        const existingData = this.flavorProfiles.find(profile => profile.key === key);

        if (!existingData) {
            this.flavorProfiles.push({ data, key, className });
        } else {
            existingData.data = data;
            existingData.className = className;
        }
    }

    _renderData() {
        const config = this.config;
        const flavorProfiles = this.flavorProfiles;

        const polyPointGenerator = d3.line()
            .x(datum => datum.coordinate.svgX)
            .y(datum => datum.coordinate.svgY);

        // https://bl.ocks.org/mbostock/3808218
        // First, rebind data and update existing paths with new data
        const dataPaths = this.dataPolyGroup.selectAll('path')
            .data(flavorProfiles, profile => profile.key);

        // Create new paths
        dataPaths.enter().append('path')
            .attr('class', 'data-polyline__path')
            // And, together with the new paths, update from the newly bound data
            .merge(dataPaths)
            .attr('d', profile => polyPointGenerator(wrapAroundArray(profile.data)));

        // Remove anything we removed. Not technically implemented yet.
        dataPaths.exit().remove();

        let pointGroups = this.dataPointsGroup.selectAll('g')
            .data(flavorProfiles, profile => profile.key);

        pointGroups.exit().remove();

        // Add new groups and merge it with existing groups so that we can
        // update the data binding for each new and existing point within
        // those groups.
        pointGroups = pointGroups.enter().append('g')
            .attr('class', 'data-points__point-group')
            .merge(pointGroups);

        const flavorPoints = pointGroups.selectAll('circle')
            .data(profile => profile.data);

        flavorPoints.enter().append('circle')
            .attr('class', 'data-points__point')
            .attr('r', 4)
            .merge(flavorPoints)
            .attr('cx', datum => datum.coordinate.svgX)
            .attr('cy', datum => datum.coordinate.svgY);

        flavorPoints.exit().remove();
    }
}

export default FlavorWheel;
export const FlavorTown = FlavorWheel;