export default class CanvasPanel extends StatKnife.Panel {
  static onimported(StatKnife) {
    StatKnife.CanvasPanel = CanvasPanel;
  }
  constructor(...args) {
    super('Canvas', ...args);
    this.xScale(StatKnife.window.devicePixelRatio).yScale(StatKnife.window.devicePixelRatio);
    this.width(480).height(480);
    this.canvas = this.container.createChild('canvas');
  }
  get context() {
    return this.canvas.getContext('2d');
  }
  xScale(scale) {
    if (scale === undefined) {
      return this._xScale;
    }
    this._xScale = scale;
    return this;
  }
  yScale(scale) {
    if (scale === undefined) {
      return this._yScale;
    }
    this._yScale = scale;
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

  clear() {
    this.canvas.attrs({width: this.xScale()*this.width(), height: this.yScale()*this.height()})
      .css({width: `${this.width()}px`, height: `${this.height()}px`});
    this.context.scale(this.xScale(), this.yScale());
    return this;
  }
  show() {
    this.clear();
    return super.show();
  }

  save() {
    if (this.container.children.length == 1 && this.container.children[0].tagName == 'CANVAS') {
      console.log(`save panel #${this.id()}(${this.name()}) as PNG`);
      const canvas = this.container.children[0];
      const filename = 'panel.png';
      const url = canvas.toDataURL('image/png');
      this.doc.createElem('a').attrs({href: url, download: filename}).click();
      return this;
    }
    return super.save();
  }
}