'use strict';

const d3 = require('d3');

function setDefault(obj, obj0) {
  const obj1 = {};
  for (const key in obj0) {
    obj1[key] = obj0[key];
  }
  for (const key in obj) {
    obj1[key] = obj[key];
  }
  return obj1;
};

String.prototype.capitalizeFirst = function() {
  return this[0].toUpperCase() + this.slice(1);
};

Array.prototype.toObject = function() {
  return Array.reduce((o, kv) => {
    o[kv[0]] = o[kv[1]];
    return o;
  }, {});
};

(function*() {})().__proto__.__proto__.toArray = function() {
  return Array.from(this);
};

HTMLDocument.prototype.newElem = function(tagName) {
  return StatKnife.doc.createElement(tagName);
};
HTMLDocument.prototype.scrollTo = function(elem, dur) {
  d3.transition().duration(dur).tween('scroll', () => {
    var i = d3.interpolateNumber(this.documentElement.scrollTop, elem.offsetTop);
    return (t) => scrollTo(0, i(t));
  });
};
HTMLElement.prototype.newChild = function(tagName) {
  return this.appendChild(this.ownerDocument.newElem(tagName));
};
HTMLElement.prototype.setAttrs = function(attrs) {
  for (const key in attrs) {
    this.setAttribute(key, attrs[key]);
  }
  return this;
};
HTMLElement.prototype.setElem = function(elem) {
  this.innerHTML = '';
  if (elem instanceof HTMLElement) {
    this.appendChild(elem);
  } else {
    this.innerText = elem;
  }
  return this;
}
HTMLTableElement.prototype.appendRow = function(row) {
  const tr = this.newChild('tr');
  for (const elem of row) {
    if (elem.tagName == 'TH') {
      tr.appendChild(elem);
    } else {
      tr.newChild('td').setElem(elem);
    }
  }
  return tr;
}

export class Panel {
  constructor(name, option) {
    this.option = setDefault(option, {show: false});
    this.doc = StatKnife.doc;
    this.panel = this.doc.newElem('div').setAttrs({class: 'panel'});
    this.header = this.panel.newChild('div').setAttrs({class: 'header'});
    this.buttons = this.header.newChild('div').setAttrs({class: 'buttons'});
    this.buttonDelete = this.buttons.newChild('span').setAttrs({class: 'button close'});
    this.buttonDelete.onclick = () => StatKnife.removePanel(this.id);
    this.title = this.header.newChild('div').setAttrs({class: 'title'});
    this.container = this.panel.newChild('div').setAttrs({class: 'container'});
    this.name = name;
    if (this.option.show) {
      this.show();
    }
  }
  get id() {
    return this._id;
  }
  set id(value) {
    this._id = value;
    this.panel.setAttribute('id', this.id);
    this.updateTitle();
  }
  get name() {
    return this._name;
  }
  set name(value) {
    this._name = value;
    this.updateTitle();
  }
  updateTitle() {
    this.title.innerText = `#${this.id}: ${this.name}`;
  }
  show() {
    return StatKnife.appendPanel(this);
  }
}

export default class {
  constructor(window) {
    this.window = window;
    this.panels = {};
    this.Panel = Panel;
  }
  get container() {
    return this.doc.getElementById('container');
  }
  get doc() {
    return this.window.document;
  }

  appendPanel(panel) {
    let maxId = 0;
    for (const panelId in this.panels) {
      maxId = Math.max(panelId, maxId);
    }
    panel.id = maxId + 1;
    this.panels[panel.id] = panel;
    this.container.appendChild(panel.panel);
    this.doc.scrollTo(panel.panel, 500);
    return panel;
  }
  removePanel(id) {
    const panel = this.panels[id];
    if (panel) {
      delete this.panels[id];
      this.container.removeChild(panel.panel);
      if (panel.ondelete) {
        panel.ondelete();
      }
    }
  }
  removeAllPanels() {
    for (const id in this.panels) {
      this.removePanel(id);
    }
  }

  importFromSystemPath(name) {
    import(`es6://lib/${name}.js`).then((module) => {
      console.log(`loaded module from system path: ${name}`);
      module.default.onimported(this);
    });
  }
}