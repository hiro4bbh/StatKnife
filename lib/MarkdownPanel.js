const fs = require('fs');
const MarkdownIt = require('markdown-it');

export default class MarkdownPanel extends StatKnife.Panel {
  static onimported(StatKnife) {
    StatKnife.markdown = (...args) => new MarkdownPanel(...args);
  }
  constructor(...args) {
    super('Markdown Text', ...args);
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
    this.container.innerHTML = (new MarkdownIt()).render(this.text());
    return super.show();
  }
}