const fs = require('fs');
import {Panel} from './StatKnife.js';

export class TableSummary extends Panel {
    constructor(tbl) {
        super(`Summary of Table ${tbl.name}`);
        this.container.innerText = `ncol=${tbl.ncol}, nrow=${tbl.nrow}, colnames=(${tbl.colnames})`;
    }
}

export class Column {
    constructor(name, tbl) {
        this.name = name;
        this.tbl = tbl;
        this.cells = [];
    }
    get length() {
        return this.cells.length;
    }

    append(value) {
        this.cells.push(value);
    }
}

export class Table {
    constructor(name, colnames) {
        this.name = name;
        this.columns = {};
        for (const colname of colnames) {
            this.columns[colname] = new Column(colname, this);
        }
    }
    get ncol() {
        return Object.keys(this.columns).length;
    }
    get nrow() {
        return this.ncol > 0 ? this.columns[Object.keys(this.columns)[0]].length : 0;
    }
    get colnames() {
        return Object.values(this.columns).map((column) => column.name);
    }
    appendRow(row) {
        if (row.length != this.ncol) {
            throw new Exception(`expected ${this.ncol} columns but got ${row.length} columns`);
        }
        for (const colid in row) {
            this.columns[Object.keys(this.columns)[colid]].append(row[colid]);
        }
    }

    summary() {
        return StatKnife.appendPanel(new TableSummary(this));
    }
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
        const lines = data.split("\n");
        const headerLine = lines.shift();
        const colnames = headerLine.split(',').map((colname) => JSON.parse(colname));
        const tbl = this.newTable(name, colnames);
        for (let line of lines) {
            line = line.trim();
            if (line == '') {
                continue;
            }
            const row = line.split(',').map((s) => JSON.parse(s));
            tbl.appendRow(row);
        }
        return tbl;
    }

    static readIris() {
        return this.readCSV('iris', 'data/iris.csv');
    }
}