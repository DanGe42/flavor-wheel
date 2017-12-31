import * as d3 from 'd3';

import Coordinate from '../util/coordinate';

// This class is not meant to exist for a while. Keeping state in this class is
// merely just a matter of convenience.
class GridRenderer {
    constructor(config) {
        this.config = config;

        this._rendered = false;
    }

    render(rootSvg) {
        if (this._rendered) {
            throw new Error('GridRenderer has rendered and cannot render again.');
        }
        this._rendered = true;

        const appendGroup = function appendGroup(classSuffix) {
            return rootSvg.append('g').attr('class', `flavor-wheel__${classSuffix}`);
        }
        const ringGridGroup = appendGroup('ring-grid');
        const rayGridGroup = appendGroup('ray-grid');
        const labelsGroup = appendGroup('flavor-labels');

        this._drawRings(ringGridGroup);
        this._drawRays(rayGridGroup);
        this._drawLabels(labelsGroup);
    }

    _drawRings(ringGrid) {
        const maxRating = this.config.maxRating;
        const radialSteps = d3.ticks(1, maxRating, maxRating - 1);

        ringGrid.selectAll('circle')
            .data(radialSteps)
            .enter().append('circle')
            .attr('cx', 0).attr('cy', 0)
            .attr('r', rating => this.config.ratingRadialScale(rating))
            .attr('class', 'ring-grid__circle');
    }

    _drawRays(rayGrid) {
        const {
            maxRating,
            labels,
            ratingRadialScale,
            labelAngularScale
        } = this.config;

        const rayEndpoints = d3.ticks(0, labels.length - 1, labels.length)
            .map(index => {
                const length = ratingRadialScale(maxRating);
                const angle = labelAngularScale(index);
                return Coordinate.polar({ r: length, theta: angle });
            });

        rayGrid.selectAll('line')
            .data(rayEndpoints)
            .enter().append('line')
            .attr('x1', 0).attr('y1', 0)
            .attr('x2', coord => coord.svgX).attr('y2', coord => coord.svgY)
            .attr('class', 'ray-grid__ray');
    }

    _drawLabels(labelGroup) {
        const {
            maxRating,
            labels,
            ratingRadialScale,
            labelAngularScale
        } = this.config;
        this._prerenderLabels(labelGroup);

        // Interpolate new circle to draw labels
        const labelRadius = ratingRadialScale(maxRating + 1);
        // We need to use the old-style pre-ES6 function to access the
        // D3 - bounded`this`
        labelGroup.selectAll('text').each(function(_ignored, i) {
            // Draw an imaginary line to the interpolated circle
            const theta = labelAngularScale(i);
            const labelCenter = Coordinate.polar({ r: labelRadius, theta: theta });

            // Get handle to the self <text>
            const self = d3.select(this);
            // Access underlying DOM element to get rendered SVG bounding box
            const { width, height } = self.node().getBBox();

            // Place the text box centered at intersection between line and
            // circle.
            // Label draw point is the top-left corner of the bounding box.
            // To move left, subtract from x coordinate.
            // To move up, add to y coordinate.
            const labelOrigin = Coordinate.cartesian({
                x: labelCenter.x - width / 2,
                y: labelCenter.y + height / 2
            });

            // Move the <text> to the calculated origin. This doesn't move the <tspan>
            self.attr('x', labelOrigin.svgX).attr('y', labelOrigin.svgY);
            // Move each of the <tspan> elements
            self.selectAll('tspan').attr('x', labelOrigin.svgX);
        });
    }

    _prerenderLabels(labelGroup) {
        const config = this.config;
        const { labels } = config;
        // There is no way to calculate the bounding box of a label until it
        // is actually drawn on the screen. Thus, pre-render the texts so that
        // we know how much space they take up.

        // First, render the <text> elements
        // https://bost.ocks.org/mike/nest/
        const labelTexts = labelGroup
            .selectAll('text').data(labels, label => config.getLabelIndex(label))
            .enter().append('text')
            .attr('class', 'flavor-labels__label');

        // Then, render each line in a label in its own <tspan>
        labelTexts.selectAll('tspan').data(label => label.split('\n'))
            .enter().append('tspan')
            .attr('class', 'label__line')
            .attr('x', 0).attr('dy', '1em')
            .text(line => line);
    }
}

export default GridRenderer;