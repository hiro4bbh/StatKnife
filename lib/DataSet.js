const fs = require('fs');
const d3 = require('d3');
import {Panel} from './StatKnife.js';

Number.prototype.ceil = function() {
  return Math.ceil(this);
};
Number.prototype.floor = function() {
  return Math.floor(this);
};
Number.prototype.pow = function(y) {
  return Math.pow(this, y);
};

Array.prototype.max = function() {
  return Math.max(...this);
};
Array.prototype.mean = function() {
  return this.moment(1);
};
Array.prototype.min = function() {
  return Math.min(...this);
};
Array.prototype.moment = function(order) {
  let s = 0;
  for (const x of this) {
    s += x.pow(order);
  }
  return s/this.length;
};
Array.prototype.quantiles = function(ps) {
  const s = (new Array(...this)).sort();
  const n = s.length;
  const qs = {};
  for (const p of ps) {
    const i = (p*(n-1)).floor(), j = (p*(n-1)).ceil();
    const t = p*(n-1) - i;
    qs[p] = (1-t)*s[i] + t*s[j];
  }
  return qs;
};
Array.prototype.sd = function() {
  return Math.sqrt(this.var());
};
Array.prototype.var = function() {
  if (this.length <= 1) {
    return NaN;
  }
  const mean = this.mean();
  let s = 0;
  for (const x of this) {
    s += (x - mean).pow(2);
  }
  return s/(this.length - 1);
};

export class ArraySummaryPanel extends Panel {
  constructor(data, ...args) {
    super('Summary of Array', ...args);
    this.data = data;
    this.name = `Summary of ${this.typename.capitalizeFirst()}Array`;
    this.summaryHeader = this.container.newChild('div').attrs({'class': 'header'});
    this.summaryHeader.setElem(`length=${this.data.length}, type=${this.typename}`);
    this.summaryTable = this.container.newChild('table');
    const hdrrow = this.summaryTable.newChild('tr');
    for (const key in this.table) {
      hdrrow.newChild('th').setElem(key);
    }
    const valrow = this.summaryTable.newChild('tr');
    for (let value of Object.values(this.table)) {
      if (this.typename == typeof(0) && typeof(value) == typeof(0)) {
        value = value.toPrecision(3);
      }
      valrow.newChild('td').setElem(value);
    }
  }
  get typename() {
    if (!this._typename) {
      const typeset = this.data.count((x) => typeof(x));
      if (Object.keys(typeset).length == 1) {
        this._typename = Object.keys(typeset)[0];
      } else {
        this._typename = typeof('string');
      }
    }
    return this._typename;
  }
  get table() {
    if (!this._table) {
      if (this.typename == typeof(0)) {
        const qs = this.data.quantiles([0.00, 0.25, 0.50, 0.75, 1.00]);
        this._table = {
          'Min.': qs[0.00], '1st Qu.': qs[0.25], 'Median': qs[0.50], '3rd Qu.': qs[0.75], 'Max.': qs[1.00],
          'Mean': this.data.mean(), 'S.D.': this.data.sd(),
        };
      } else {
        this._table = this.data.count();
      }
    }
    return this._table;
  }
}

Array.prototype.count = function(cb) {
  if (cb == null) {
    cb = (x) => x;
  }
  const set = {};
  for (const entry of this) {
    const key = cb(entry);
    set[key] = (set[key] || 0) + 1;
  }
  return Object.keys(set).map((k) => [k, set[k]]).sort((a, b) => {
    if (a[1] < b[1]) {
      return 1;
    } else if (a[1] > b[1]) {
      return -1;
    } else if (a[0] < b[0]) {
      return -1;
    } else if (a[0] > b[0]) {
      return 1;
    }
    return 0;
  }).reduce((o, p) => {
    o[p[0]] = p[1];
    return o;
  }, {});
};

Array.prototype.summary = function(...args) {
  return new ArraySummaryPanel(this, ...args);
};
(function*() {})().__proto__.__proto__.summary = function(...args) {
  return this.toArray().summary(...args);
};

Symbol.rowid = Symbol('Table.rowid');
export class Table extends Array {
  constructor(...args) {
    console.log(...args);
    throw 'UNIMPLEMENTED';
  }
  get ncol() {
    return this.colnames.length;
  }
  get nrow() {
    return this.length;
  }
  column(colname) {
    const self = this;
    if (typeof(colname) == typeof(0) && 0 <= colname && colname < this.ncol) {
      colname = this.colnames[colname];
    } else if (!this.colnames.find((x) => x == colname)) {
      return null;
    }
    const arr = [];
    for (const row of self) {
      arr.push(row[colname]);
    }
    return arr;
  }

  filter(cond) {
    const selected = [];
    if (typeof(cond) == typeof([])) {
      for (const id of cond) {
        selected.push(this[id]);
      }
    } else {
      for (const row of this) {
        if (cond(row)) {
          selected.push(row);
        }
      }
    }
    return selected.toTable(this.name);
  }
  forEachRow(cb) {
    for (let i = 0; i < this.nrow; i++) {
      cb(this[i], i);
    }
  }
  show() {
    return new TablePanel(this, {show: true});
  }
  summary(...args) {
    return new TableSummaryPanel(this, ...args);
  }
}

Array.prototype.toTable = function (name) {
  delete this.columns;
  this.__proto__ = Table.prototype;
  this.name = name;
  this.colnames = this.nrow > 0 ? Object.keys(this[0]) : [];
  this.colnames = this.colnames
  this.forEachRow((row, i) => {
    if (row[Symbol.rowid] === undefined) {
      row[Symbol.rowid] = i;
    }
  });
  return this;
};

export class TablePanel extends Panel {
  constructor(tbl, ...args) {
    super(`Table ${tbl.name}`, ...args);
    this.tbl = tbl;
    this.tableHeader = this.container.newChild('div').attrs({'class': 'header'});
    this.tableHeader.setElem(`ncol=${this.tbl.ncol}, nrow=${this.tbl.nrow}`);
    this.tableContent = this.container.newChild('table');
    const colhdr = this.tableContent.appendRow([this.doc.newElem('th').setElem('#')]);
    for (const colname of this.tbl.colnames) {
       colhdr.newChild('th').setElem(colname);
    }
    this.tbl.forEachRow((row) => {
      const rowdata = [this.doc.newElem('th').setElem(row[Symbol.rowid])];
      for (const colname of Object.keys(row)) {
        rowdata.push(row[colname]);
      }
      this.tableContent.appendRow(rowdata);
    });
  }
}

export class TableSummaryPanel extends Panel {
  constructor(tbl, ...args) {
    super(`Summary of Table ${tbl.name}`, ...args);
    this.tbl = tbl;
    this.summaryHeader = this.container.newChild('div').attrs({'class': 'header'});
    this.summaryHeader.setElem(`ncol=${this.tbl.ncol}, nrow=${this.tbl.nrow}`);
    this.summaryTable = this.container.newChild('table');
    for (const colname of this.tbl.colnames) {
      this.summaryTable.appendRow([
        this.doc.newElem('th').setElem(colname),
        this.tbl.column(colname).summary().container
      ]);
    }
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