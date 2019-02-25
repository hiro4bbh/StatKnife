const fs = require('fs');
const mdit = require('markdown-it');

export default class MarkdownPanel extends StatKnife.Panel {
  static onimported(StatKnife) {
    StatKnife.markdown = (...args) => new MarkdownPanel(...args);
  }
  constructor(...args) {
    super(...args);
    this.name('Markdown Text');
    this.text('');
  }
  text(value) {
    if (value === undefined) {
      return this._text;
    }
    this._text = value;
    return this;
  }
  textFromFile(path) {
    this.name(path);
    return this.text(fs.readFileSync(path).toString());
  }

  show() {
    this.container.innerHTML = mdit().render(this.text());
    return super.show();
  }
}