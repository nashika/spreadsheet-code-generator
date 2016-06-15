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
            click: this.new,
          },
          {
            label: "&Open",
            accelerator: "Ctrl+O",
            click: this.open,
          },
          {
            label: "&Save",
            accelerator: "Ctrl+S",
            click: this.saveTo,
          },
          {
            label: "Save &As",
            accelerator: "Ctrl+Shift+S",
            click: this.saveAs,
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
            accelerator: "F5",
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
            accelerator: "F12",
            click: () => {
              electron.remote.getCurrentWindow().webContents.toggleDevTools();
            },
          },
        ]
      }
    ]);
    electron.remote.getCurrentWindow().setMenu(menu);
    this.openDefault();
  }

  protected new = ():void => {
    if (!window.confirm(`All editing data will be erased, Do you really want to new project?`))
      return;
    this.app.saveBaseDir = "";
    this.app.services.sheet.newAll();
    this.saveDirInfo(false);
  };

  protected open = ():void => {
    if (!this.openDir()) return;
    if (this.app.services.sheet.loadAll())
      this.saveDirInfo();
  };

  protected openDefault():void {
    if (this.app.config.recentSaveBaseDir)
      this.app.saveBaseDir = this.app.config.recentSaveBaseDir;
    else
      this.app.saveBaseDir = path.join(electron.remote.app.getAppPath(), "sample");
    if (this.app.services.sheet.loadAll())
      this.saveDirInfo();
  }

  protected saveTo = ():void => {
    this.save(false);
  };

  protected saveAs = ():void => {
    this.save(true);
  };

  protected save(as:boolean = false):void {
    if (as || !this.app.saveBaseDir)
      if (!this.openDir())
        return;
    if (this.app.services.sheet.saveAll())
      this.saveDirInfo();
  };

  protected openDir():boolean {
    let dirs:string[] = electron.remote.dialog.showOpenDialog({
      defaultPath: this.app.saveBaseDir || this.app.config.recentSaveBaseDir,
      properties: ["openDirectory"],
    });
    if (!dirs || dirs.length == 0) return false;
    this.app.saveBaseDir = dirs[0];
    return true;
  }

  protected saveDirInfo(save:boolean = true):void {
    electron.remote.getCurrentWindow().setTitle(`spreadsheet-code-generator [${this.app.saveBaseDir}]`);
    this.app.config.recentSaveBaseDir = this.app.saveBaseDir;
    if (save) this.app.services.config.save();
  }

}
