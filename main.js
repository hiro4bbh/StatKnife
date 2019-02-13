"use babel";

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow;

app.on('window-all-closed', () => app.quit());

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 800, height: 600});
  //mainWindow.webContents.openDevTools();
  mainWindow.on('closed', () => { mainWindow = null });
});