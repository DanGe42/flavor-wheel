import * as d3 from 'd3';

import Datum from './internal/datum';
import FlavorWheelConfig from './internal/config';
import GridRenderer from './internal/grid-renderer';

import { mustExist } from './common/preconditions';
import { invertArray, wrapAroundArray } from './util/arrays';
import Coordinate from './util/coordinate';

class FlavorWheel {
    /**
     * Constructs a new FlavorWheel. This constructor does not initialize the
     * required SVG structure, and thus, the preferred way to create
     * a FlavorWheel is via the static `FlavorWheel.initialize` method.
     */
    constructor({ rootSvg, config }) {
        this.rootSvg = rootSvg;
        this.config = config;

        this.dataPointsGroup = rootSvg.select('.flavor-wheel__data-points');
        this.dataPolyGroup = rootSvg.select('.flavor-wheel__data-polyline');

        this.flavorProfiles = [];
    }

    /**
     * Initializes a FlavorWheel. This is the preferred way to create a
     * FlavorWheel. This sets up the required SVG elements to render a grid,
     * and returns a FlavorWheel object over the SVG.
     *
     * A typical invocation might look like this:
     *
     * ```js
     * const wheel = FlavorWheel.initialize("#wheel", {
     *   maxRating: 5,
     *   gridRadius: 250,
     *   viewWidth: 800,
     *   labels: ['smoky', 'berry\nfruit', 'bitter', 'sweet', 'sour', 'floral']
     * });
     * ```
     *
     * See documentation in flavor-wheel/internal/config.js for configuration
     * details.
     *
     * @param {(string|Element)} targetSelector - A selector string passed to
     *      `d3.select`. Can also be an Element. See documentation on
     *      `d3.select` for full details.
     * @param {object} config - An object literal containing configuration.
     * @returns {FlavorWheel}
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

    /**
     * Adds a data set to render.
     *
     * The data set should be passed in as an array of `{ label, value }`
     * object literals.
     *
     * The `key` will be passed to D3 as the key for this data set. See
     * https://bost.ocks.org/mike/constancy/ for more information. To summarize,
     * this `key` uniquely identifies this data set, which also allows you to
     * use `addData` to update a data set as well.
     *
     * Usage example:
     *
     * ```js
     * const wheel = FlavorWheel.initialize("#wheel", config);
     * const data = [
     *   { label: 'salty', value: 1 },
     *   { label: 'spicy', value: 2 },
     *   { label: 'floral', value: 3 },
     *   { label: 'sour/tart', value: 4 },
     *   { label: 'sweet', value: 5 },
     *   { label: 'linger/\nfinish', value: 1 }
     * ];
     *
     * // Add data
     * wheel.addData(data, 'profile1');
     *
     * // Update data
     * // Note: this can be done with an entirely new data set.
     * data[2].value = 5;
     * wheel.addData(data, 'profile1');
     *
     * // Add entirely new data
     * wheel.addData(data, 'profile2');
     * ```
     *
     * @param {object[]} data - Array of data to add.
     * @param {string} key - Uniquely indentifiable string for this data set.
     * @param {string} [className] - HTML class name. Currently unused.
     */
    addData(data, key, className = null) {
        mustExist(key);

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