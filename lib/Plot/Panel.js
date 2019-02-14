import {Panel as StatKnifePanel} from '../StatKnife.js';

Symbol.all = Symbol('PlotPanel.all');
export default class Panel extends StatKnifePanel {
  static onimported(StatKnife) {
    StatKnife.importFromSystemPath('Plot/HistogramPanel');
  }
  groupBy(varname) {
    if (!this.att.hasVar(varname)) {
      throw `unknown variable: ${varname}`;
    }
    if (varname === undefined) {
      return this._groupByName;
    }
    this._groupByName = varname;
    return this;
  }

  prepare(...args) {
    this._groupBy = this.att.var(this._groupByName);
    this._groups = [];
    if (this._groupBy) {
      const groupNames = Object.keys(this._groupBy.count());
      for (const name of groupNames) {
        this._groups.push({
          name: name,
        });
      }
    } else {
      this._groups.push({name: Symbol.all});
    }
    for (const group of this._groups) {
      group.context = this.prepareGroup(group, ...args);
    }
    return this;
  }
  update(...args) {
    this.clear();
    for (const group of this._groups) {
      this.updateGroup(group, ...args);
    }
  }
}