const fs = require('fs');
const d3 = require('d3');
import {Panel} from './StatKnife.js';

Number.prototype.ceil = function() {
  return Math.ceil(this);
};
Number.prototype.floor = function() {
  return Math.floor(this);
};

Array.prototype.max = function() {
  return Math.max(...this);
};
Array.prototype.mean = function() {
  let s = 0;
  for (const x of this) {
    s += x;
  }
  return s/this.length;
};
Array.prototype.min = function() {
  return Math.min(...this);
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

export class ArraySummaryPanel extends Panel {
  constructor(data, ...args) {
    super('Summary of Array', ...args);
    this.data = data;
    this.name = `Summary of ${this.typename.capitalizeFirst()} Array`;
    this.summaryHeader = this.container.newChild('div').setAttrs({'class': 'header'}).setElem(this.typename);
    this.summaryTable = this.container.newChild('table');
    const hdrrow = this.summaryTable.newChild('tr');
    console.log(this.table);
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
          'Mean': this.data.mean(),
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

export class TableSummaryPanel extends Panel {
  constructor(tbl, ...args) {
    super(`Summary of Table ${tbl.name}`);
    this.summaryHeader = this.container.newChild('div').setAttrs({'class': 'header'});
    this.summaryHeader.setElem(`ncol=${tbl.ncol}, nrow=${tbl.nrow}`);
    this.summaryTable = this.container.newChild('table');
    for (const colname of tbl.colnames) {
      this.summaryTable.appendRow([
        this.doc.newElem('th').setElem(colname),
        tbl.column(colname).summary().container
      ]);
    }
  }
}

Array.prototype.toTable = function (name) {
  const self = this;
  delete this.columns;
  this.name = name;
  Object.defineProperty(this, 'ncol', {
    get: () => this.colnames.length,
  });
  Object.defineProperty(this, 'nrow', {
    get: () => this.length,
  });
  this.colnames = [];
  if (this.nrow > 0) {
    this.colnames = Object.keys(this[0]);
  }
  this.column = (colname) => {
    if (this.colnames.find((x) => x == colname)) {
      return (function*() {
        for (const row of self) {
          yield row[colname];
        }
      })();
    }
    return null;
  };
  this.summary = (...args) => new TableSummaryPanel(this, ...args);
  return this;
};

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