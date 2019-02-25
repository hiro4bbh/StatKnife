const fs = require('fs');
const MarkdownIt = require('markdown-it')({
  highlight: function (content, lang) {
    if (lang && lang == 'katex') {
      return katex.renderToString(content, {displayMode: true, throwOnError: false});
    }
    // Use the external default escaping.
    return '';
  },
});
const katex = require('katex');

function mditInlineKatex(state, silent) {
  // Find the region enclosed with `$`.
  const startp = state.pos, posMax = state.posMax;
  if (state.src.charAt(startp) != '$') {
    return false;
  }
  if (silent) {
    return false;
  }
  if (startp + 2 >= posMax) {
    return false;
  }
  let found = false;
  state.pos = startp + 1;
  while (state.pos < posMax) {
    if (state.src.charAt(state.pos) == '$') {
      found = true;
      break;
    }
    state.md.inline.skipToken(state);
  }
  if (!found || startp + 1 == state.pos) {
    state.pos = startp;
    return false;
  }
  const content = state.src.slice(startp+1, state.pos);
  // Interpret the content.
  state.posMax = state.pos;
  state.pos = startp + 1;
  let token = state.push('html_inline', 'html', 0);
  token.markup  = '$';
  token.content = katex.renderToString(content, {throwOnError: false});
  state.pos = state.posMax + 1;
  state.posMax = posMax;
  return true;
}

MarkdownIt.use((mdit) => mdit.inline.ruler.after('text', 'katex', mditInlineKatex));

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
    this.container.innerHTML = MarkdownIt.render(this.text());
    return super.show();
  }
}