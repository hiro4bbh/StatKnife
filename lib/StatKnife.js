'use strict';

export default class {
    constructor(window) {
        this.window = window;
    }

    sayHello() {
        console.log('hello!');
        const div = this.window.document.createElement('div');
        div.innerText = 'hello!';
        this.window.document.getElementsByTagName('body')[0].appendChild(div);
    }
}