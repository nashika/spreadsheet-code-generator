"use strict";
var electron = require("electron");
var win;
function createWindow() {
    win = new electron.BrowserWindow({ width: 600, height: 400 });
    win.loadURL("file://" + __dirname + "/index.html");
    win.webContents.openDevTools();
    win.on('closed', function () {
        win = null;
    });
}
electron.app.on('ready', createWindow);
electron.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron.app.quit();
    }
});
electron.app.on('activate', function () {
    if (win === null) {
        createWindow();
    }
});
//# sourceMappingURL=index.js.map