import path = require("path");

import electron = require("electron");
import Menu = Electron.Menu;
import _ = require("lodash");
import {injectable} from "inversify";

import {BaseService} from "./base.service";
import {HubService} from "./hub.service";
import {GeneratorService} from "./generator.service";
import {SheetService} from "./sheet.service";
import {ConfigService} from "./config.service";

@injectable()
export class MenuService extends BaseService {

  protected menu: Menu;

  constructor(protected hubService: HubService,
              protected generatorService: GeneratorService,
              protected sheetService: SheetService,
              protected configService: ConfigService) {
    super();
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
            click: () => this.hubService.$vm.$emit("insert"),
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
              this.hubService.$vm.showMenu = !this.hubService.$vm.showMenu;
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
              this.hubService.$vm.mode = "data";
            }
          },
          {
            label: "&Code Edit Mode",
            click: () => {
              this.hubService.$vm.mode = "code";
            }
          },
          {
            label: "&Toggle Edit Mode",
            accelerator: "Ctrl+T",
            click: () => {
              this.hubService.$vm.mode = this.hubService.$vm.mode == "data" ? "code" : "data";
            }
          },
          {
            label: "&Generate",
            accelerator: "Ctrl+G",
            click: () => {
              this.generatorService.generate();
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
    this.hubService.$vm.saveBaseDir = "";
    this.sheetService.newAll();
    this.saveDirInfo(false);
  };

  protected open = (): void => {
    if (!this.openDir()) return;
    if (this.sheetService.loadAll())
      this.saveDirInfo();
  };

  protected openRecent(dir: string = ""): void {
    if (dir)
      this.hubService.$vm.saveBaseDir = dir;
    else if (this.hubService.$vm.config.recentSaveBaseDirs.length > 0)
      this.hubService.$vm.saveBaseDir = this.hubService.$vm.config.recentSaveBaseDirs[0];
    else
      this.hubService.$vm.saveBaseDir = path.join(electron.remote.app.getAppPath(), "sample");
    if (this.sheetService.loadAll())
      this.saveDirInfo();

  }

  protected saveTo = (): void => {
    this.save(false);
  };

  protected saveAs = (): void => {
    this.save(true);
  };

  protected save(as: boolean = false): void {
    if (as || !this.hubService.$vm.saveBaseDir)
      if (!this.openDir())
        return;
    if (this.sheetService.saveAll())
      this.saveDirInfo();
  };

  protected openDir(): boolean {
    let dirs: string[] = electron.remote.dialog.showOpenDialog({
      defaultPath: this.hubService.$vm.saveBaseDir || this.hubService.$vm.config.recentSaveBaseDirs[0],
      properties: ["openDirectory"],
    });
    if (!dirs || dirs.length == 0) return false;
    this.hubService.$vm.saveBaseDir = dirs[0];
    return true;
  }

  protected saveDirInfo(save: boolean = true): void {
    electron.remote.getCurrentWindow().setTitle(`spreadsheet-code-generator [${this.hubService.$vm.saveBaseDir}]`);
    if (save) {
      this.hubService.$vm.config.recentSaveBaseDirs = this.hubService.$vm.config.recentSaveBaseDirs || [];
      this.hubService.$vm.config.recentSaveBaseDirs = _.filter(this.hubService.$vm.config.recentSaveBaseDirs,
        (dir: string): boolean => _.toLower(dir) != _.toLower(this.hubService.$vm.saveBaseDir));
      this.hubService.$vm.config.recentSaveBaseDirs = _.concat(this.hubService.$vm.saveBaseDir, this.hubService.$vm.config.recentSaveBaseDirs);
      this.hubService.$vm.config.recentSaveBaseDirs = _.take(this.hubService.$vm.config.recentSaveBaseDirs, 5);
      this.configService.save();
      let submenu: Menu = <Menu>(<any>(<Menu>(<any>this.menu.items[0]).submenu).items[2]).submenu;
      (<any>submenu).clear();
      for (let dir of this.hubService.$vm.config.recentSaveBaseDirs) {
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
