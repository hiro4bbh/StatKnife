import {Panel as StatKnifePanel} from '../StatKnife.js';

Symbol.all = Symbol('PlotPanel.all');
Symbol.index = Symbol('PlotPanel.index');
export default class Panel extends StatKnifePanel {
  static onimported(StatKnife) {
    StatKnife.importFromSystemPath('Plot/HistogramPanel');
    StatKnife.importFromSystemPath('Plot/PlotPanel');
  }
  constructor(...args) {
    super(...args);
    this.width(480).height(480);
    this._margin = {top: 8, right: 8, bottom: 48, left: 64};
    this._xScale = d3.scaleLinear();
    this._yScale = d3.scaleLinear();
    this.xLabel('X').yLabel('Y');
    this.type('point');
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
  height(config) {
    if (config === undefined) {
      return this._height;
    }
    this._height = config;
    return this;
  }
  width(config) {
    if (config === undefined) {
      return this._width;
    }
    this._width = config;
    return this;
  }
  margin(config) {
    if (config === undefined) {
      return this._margin;
    }
    this._margin = Object.assign(this._margin, config);
    return this;
  }
  xRange(...config) {
    if (config === undefined) {
      throw 'UNIMPLEMENTED';
    }
    this._xRange = true;
    this._xScale.domain(...config).nice();
    return this;
  }
  yRange(...config) {
    if (config === undefined) {
      throw 'UNIMPLEMENTED';
    }
    this._yRange = true;
    this._yScale.domain(...config).nice();
    return this;
  }
  xLabel(config) {
    if (config === undefined) {
      return this._xLabel;
    }
    this._xLabel = config;
    return this;
  }
  yLabel(config) {
    if (config === undefined) {
      return this._yLabel;
    }
    this._yLabel = config;
    return this;
  }
  type(config) {
    if (config === undefined) {
      return this._type;
    }
    this._type = config;
    return this;
  }
  legend(config) {
    if (config === undefined) {
      return this._legend;
    }
    this._legend = config;
    return this;
  }

  clear() {
    this.svg = d3.select(this.container).append('svg')
      .attr('width', this.width())
      .attr('height', this.height());
      if (this._legend === undefined && this._groups.length >= 2) {
        this.legend({position: 'marginRight'});
      }
      if (this._legend) {
      switch (this._legend.position) {
      case 'marginRight':
        this.svg.attr('width', this.width() + 128);
        break;
      default:
        throw `unknown legend position: ${this._legend.position}`;
      }
    }
    if (!this._xRange) {
      let xmin = +Infinity, xmax = -Infinity;
      for (const group of this._groups) {
        xmin = Math.min(xmin, ...group.context.values.map((x) => x[0]));
        xmax = Math.max(xmax, ...group.context.values.map((x) => x[0]));
      }
      this.xRange([xmin, xmax]);
    }
    this._xScale.range([this.margin().left, this.width() - this.margin().right]);
    this._xAxis = d3.axisBottom(this._xScale);
    this.svg.append('title').text(this.name());
    this.svg.append('g')
      .attr('transform', `translate(0, ${this.height() - this.margin().bottom})`)
      .call(this._xAxis)
      .append('text')
      .attr('fill', 'black')
      .attr('x', (this.width() - this.margin().left - this.margin().right)/2.0 + this.margin().left)
      .attr('y', 40.0)
      .attr('font-size', '12pt')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .text(this.xLabel());
    if (!this._yRange) {
      let ymin = +Infinity, ymax = -Infinity;
      for (const group of this._groups) {
        ymin = Math.min(ymin, ...group.context.values.map((x) => x[1]));
        ymax = Math.max(ymax, ...group.context.values.map((x) => x[1]));
      }
      this.yRange([ymin, ymax]);
    }
    this._yScale.range([this.height() - this.margin().bottom, this.margin().top]);
    this._yAxis = d3.axisLeft(this._yScale);
    this.svg.append('g')
      .attr('transform', `translate(${this.margin().left}, 0)`)
      .call(this._yAxis)
      .append('text')
      .attr('fill', 'black')
      .attr('x', -(this.height() - this.margin().top - this.margin().bottom)/2.0 - this.margin().top)
      .attr('y', -40.0)
      .attr('transform', 'rotate(-90)')
      .attr('font-size', '12pt')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .text(this.yLabel());
    this.svg.selectAll('.tick').attr('font-size', '12pt');
    if (this._legend) {
      switch (this._legend.position) {
      case 'marginRight':
        this.legendBox = this.svg.append('g')
          .attr('transform', `translate(${this.width()}, ${this.margin().top + 8})`);
        this.legend = this.legendBox.selectAll('text').data(this._groups).enter();
        this.legendText = this.legend.append('text')
          .attr('x', 32)
          .attr('y', (_, i) => i*16)
          .attr('font-size', '12pt')
          .attr('alignment-baseline', 'middle')
          .attr('fill', (d) => d.color)
          .text((d) => d.name == Symbol.all ? 'All' : d.name.toString());
        this.legendMark = this.legend.append('circle')
          .attr('cx', 16)
          .attr('cy', (_, i) => i*16)
          .attr('fill', (d) => d.color)
          .attr('r', 4.0);
        break;
      default:
        throw `unknown legend position: ${this._legend.position}`;
      }
    }
    return this;
   }
  updateGroup(group) {
    switch (this.type()) {
    case 'line':
    case 'filled-line':
      group.line = d3.line()
        .x((d) => this._xScale(d[0]))
        .y((d) => this._yScale(d[1]));
      group.lines = this.svg.append('path')
        .datum(group.context.values)
        .attr('d', group.line)
        .attr('fill', this.type() == 'filled-line' ? group.color+'11' : 'none')
        .attr('stroke', group.color+'cc')
        .attr('stroke-width', 2.0);
      break;
    case 'point':
      group.points = this.svg.append('g')
        .selectAll('circle')
        .data(group.context.values)
        .enter()
        .append('circle')
        .attr('cx', (d) => this._xScale(d[0]))
        .attr('cy', (d) => this._yScale(d[1]))
        .attr('fill', group.color+'88')
        .attr('r', 4.0);
      break;
    default:
      throw `unknown plot type: ${this.type()}`;
    }
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
          color: d3.schemeCategory10[this._groups.length%10],
        });
      }
    } else {
      this._groups.push({name: Symbol.all, color: '#000000'});
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
  show() {
    this.prepare();
    this.update();
    return super.show();
  }
}