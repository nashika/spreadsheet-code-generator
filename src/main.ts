import path from "path";
import http from "http";

import { app, BrowserWindow } from "electron";
// @ts-ignore
import { Nuxt, Builder } from "nuxt";

import config from "../nuxt.config";

// for electron-builder
config.rootDir = __dirname;

// Init Nuxt.js
const nuxt = new Nuxt(config);
const builder = new Builder(nuxt);
const server = http.createServer(nuxt.render);
// Build only in dev mode
let _NUXT_URL_ = "";
if (config.dev) {
  builder.build().catch((err: any) => {
    console.error(err);
    process.exit(1);
  });
  // Listen the server
  server.listen();
  _NUXT_URL_ = `http://localhost:${config.port}`;
  console.log(`Nuxt working on ${_NUXT_URL_}`);
} else {
  _NUXT_URL_ = "file://" + path.join(__dirname, "../dist/index.html");
}

// Electron
let win: BrowserWindow | null;
const newWin = () => {
  win = new BrowserWindow({ width: 1200, height: 800 });
  win.on("closed", () => (win = null));
  if (config.dev) {
    // Wait for nuxt to build
    const pollServer = () => {
      http
        .get(_NUXT_URL_, (res) => {
          if (res.statusCode === 200) {
            win?.loadURL(_NUXT_URL_);
          } else {
            console.log("restart poolServer");
            setTimeout(pollServer, 300);
          }
        })
        .on("error", pollServer);
    };
    pollServer();
  } else {
    return win.loadURL(_NUXT_URL_);
  }
};

app.on("ready", newWin);
app.on("window-all-closed", () => app.quit());
app.on("activate", () => win === null && newWin());
