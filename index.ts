import electron = require("electron");

let win: Electron.BrowserWindow;

function createWindow() {
  win = new electron.BrowserWindow({width: 1200, height: 800});
  win.loadURL(`file://${__dirname}/index.html`);
  //win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });
}

electron.app.on('ready', createWindow);

electron.app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    electron.app.quit();
  }
});

electron.app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
