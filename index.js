"use strict";
var electron = require("electron");
var win;
function createWindow() {
    win = new electron.BrowserWindow({ width: 1200, height: 800 });
    win.loadURL("file://" + __dirname + "/view/index.html");
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