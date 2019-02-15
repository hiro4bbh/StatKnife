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
    this.xLabel(this.varname);
    this.yLabel('Frequency');
    this.d3 = d3.histogram();
    this.modeSelector = this.controllers.newChild('select').addClass('vertically-middle');
    this.modeSelector.newChild('option').attrs({value: 'table'}).setElem('Table');
    this.modeSelector.newChild('option').attrs({value: 'plot', selected: ''}).setElem('Plot');
    this.modeSelector.onchange = () => this.show();
  }
  xRange(...config) {
    if (config === undefined) {
      throw 'UNIMPLEMENTED';
    }
    this.d3.domain(...config);
    super.xRange(...config);
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

  prepareGroup(group) {
    const mode = this.modeSelector.value;
    let hist;
    if (group.name == Symbol.all) {
      hist = this.d3(this.att.var(this.varname));
    } else {
      hist = this.d3(this.att.var(this.varname).filter((_, i) => this._groupBy[i] == group.name));
    }
    switch (mode) {
    case 'table':
      return hist;
    case 'plot':
      const values = Object.values(hist).map((bucket) => [[bucket.x0, bucket.length], [bucket.x1, bucket.length]]).flat(1);
      if (hist.length > 0) {
        values.unshift([hist[0].x0, 0]);
        values.push([hist[hist.length-1].x1, 0]);
      }
      return {values: values};
    default:
      throw `unknown mode: ${mode}`;
    }
  }
  clear() {
    this.container.innerHTML = '';
    const mode = this.modeSelector.value;
    switch (mode) {
    case 'table':
      this.table = this.container.newChild('table');
      this.table.appendColumn([this.doc.newElem('th').setElem('Range')].concat(
        this.d3([]).map((bucket) => this.doc.newElem('th').setElem(`${bucket.x0.toPrecision(3)} - ${bucket.x1.toPrecision(3)}`)),
      ));
      break;
    case 'plot':
      super.clear();
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
        const cell = this.doc.newElem('td').addClass('right').setElem(bucket.length);
        if (bucket.length == 0) {
          cell.addClass('ellipsis');
        }
        column.push(cell);
      }
      this.table.appendColumn(column);
      break;
    case 'plot':
      this.type('line');
      super.updateGroup(group);
      break;
    default:
      throw `unknown mode: ${mode}`;
    }
    return this;
  }

  prepare(...args) {
    if (!this._xRange) {
      const values = this.att.var(this.varname);
      this.xRange([values.min(), values.max()]);
    }
  if (!this._thresholds) {
      const values = this.att.var(this.varname);
      this.thresholds(d3.thresholdSturges(values));
    }
    return super.prepare(...args);
  }
}