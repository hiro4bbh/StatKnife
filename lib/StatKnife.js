'use strict';

class Panel {
    constructor(name) {
        this.panel = this.createElement('div', {class: 'panel'});
        this.header = this.createChildElement(this.panel, 'div', {class: 'header'});
        this.buttons = this.createChildElement(this.header, 'div', {class: 'buttons'});
        this.buttonDelete = this.createChildElement(this.buttons, 'span', {class: 'button close'});
        this.buttonDelete.onclick = () => StatKnife.removePanel(this.id);
        this.title = this.createChildElement(this.header, 'div', {class: 'title'});
        this.container = this.createChildElement(this.panel, 'div', {class: 'container'});
        this.name = name;
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

    createElement(tagName, attrs) {
        const node = StatKnife.document.createElement(tagName);
        for (const key in attrs) {
            node.setAttribute(key, attrs[key]);
        }
        return node;
    }
    createChildElement(parentNode, tagName, attrs) {
        const node = this.createElement(tagName, attrs);
        parentNode.appendChild(node);
        return node;
    }
}

class SayHelloPanel extends Panel {
    constructor() {
        console.log('hello!');
        super('Say Hello');
        const div = this.createElement('div');
        div.innerText = 'hello!';
        this.container.appendChild(div);
        StatKnife.appendPanel(this);
    }
}

export default class {
    constructor(window) {
        this.window = window;
        this.panels = {};
        this.sayHello = () => new SayHelloPanel();
    }
    get container() {
        return this.document.getElementById('container');
    }
    get document() {
        return this.window.document;
    }

    appendPanel(panel) {
        let id = 0;
        for (const panelId in this.panels) {
            id = Math.max(panelId, id);
        }
        id += 1;
        panel.id = id;
        this.panels[panel.id] = panel;
        this.container.appendChild(panel.panel);
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
}