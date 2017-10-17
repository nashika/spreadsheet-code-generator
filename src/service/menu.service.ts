import path = require("path");

import electron = require("electron");
import Menu = Electron.Menu;
import MenuItem = Electron.MenuItem;
import _ = require("lodash");

import {BaseService} from "./base.service";
import {AppComponent} from "../component/app.component";

export class MenuService extends BaseService {

  protected menu: Menu;

  constructor(app: AppComponent) {
    super(app);
    this.init();
  }

  protected init(): void {
    this.menu = electron.remote.Menu.buildFromTemplate([
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
            label: "Open &Recent",
            submenu: [],
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
          {
            label: "&Exit",
            accelerator: "Alt+F4",
            click: () => electron.remote.app.exit(0),
          },
        ],
      },
      {
        label: "&Edit",
        submenu: [
          {
            label: "Insert new line",
            accelerator: "Ctrl+I",
            click: () => this.$root.$broadcast("insert"),
          }
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
          },
        ],
      },
      {
        label: "&Application",
        submenu: [
          {
            label: "&Data Edit Mode",
            click: () => {
              this.app.mode = "data";
            }
          },
          {
            label: "&Code Edit Mode",
            click: () => {
              this.app.mode = "code";
            }
          },
          {
            label: "&Toggle Edit Mode",
            accelerator: "Ctrl+T",
            click: () => {
              this.app.mode = this.app.mode == "data" ? "code" : "data";
            }
          },
          {
            label: "&Generate",
            accelerator: "Ctrl+G",
            click: () => {
              this.app.services.generator.generate();
            }
          },
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
    electron.remote.getCurrentWindow().setMenu(this.menu);
    this.openRecent();
  }

  protected new = (): void => {
    if (!window.confirm(`All editing data will be erased, Do you really want to new project?`))
      return;
    this.app.saveBaseDir = "";
    this.app.services.sheet.newAll();
    this.saveDirInfo(false);
  };

  protected open = (): void => {
    if (!this.openDir()) return;
    if (this.app.services.sheet.loadAll())
      this.saveDirInfo();
  };

  protected openRecent(dir: string = ""): void {
    if (dir)
      this.app.saveBaseDir = dir;
    else if (this.app.config.recentSaveBaseDirs.length > 0)
      this.app.saveBaseDir = this.app.config.recentSaveBaseDirs[0];
    else
      this.app.saveBaseDir = path.join(electron.remote.app.getAppPath(), "sample");
    if (this.app.services.sheet.loadAll())
      this.saveDirInfo();

  }

  protected saveTo = (): void => {
    this.save(false);
  };

  protected saveAs = (): void => {
    this.save(true);
  };

  protected save(as: boolean = false): void {
    if (as || !this.app.saveBaseDir)
      if (!this.openDir())
        return;
    if (this.app.services.sheet.saveAll())
      this.saveDirInfo();
  };

  protected openDir(): boolean {
    let dirs: string[] = electron.remote.dialog.showOpenDialog({
      defaultPath: this.app.saveBaseDir || this.app.config.recentSaveBaseDirs[0],
      properties: ["openDirectory"],
    });
    if (!dirs || dirs.length == 0) return false;
    this.app.saveBaseDir = dirs[0];
    return true;
  }

  protected saveDirInfo(save: boolean = true): void {
    electron.remote.getCurrentWindow().setTitle(`spreadsheet-code-generator [${this.app.saveBaseDir}]`);
    if (save) {
      this.app.config.recentSaveBaseDirs = this.app.config.recentSaveBaseDirs || [];
      this.app.config.recentSaveBaseDirs = _.filter(this.app.config.recentSaveBaseDirs,
        (dir: string): boolean => _.toLower(dir) != _.toLower(this.app.saveBaseDir));
      this.app.config.recentSaveBaseDirs = _.concat(this.app.saveBaseDir, this.app.config.recentSaveBaseDirs);
      this.app.config.recentSaveBaseDirs = _.take(this.app.config.recentSaveBaseDirs, 5);
      this.app.services.config.save();
      let submenu: Menu = <Menu>(<any>(<Menu>(<any>this.menu.items[0]).submenu).items[2]).submenu;
      (<any>submenu).clear();
      for (let dir of this.app.config.recentSaveBaseDirs) {
        submenu.append(new electron.remote.MenuItem({
          label: dir,
          click: () => {
            this.openRecent(dir);
          },
        }));
      }
    }

  }
}
