const fs = require('fs');
const d3 = require('d3');
import {Panel} from './StatKnife.js';

Array.prototype.typename = function(newtypename) {
  if (newtypename === undefined) {
    const typeset = this.count((x) => typeof(x));
    if (Object.keys(typeset).length == 1) {
      return Object.keys(typeset)[0];
    }
    return typeof('string');
  }
  throw 'cannot change type of Array';
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
Array.prototype.sum = function() {
  let s = 0.0;
  for (let i = 0; i < this.length; i++) {
    s += this[i];
  }
  return s;
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
    this.summaryHeader = this.container.createChild('div').attrs({'class': 'header'});
    this.summaryHeader.setElem(`length=${this.data.length}, type=${this.typename}`);
    this.summaryTable = this.container.createChild('table');
    const hdrrow = this.summaryTable.createChild('tr');
    for (const key in this.table) {
      hdrrow.createChild('th').setElem(key);
    }
    const valrow = this.summaryTable.createChild('tr');
    for (let value of Object.values(this.table)) {
      if (this.typename == typeof(0) && typeof(value) == typeof(0)) {
        value = value.toPrecision(3);
      }
      valrow.createChild('td').attrs({class: 'center'}).setElem(value);
    }
  }
  get typename() {
    return this.data.typename();
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

Float32Array.prototype.typename = Float64Array.prototype.typename =
Int8Array.prototype.typename = Int16Array.prototype.typename = Int32Array.prototype.typename =
Uint8Array.prototype.typename = Uint16Array.prototype.typename = Uint32Array.prototype.typename =
function() {
  return 'number';
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
  typeof(colname) {
    return this.column(colname).typename();
  }

  filter(cond) {
    const selected = [];
    if (typeof(cond) == typeof([])) {
      for (const id of cond) {
        if (0 <= id && id < this.nrow) {
          selected.push(this[id]);
        }
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
    this.tableHeader = this.container.createChild('div').attrs({'class': 'header'});
    this.tableHeader.setElem(`ncol=${this.tbl.ncol}, nrow=${this.tbl.nrow}`);
    this.tableContent = this.container.createChild('table');
    const colhdr = this.tableContent.appendRow([this.doc.createElem('th').setElem('#')]);
    for (const colname of this.tbl.colnames) {
       colhdr.createChild('th').setElem(colname);
    }
    this.tbl.forEachRow((row) => {
      const rowdata = [this.doc.createElem('th').setElem(row[Symbol.rowid])];
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
    this.summaryHeader = this.container.createChild('div').attrs({'class': 'header'});
    this.summaryHeader.setElem(`ncol=${this.tbl.ncol}, nrow=${this.tbl.nrow}`);
    this.summaryTable = this.container.createChild('table');
    for (const colname of this.tbl.colnames) {
      this.summaryTable.appendRow([
        this.doc.createElem('th').setElem(colname),
        this.tbl.column(colname).summary().container
      ]);
    }
  }
}

export class Attachment {}

export class AttachedArray extends Attachment {
  constructor(arr) {
    super()
    this.arr = arr;
  }

  hasVar(name) {
    return name == 'value';
  }
  typeof(name) {
    return this.var(name).typename();
  }
  var(name) {
    return name == 'value' ? this.arr : null;
  }
}

export class AttachedTable extends Attachment {
  constructor(tbl) {
    super()
    this.tbl = tbl;
  }

  hasVar(name) {
    return this.tbl.colnames.find((colname) => colname == name);
  }
  typeof(name) {
    return this.tbl.typeof(name);
  }
  var(name) {
    return this.tbl.column(name);
  }
}

export default class DataSet {
  static onimported(StatKnife) {
    StatKnife.DataSet = {
      createTable: this.createTable,
      readCSV: this.readCSV,
      readIris: this.readIris,
    };
    StatKnife.attach = this.attach;
    StatKnife.seq = this.seq;
  }

  static seq(min, sup) {
    return Array.from((new Array(sup - min)).keys(), (_, i) => min + i);
  }

  static createTable(...args) {
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

  static attach(env) {
    if (env instanceof Table) {
      return new AttachedTable(env);
    } else if (env instanceof Array || env instanceof Uint8Array.prototype.__proto__.constructor) {
      return new AttachedArray(env);
    }
    throw `cannot attach ${env.constructor.name}`;
  }

  static readIris() {
    return this.readCSV('iris', 'data/iris.csv');
  }
}