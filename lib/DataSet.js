const fs = require('fs');
const d3 = require('d3');
import {Panel} from './StatKnife.js';

export class TableSummary extends Panel {
    constructor(tbl) {
        super(`Summary of Table ${tbl.name}`);
        this.container.innerText = `ncol=${tbl.ncol}, nrow=${tbl.nrow}, colnames=(${tbl.colnames})`;
    }
}

Array.prototype.toTable = function (name) {
    this.name = name;
    Object.defineProperty(this, 'ncol', {
        get: () => this.colnames.length,
    });
    Object.defineProperty(this, 'nrow', {
        get: () => this.length,
    });
    Object.defineProperty(this, 'colnames', {
        get: () => this.columns,
    });
    this.summary = () => StatKnife.appendPanel(new TableSummary(this));
    return this;
}

export default class DataSet {
    static onimported(StatKnife) {
        StatKnife.DataSet = {
            newTable: this.newTable,
            readCSV: this.readCSV,
            readIris: this.readIris,
        };
    }

    static newTable(...args) {
        return new Table(...args);
    }
    static readCSV(name, path) {
        const data = fs.readFileSync(path).toString();
        return d3.csvParse(data, (d) => {
            return {
                SepalLength: +d['Sepal.Length'],
                SepalWidth: +d['Sepal.Width'],
                PetalLength: +d['Petal.Length'],
                PetalWidth: +d['Petal.Width'],
                Species: d['Species'],
            }
        }).toTable(name);
    }

    static readIris() {
        return this.readCSV('iris', 'data/iris.csv');
    }
}