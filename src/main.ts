import path from "path";
import http from "http";

import { app, BrowserWindow } from "electron";
// @ts-ignore
import { Nuxt, Builder } from "nuxt";

import config from "../nuxt.config";

// for electron-builder
config.rootDir = path.join(__dirname, "../");

config.dev = process.env.NODE_ENV !== "production";

async function start(): Promise<void> {
  try {
    // Electron
    console.log("Opening electron window.");
    let win: BrowserWindow | null;
    let url: string = "";
    await new Promise<BrowserWindow>((resolve) => {
      const newWin = () => {
        win = new BrowserWindow({
          width: 1200,
          height: 800,
          webPreferences: { nodeIntegration: true },
        });
        win.on("closed", () => (win = null));
        resolve(win);
      };
      app.on("ready", newWin);
      app.on("window-all-closed", () => app.quit());
      app.on("activate", () => win === null && newWin());
    });

    // Build only in dev mode
    if (config.dev) {
      // Init Nuxt.js
      console.log("Starting HTTP Server.");
      const nuxt = new Nuxt(config);
      const server = http.createServer(nuxt.render);
      server.listen(config.port);
      console.log("Waiting nuxt ready.");
      await nuxt.ready();
      console.log("Starting nuxt dev server build process.");
      const builder = new Builder(nuxt);
      await builder.build();
      // Listen the server
      url = `http://localhost:${config.port}`;
      console.log(`Nuxt working on ${url}`);
    } else {
      url = "file://" + path.join(__dirname, "../dist/index.html");
    }
    console.log("Opening application URL.");
    // @ts-ignore
    await win?.loadURL(url);
    console.log("Done.");
  } catch (err) {
    console.error(`Server initialize failed. err=${err}`);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}
start();
