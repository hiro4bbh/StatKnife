const fs = require('fs');

export class Panel {
  constructor(name, option) {
    this.option = StatKnife.setDefault(option, {show: false});
    this.doc = StatKnife.doc;
    this._id = -1;
    this.name(name);
    if (this.option.show) {
      this.show();
    }
  }
  get container() {
    if (!this._container) {
      this.controllers;
      this._container = this.panel.createChild('div').attrs({class: 'container'});
    }
    return this._container;
  }
  get controllers() {
    if (!this._controllers) {
      this.title;
      this._controllers = this.header.createChild('div').attrs({class: 'controllers'});
      this.buttonSave = this.controllers.createChild('button').setElem('Save');
      this.buttonSave.onclick = () => this.save();
    }
    return this._controllers;
  }
  get header() {
    if (!this._header) {
      this._header = this.panel.createChild('div').attrs({class: 'header'});
      this.buttons = this.header.createChild('div').attrs({class: 'buttons'});
      this.buttonRemove = this.buttons.createChild('span').addClass('button').addClass('close').addClass('vertically-middle').setElem('\u2715');
      this.buttonRemove.onclick = () => StatKnife.removePanel(this.id());
    }
    return this._header;
  }
  id(value) {
    if (value === undefined) {
      return this._id;
    }
    this._id = value;
    this.panel.setAttribute('id', this._id);
    this.updateTitle();
    return this;
  }
  name(value) {
    if (value === undefined) {
      return this._name;
    }
    this._name = value;
    this.updateTitle();
    return this;
  }
  get panel() {
    if (!this._panel) {
      this._panel = this.doc.createElem('div').attrs({class: 'panel'});
    }
    return this._panel;
  }
  get title() {
    if (!this._title) {
      this.header;
      this._title = this.header.createChild('div').attrs({class: 'title'});
    }
    return this._title;
  }
  updateTitle() {
    if (this.id() !== -1) {
      this.title.innerText = `#${this.id()}: ${this.name()}`;
    }
    return this;
  }

  show() {
    this.container;
    return StatKnife.appendPanel(this);
  }

  save() {
    console.log(`save panel #${this.id()}(${this.name()}) as HTML`);
    let htmlHeader = '<html><head>';
    for (const elem of this.doc.head.querySelectorAll('link[rel=stylesheet]')) {
      htmlHeader += `<style>${fs.readFileSync(elem.href.slice('file://'.length)).toString()}</style>`;
    }
    htmlHeader += `<title>${this.title.innerHTML}</title></head><body style="background-color: white; padding: 1em;">`;
    const htmlFooter = '</body></html>';
    const blob = new Blob([htmlHeader+this.container.innerHTML+htmlFooter], {type: 'text/html'});
    const filename = 'panel.html';
    const url = window.URL.createObjectURL(blob);
    this.doc.createElem('a').attrs({href: url, download: filename}).click();
    return this;
  }
}

export default class {
  constructor(window) {
    this.window = window;
    this.panels = {};
    this.Panel = Panel;
    this.importFromSystemPath('Base');
  }
  get container() {
    return this.doc.getElementById('container');
  }
  get doc() {
    return this.window.document;
  }

  appendPanel(panel) {
    if (panel.id() === -1) {
      let maxId = 0;
      for (const panelId in this.panels) {
        maxId = Math.max(panelId, maxId);
      }
      panel.id(maxId + 1);
      this.panels[panel.id()] = panel;
      this.container.appendChild(panel.panel);
    }
    this.doc.scrollTo(panel.panel, 500);
    return panel;
  }
  removePanel(id) {
    const panel = this.panels[id];
    if (panel) {
      delete this.panels[id];
      this.container.removeChild(panel.panel);
      if (panel.onremoved) {
        panel.onremoved();
      }
      panel.id(-1);
    }
  }
  removeAllPanels() {
    for (const id in this.panels) {
      this.removePanel(id);
    }
  }

  importFromSystemPath(name) {
    return new Promise((resolve) => {
      import(`es6://lib/${name}.js`).then(async (module) => {
        console.log(`loaded module from system path: ${name}`);
        await module.default.onimported(this);
        resolve();
      });
    });
  }
}