import path = require("path");

import electron = require("electron");
import Menu = Electron.Menu;
import _ = require("lodash");
import {injectable} from "inversify";

import {HubService} from "./hub.service";
import {GeneratorService} from "./generator.service";
import {SheetService} from "./sheet.service";
import {ConfigService} from "./config.service";
import {BaseHubService} from "./base-hub.service";
import {CodeService} from "./code.service";
import {DataService} from "./data.service";
import {BaseIoService} from "./base-io.service";

@injectable()
export class MenuService extends BaseHubService {

  private menu: Menu;
  private ioServices: BaseIoService[];

  constructor(hubService: HubService,
              private generatorService: GeneratorService,
              sheetService: SheetService,
              dataService: DataService,
              codeService: CodeService,
              private configService: ConfigService) {
    super(hubService);
    this.ioServices = [sheetService, dataService, codeService];
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
            click: () => this.$hub.$emit("insert"),
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
              this.$hub.showMenu = !this.$hub.showMenu;
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
              this.$hub.mode = "data";
            }
          },
          {
            label: "&Code Edit Mode",
            click: () => {
              this.$hub.mode = "code";
            }
          },
          {
            label: "&Toggle Edit Mode",
            accelerator: "Ctrl+T",
            click: () => {
              this.$hub.mode = this.$hub.mode == "data" ? "code" : "data";
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
    this.$hub.saveBaseDir = "";
    if (_.every(this.ioServices, ioService => ioService.newAll()))
      this.saveDirInfo(false);
  };

  protected open = (): void => {
    if (!this.openDir()) return;
    if (_.every(this.ioServices, ioService => ioService.loadAll()))
      this.saveDirInfo();
  };

  protected openRecent(dir: string = ""): void {
    if (dir)
      this.$hub.saveBaseDir = dir;
    else if (this.$hub.config.recentSaveBaseDirs.length > 0)
      this.$hub.saveBaseDir = this.$hub.config.recentSaveBaseDirs[0];
    else
      this.$hub.saveBaseDir = path.join(electron.remote.app.getAppPath(), "sample");
    if (_.every(this.ioServices, ioService => ioService.loadAll()))
      this.saveDirInfo();
  }

  protected saveTo = (): void => {
    this.save(false);
  };

  protected saveAs = (): void => {
    this.save(true);
  };

  protected save(as: boolean = false): void {
    if (as || !this.$hub.saveBaseDir)
      if (!this.openDir())
        return;
    if (_.every(this.ioServices, ioService => ioService.saveAll()))
      this.saveDirInfo();
  };

  protected openDir(): boolean {
    let dirs: string[] = electron.remote.dialog.showOpenDialog({
      defaultPath: this.$hub.saveBaseDir || this.$hub.config.recentSaveBaseDirs[0],
      properties: ["openDirectory"],
    });
    if (!dirs || dirs.length == 0) return false;
    this.$hub.saveBaseDir = dirs[0];
    return true;
  }

  protected saveDirInfo(save: boolean = true): void {
    electron.remote.getCurrentWindow().setTitle(`spreadsheet-code-generator [${this.$hub.saveBaseDir}]`);
    if (save) {
      this.$hub.config.recentSaveBaseDirs = this.$hub.config.recentSaveBaseDirs || [];
      this.$hub.config.recentSaveBaseDirs = _.filter(this.$hub.config.recentSaveBaseDirs,
        (dir: string): boolean => _.toLower(dir) != _.toLower(this.$hub.saveBaseDir));
      this.$hub.config.recentSaveBaseDirs = _.concat(this.$hub.saveBaseDir, this.$hub.config.recentSaveBaseDirs);
      this.$hub.config.recentSaveBaseDirs = _.take(this.$hub.config.recentSaveBaseDirs, 5);
      this.configService.save();
      let submenu: Menu = <Menu>(<any>(<Menu>(<any>this.menu.items[0]).submenu).items[2]).submenu;
      (<any>submenu).clear();
      for (let dir of this.$hub.config.recentSaveBaseDirs) {
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
