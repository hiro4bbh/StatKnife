const d3 = require('d3');

Number.prototype.ceil = function() {
  return Math.ceil(this);
};
Number.prototype.floor = function() {
  return Math.floor(this);
};
Number.prototype.pow = function(y) {
  return Math.pow(this, y);
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
Array.prototype.zip = function(that) {
  return this.map((thisi, i) => [thisi, that[i]]);
};

(function*() {})().__proto__.__proto__.toArray = function() {
  return Array.from(this);
};

HTMLDocument.prototype.createElem = function(tagName) {
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
HTMLElement.prototype.createChild = function(tagName) {
  return this.appendChild(this.ownerDocument.createElem(tagName));
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
      this.createChild('td').setElem(elem);
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
    this.createChild('tr').append(column[n]);
  }
  return this;
};
HTMLTableElement.prototype.appendRow = function(row) {
  const tr = this.createChild('tr');
  for (const elem of row) {
    tr.append(elem);
  }
  return tr;
};

export default class Base {
  static onimported(StatKnife) {
    StatKnife.setDefault = this.setDefault;
  }

  static setDefault(obj, obj0) {
    const obj1 = {};
    for (const key in obj0) {
      obj1[key] = obj0[key];
    }
    for (const key in obj) {
      obj1[key] = obj[key];
    }
    return obj1;
  }
}