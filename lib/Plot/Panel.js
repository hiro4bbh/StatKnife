import {Panel as StatKnifePanel} from '../StatKnife.js';

Symbol.all = Symbol('PlotPanel.all');
Symbol.index = Symbol('PlotPanel.index');
export default class Panel extends StatKnifePanel {
  static onimported(StatKnife) {
    StatKnife.importFromSystemPath('Plot/PlotPanel');
    StatKnife.importFromSystemPath('Plot/HistogramPanel');
  }
  constructor(...args) {
    super(...args);
    this.width(480).height(480);
    this._margin = {top: 24, right: 16, bottom: 48, left: 48};
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
  xRange(domain) {
    if (domain === undefined) {
      return this._xScale.domain();
    }
    this._xRange = true;
    this._xScale.domain(domain).nice();
    return this;
  }
  yRange(domain) {
    if (domain === undefined) {
      return this._yScale.domain();
    }
    this._yRange = true;
    this._yScale.domain(domain).nice();
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

  lines(data, options) {
    options = StatKnife.setDefault(options, {color: '#000000', fillColor: 'none', width: 2.0});
    if (!this.svg) {
      throw 'cannot draw lines before shown';
    }
    const line = d3.line()
      .x((d) => this._xScale(d[0]))
      .y((d) => this._yScale(d[1]));
    return this.svg.append('g').datum(data).append('path')
      .attr('d', line)
      .attr('fill', options.fillColor)
      .attr('stroke', options.color)
      .attr('stroke-width', options.width);
  }
  points(data, options) {
    options = StatKnife.setDefault(options, {fillColor: '#000000', r: 4.0, color: 'none', width: 2.0});
    if (!this.svg) {
      throw 'cannot draw lines before points';
    }
    const points = this.svg.append('g').selectAll('circle').data(data).enter().append('circle')
      .attr('cx', (d) => this._xScale(d[0]))
      .attr('cy', (d) => this._yScale(d[1]))
      .attr('fill', options.fillColor)
      .attr('r', options.r);
    if (options.color != 'none') {
      points.attr('stroke', options.color).attr('stroke-width', options.width);
    }
    return points;
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
    this._xAxisTick = this.svg.append('g')
      .attr('transform', `translate(0, ${this.height() - this.margin().bottom})`)
      .call(this._xAxis);
    this._xAxisTickLabel = this._xAxisTick.selectAll('text')
      .attr('font-size', '12pt');
    this._xAxisLabel = this._xAxisTick
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
    this._yAxisTick = this.svg.append('g')
      .attr('transform', `translate(${this.margin().left}, 0)`)
      .call(this._yAxis);
    this._yAxisTickLabel = this._yAxisTick
      .selectAll('text')
      .attr('alignment-baseline', 'text-after-edge')
      .attr('font-size', '12pt')
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('x', 0)
      .attr('y', '-0.71em');
    this._yAxisLabel = this._yAxisTick
      .append('text')
      .attr('fill', 'black')
      .attr('x', -(this.height() - this.margin().top - this.margin().bottom)/2.0 - this.margin().top)
      .attr('y', -32.0)
      .attr('transform', 'rotate(-90)')
      .attr('font-size', '12pt')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .text(this.yLabel());
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
    case 'filled-line':
      group.lines = this.lines(group.context.values, {color: group.color+'cc', fillColor: group.color+'11'});
      break;
    case 'line':
      group.lines = this.lines(group.context.values, {color: group.color+'cc', fillColor: 'none'});
      break;
    case 'point':
      group.points = this.points(group.context.values, {fillColor: group.color+'88'});
      break;
    default:
      throw `unknown plot type: ${this.type()}`;
    }
    return this;
  }

  prepare() {
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
      group.context = this.prepareGroup(group);
    }
    return this;
  }
  update() {
    this.clear();
    for (const group of this._groups) {
      this.updateGroup(group);
    }
  }
  show() {
    this.prepare();
    this.update();
    return super.show();
  }
}