# StatKnife - A Convenient Knife for Statistical Operations

Copyright 2019- Tatsuhiro Aoshima (hiro4bbh@gmail.com).

## Introduction

StatKnife is a convenient knife for statistical operations.
It will also provide many features supported by modern Web browsers in many development environments.

## Features

- Use the interactive JavaScript (ES6) console on [Electron](https://electronjs.org/)
- Implement the simple panel manager for summaries or plots
- Save the contents of a panel in HTML/SVG/PNG
- Support the simple data manipulations
- Support the simple random number generators
- Load the user configuration script at `$HOME/.StatKnife/init.js`

## Showcases

```js
iris = StatKnife.DataSet.readIris()
iris.summary().show()
iris.filter([0, 50, 100]).show()
StatKnife.attach(iris).histogram('SepalLength').groupBy('Species').show()
StatKnife.attach(iris).plot('SepalWidth', 'SepalLength').groupBy('Species').show()
```

![screenshot 1](doc/res/screenshot1.png "screenshot 1")
![screenshot 2](doc/res/screenshot2.png "screenshot 2")
![screenshot 3](doc/res/screenshot3.png "screenshot 3")
![screenshot 4](doc/res/screenshot4.png "screenshot 4")

```js
dice = new StatKnife.Dice(20190216)
sampleNorm = Array(100000).fill(0.0).map((_, i) => dice.uniformDist()())
StatKnife.attach(sampleNorm).histogram('value').thresholds(100).show()
```

![screenshot 5](doc/res/screenshot5.png "screenshot 5")

```js
canvas = (new StatKnife.CanvasPanel()).show()
canvas.context.fillStyle = '#ff000088'; canvas.context.fillRect(50, 50, 250, 250)
canvas.context.fillStyle = '#0000ff88'; canvas.context.fillRect(200, 200, 250, 250)
```

![screenshot 6](doc/res/screenshot6.png "screenshot 6")

## Installation and Development

The latest macOS is recommended for installing and developing StatKnife.

### Preparation

Install [node.js](https://nodejs.org/), then install [Electron](https://electronjs.org/) globally in your terminal as follows:

```
$ npm -g install electron
```

### Install StatKnife

Download StatKnife in your terminal as follows:

```
$ git clone https://github.com/hiro4bbh/StatKnife
```

Then, install the packages depended on by StatKnife at the root of StatKnife as follows:

```
$ npm install
```

### Use and Develop StatKnife

Start StatKnife at the root of StatKnife in your terminal as follows:

```
$ electron .
```

[Visual Studio Code](https://code.visualstudio.com/) (VSCode) is recommended for developing StatKnife.
VSCode provides a compact and fast development environment, including the terminal!

## TODO

- Prepare documentations.
- Write unit tests.
- Prepare StatKnife logo.
- Implement more statistical functions.
- Tweak visual styles and plot options.
- Prepare release packages.