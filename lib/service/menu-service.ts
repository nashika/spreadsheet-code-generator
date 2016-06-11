import path = require("path");

import electron = require("electron");

import {BaseService} from "./base-service";
import {AppComponent} from "../component/app-component";


export class MenuService extends BaseService {

  constructor(app:AppComponent) {
    super(app);
    this.init();
  }

  protected init():void {
    let menu = electron.remote.Menu.buildFromTemplate([
      {
        label: "&File",
        submenu: [
          {
            label: "&New",
            accelerator: "Ctrl+N",
            click: () => {
              alert("now construction")
            },
          },
          {
            label: "&Open",
            accelerator: "Ctrl+O",
            click: this.open,
          },
          {
            label: "&Save",
            accelerator: "Ctrl+S",
            click: this.save,
          },
        ],
      },
      {
        label: "&View",
        submenu: [
          {
            label: "Toggle Side &Menu",
            accelerator: "Ctrl+E",
            click: () => {
              this.app.showMenu = !this.app.showMenu;
            },
          }
        ],
      },
      {
        label: "&Development",
        submenu: [
          {
            label: "&Reload",
            accelerator: "Ctrl+R",
            click: () => {
              electron.remote.getCurrentWindow().reload();
            },
          },
          {
            label: "Toggle &Full Screen",
            accelerator: "F11",
            click: () => {
              electron.remote.getCurrentWindow().setFullScreen(!electron.remote.getCurrentWindow().isFullScreen());
            },
          },
          {
            label: "Toggle &Developer Tools",
            accelerator: "Alt+Ctrl+I",
            click: () => {
              electron.remote.getCurrentWindow().webContents.toggleDevTools();
            },
          },
        ]
      }
    ]);
    electron.remote.getCurrentWindow().setMenu(menu);
  }

  protected open = ():void => {
    let dirs:string[] = electron.remote.dialog.showOpenDialog({
      defaultPath: path.join(electron.remote.app.getAppPath(), "sample"),
      properties: ["openDirectory"],
    });
    if (!dirs || dirs.length == 0) return;
    this.app.saveBaseDir = dirs[0];
    this.app.services.sheet.loadAll();
  };

  protected save = ():void => {
    this.app.services.sheet.saveAll();
  }

}
