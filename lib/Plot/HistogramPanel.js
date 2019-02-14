const d3 = require('d3');
import Panel from './Panel.js';
import {Attachment} from '../Dataset.js';

export default class HistogramPanel extends Panel {
  static onimported(_) {
    Attachment.prototype.histogram = function(...args) {
      return new HistogramPanel(this, ...args);
    };
  }
  constructor(att, varname, ...args) {
    super(`Histogram of ${varname}`, ...args);
    this.att = att;
    if (!this.att.hasVar(varname)) {
      throw `unknown variable: ${varname}`;
    }
    if (this.att.typeof(varname) != typeof(0)) {
      throw `type of variable must be ${typeof(0)}: ${varname}`;
    }
    this.varname = varname;
    this.d3 = d3.histogram();
    this.modeSelector = this.controllers.newChild('select');
    this.modeSelector.newChild('option').attrs({value: 'table'}).setElem('Table');
  }
  range(...config) {
    if (config === undefined) {
      throw 'UNIMPLEMENTED';
    }
    this._range = true;
    this.d3.domain(...config);
    return this;
  }
  thresholds(...config) {
    if (config === undefined) {
      throw 'UNIMPLEMENTED';
    }
    this._thresholds = true;
    this.d3.thresholds(...config);
    return this;
  }

  prepare(...args) {
    if (!this._range) {
      const values = this.att.var(this.varname);
      this.range([values.min(), values.max()]);
    }
    if (!this._thresholds) {
      const values = this.att.var(this.varname);
      this.thresholds(d3.thresholdSturges(values));
    }
    return super.prepare(...args);
  }
  prepareGroup(group) {
    if (group.name == Symbol.all) {
      group.values = this.att.var(this.varname);
    } else {
      group.values = this.att.var(this.varname).filter((_, i) => this._groupBy[i] == group.name);
    }
    return this.d3(group.values);
  }
  clear() {
    const mode = this.modeSelector.value;
    switch (mode) {
    case 'table':
      this.table = this.container.newChild('table');
      this.table.appendColumn([this.doc.newElem('th').setElem('Range')].concat(
        this.d3([]).map((bucket) => this.doc.newElem('th').setElem(`${bucket.x0.toPrecision(3)} - ${bucket.x1.toPrecision(3)}`)),
      ));
      break;
    default:
      throw `unknown mode: ${mode}`;
    }
  }
  updateGroup(group) {
    const mode = this.modeSelector.value;
    switch (mode) {
    case 'table':
      const column = [this.doc.newElem('th').setElem(group.name == Symbol.all ? 'All' : group.name)];
      for (const bucket of group.context) {
        const cell = this.doc.newElem('td').attrs({class: 'right'}).setElem(bucket.length);
        if (bucket.length == 0) {
          cell.addClass('ellipsis');
        }
        column.push(cell);
      }
      this.table.appendColumn(column);
      break;
    default:
      throw `unknown mode: ${mode}`;
    }
    return this;
  }
  show() {
    this.prepare();
    this.update();
    return super.show();
  }
}