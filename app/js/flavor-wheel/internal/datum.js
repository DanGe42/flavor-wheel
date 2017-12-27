import Coordinate from '../util/coordinate';

class Datum {
    constructor(config, label, value) {
        this.label = label;
        this.value = value;

        this._config = config;
    }

    get coordinate() {
        if (!this._coordinate) {
            const config = this._config;
            const index = config.getLabelIndex(this.label);

            const r = config.ratingRadialScale(this.value);
            const theta = config.labelAngularScale(index);

            this._coordinate = Coordinate.polar({ r, theta });
        }
        return this._coordinate;
    }
}

export default Datum;