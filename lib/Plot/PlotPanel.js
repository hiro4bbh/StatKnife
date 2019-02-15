import Panel from './Panel.js';
import {Attachment} from '../Dataset.js';

export default class PlotPanel extends Panel {
  static onimported(_) {
    Attachment.prototype.plot = function(...args) {
      return new PlotPanel(this, ...args);
    };
  }
  constructor(att, xVarname, yVarname, ...args) {
    super(`${yVarname} vs ${xVarname}`, ...args);
    this.att = att;
    if (!this.att.hasVar(xVarname)) {
      throw `unknown X variable: ${xVarname}`;
    }
    if (this.att.typeof(xVarname) != typeof(0)) {
      throw `type of X variable must be ${typeof(0)}: ${xVarname}`;
    }
    this.xVarname = xVarname;
    this.xLabel(this.xVarname);
    if (!this.att.hasVar(yVarname)) {
      throw `unknown Y variable: ${yVarname}`;
    }
    if (this.att.typeof(yVarname) != typeof(0)) {
      throw `type of Y variable must be ${typeof(0)}: ${yVarname}`;
    }
    this.yVarname = yVarname;
    this.yLabel(this.yVarname);
  }

  prepareGroup(group) {
    let xValues, yValues;
    if (group.name == Symbol.all) {
      xValues = this.att.var(this.xVarname);
      yValues = this.att.var(this.yVarname);
    } else {
      xValues = this.att.var(this.xVarname).filter((_, i) => this._groupBy[i] == group.name);
      yValues = this.att.var(this.yVarname).filter((_, i) => this._groupBy[i] == group.name);
    }
    return {values: xValues.zip(yValues)};
  }
  clear() {
    this.container.innerHTML = '';
    super.clear();
  }
}