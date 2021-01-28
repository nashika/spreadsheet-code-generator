import path from "path";
import http from "http";

import { app, BrowserWindow } from "electron";
// @ts-ignore
import { Nuxt, Builder } from "nuxt";

import config from "../nuxt.config";

// for electron-builder
config.rootDir = path.join(__dirname, "../");

config.dev = process.env.NODE_ENV !== "production";

try {
  // Build only in dev mode
  let url: string = "";
  if (config.dev) {
    // Init Nuxt.js
    const nuxt = new Nuxt(config);
    const builder = new Builder(nuxt);
    const server = http.createServer(nuxt.render);
    builder.build();
    // Listen the server
    server.listen(config.port);
    url = `http://localhost:${config.port}`;
    console.log(`Nuxt working on ${url}`);
  } else {
    url = "file://" + path.join(__dirname, "../dist/index.html");
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
          .get(url, (res) => {
            if (res.statusCode === 200) {
              win?.loadURL(url);
            } else {
              console.log("restart poolServer");
              setTimeout(pollServer, 300);
            }
          })
          .on("error", pollServer);
      };
      pollServer();
    } else {
      return win.loadURL(url);
    }
  };
  app.on("ready", newWin);
  app.on("window-all-closed", () => app.quit());
  app.on("activate", () => win === null && newWin());
} catch (err) {
  console.error(`Server initialize failed. err=${err}`);
  if (err.stack) console.error(err.stack);
  process.exit(1);
}
