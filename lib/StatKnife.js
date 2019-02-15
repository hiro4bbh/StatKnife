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
HTMLElement.prototype.addClass = function(name) {
  this.classList.add(name);
  return this;
};
HTMLElement.prototype.attrs = function(attrs) {
  if (attrs === undefined) {
    return this.attributes;
  }
  for (const key in attrs) {
    this.setAttribute(key, attrs[key]);
  }
  return this;
};
HTMLElement.prototype.newChild = function(tagName) {
  return this.appendChild(this.ownerDocument.newElem(tagName));
};
HTMLElement.prototype.setElem = function(elem) {
  this.innerHTML = '';
  if (elem instanceof HTMLElement) {
    this.appendChild(elem);
  } else {
    this.innerText = elem;
  }
  return this;
};
HTMLTableRowElement.prototype.append = function(elem) {
  switch (elem.tagName) {
    case 'TD':
    case 'TH':
      this.appendChild(elem);
      break;
    default:
      this.newChild('td').setElem(elem);
  }
  return this;
};
HTMLTableElement.prototype.appendColumn = function(column) {
  let n = 0;
  for (const i in this.children) {
    const child = this.children[i];
    if (child.tagName != 'TR') {
      continue;
    }
    child.append(column[n]);
    n += 1;
  }
  for (; n < column.length; n++) {
    this.newChild('tr').append(column[n]);
  }
  return this;
};
HTMLTableElement.prototype.appendRow = function(row) {
  const tr = this.newChild('tr');
  for (const elem of row) {
    tr.append(elem);
  }
  return tr;
};

export class Panel {
  constructor(name, option) {
    this.option = setDefault(option, {show: false});
    this.doc = StatKnife.doc;
    this.panel = this.doc.newElem('div').attrs({class: 'panel'});
    this.header = this.panel.newChild('div').attrs({class: 'header'});
    this.buttons = this.header.newChild('div').attrs({class: 'buttons'});
    this.buttonDelete = this.buttons.newChild('span').addClass('button').addClass('close').addClass('vertically-middle');
    this.buttonDelete.onclick = () => StatKnife.removePanel(this.id());
    this.title = this.header.newChild('div').attrs({class: 'title'});
    this.controllers = this.header.newChild('div').attrs({class: 'controllers'});
    this.container = this.panel.newChild('div').attrs({class: 'container'});
    this.name(name);
    if (this.option.show) {
      this.show();
    }
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
  updateTitle() {
    this.title.innerText = `#${this.id()}: ${this.name()}`;
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
    panel.id(maxId + 1);
    this.panels[panel.id()] = panel;
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