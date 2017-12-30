import * as d3 from 'd3';
import { invertArray } from '../util/arrays';
import { mustExist, checkState } from '../common/preconditions';

class FlavorWheelConfig {
    /**
     * Creates a FlavorWheelConfig from an ad-hoc config object.
     *
     * @param {Object} config - The FlavorWheel configuration object.
     * @param {string[]} config.labels - List of labels. Must have at least
     *      one label.
     * @param {number} [config.maxRating] - Maximum rating. Defaults to 5.
     * @param {number} [config.gridRadius] - Radius of circular grid.
     *      Defaults to 250.
     * @param {number} [config.viewWidth] - View width of SVG. Is used to
     *      calculate the `viewWidth` attribute. Defaults to 800.
     */
    constructor(config) {
        mustExist(config, 'a config object is required');
        mustExist(config.labels, 'config.labels must be specified');
        checkState(config.labels.length >= 1, 'config.labels must be non-empty');

        this.maxRating = config.maxRating || 5;
        this.gridRadius = config.gridRadius || 250;
        this.viewWidth = config.svgConfig || 800;

        this.labels = config.labels.slice(); // slice() to make a copy
        this._labelIndexes = invertArray(config.labels);
    }

    get viewBox() {
        const viewWidth = this.viewWidth;
        return `${-viewWidth / 2} ${-viewWidth / 2} ${viewWidth} ${viewWidth}`;
    }

    /**
     * Returns a linear scale mapping a rating to its radius in the circular grid.
     *
     * @returns {d3.scaleLinear}
     */
    get ratingRadialScale() {
        if (!this._ratingRadialScale) {
            this._ratingRadialScale = d3.scaleLinear()
                .domain([0, this.maxRating])
                .range([0, this.gridRadius]);
        }
        return this._ratingRadialScale;
    }

    /**
     * Returns a linear scale mapping a label's index to its angle in the grid.
     *
     * @returns {d3.scaleLinear}
     */
    get labelAngularScale() {
        if (!this._labelAngularScale) {
            this._labelAngularScale = d3.scaleLinear()
                // Since this is on a circle, something on 2*pi rad will overlap
                // with 0 rad. Thus, the domain is 0 -> labels.length,
                // inclusive.
                .domain([0, this.labels.length])
                .range([0, 2 * Math.PI]);
        }
        return this._labelAngularScale;
    }

    /**
     * Return the index of a label in the configured list of labels.
     *
     * @param {string} label - Label to look up.
     * @returns {number} Index of the label.
     */
    getLabelIndex(label) {
        return this._labelIndexes.get(label);
    }
}

export default FlavorWheelConfig;