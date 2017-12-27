import * as d3 from 'd3';
import { invertArray } from '../util/arrays';

class FlavorWheelConfig {
    /**
     * Creates a FlavorWheelConfig from an ad-hoc config object.
     *
     * Config schema:
     *
     * ```js
     * {
     *   maxRating: Number,
     *   maxGridRadius: Number,
     *   labels: [String]
     * }
     * ```
     */
    constructor(config) {
        if (!config.labels || config.labels.length < 1) {
            throw new Error('At least 1 label required');
        }

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

    get ratingRadialScale() {
        if (!this._ratingRadialScale) {
            this._ratingRadialScale = d3.scaleLinear()
                .domain([0, this.maxRating])
                .range([0, this.gridRadius]);
        }
        return this._ratingRadialScale;
    }

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

    getLabelIndex(label) {
        return this._labelIndexes.get(label);
    }
}

export default FlavorWheelConfig;