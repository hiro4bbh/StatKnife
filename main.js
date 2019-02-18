const fs = require('fs');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

electron.protocol.registerStandardSchemes(['es6']);
electron.protocol.registerStandardSchemes(['es6-root']);
app.on('ready', function() {
  // Set MIME type 'text/javascript' for script[@type="module"].
  electron.protocol.registerBufferProtocol('es6', ( req, cb ) => {
    fs.readFile(
      req.url.replace('es6://', ''),
      (_, b) => { cb({mimeType: 'text/javascript', data: b})}
    )
  })
  electron.protocol.registerBufferProtocol('es6-root', ( req, cb ) => {
    fs.readFile(
      req.url.replace('es6-root:/', ''),
      (_, b) => { cb({mimeType: 'text/javascript', data: b})}
    )
  })
  // Open the main window.
  let mainWindow = new BrowserWindow({width: 1200, height: 600, webPreferences: {nodeIntegration: true}});
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.webContents.openDevTools({mode: 'left'});
});
app.on('window-all-closed', () => app.quit());