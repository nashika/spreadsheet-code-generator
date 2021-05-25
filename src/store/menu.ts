import path from "path";
import fs from "fs";

import electron from "electron";
import _ from "lodash";
import { Action, Module, Mutation } from "vuex-module-decorators";

import { logger } from "~/src/logger";
import { BaseStore } from "~/src/store/base";
import { eventNames } from "~/src/util/event-names";

export interface IConfig {
  saveBaseDir: string;
  recentSaveBaseDirs: string[];
}

const _configFilePath = path.join(
  electron.remote.app.getAppPath(),
  "./tmp/config.json"
);

function _configTemplate(): IConfig {
  return {
    saveBaseDir: path.join(electron.remote.app.getAppPath(), "./sample/"),
    recentSaveBaseDirs: [],
  };
}

let _menu: electron.Menu;

@Module({
  name: "menu",
  stateFactory: true,
  namespaced: true,
})
export default class MenuStore extends BaseStore {
  showMenu: boolean = true;
  config: IConfig = <any>{};

  @Mutation
  private m_setShowMenu(arg: boolean): void {
    this.showMenu = arg;
  }

  @Mutation
  private m_setConfig(config: IConfig): void {
    this.config = config;
  }

  @Mutation
  private m_mergeConfig(config: MyDeepPartial<IConfig>): void {
    _.merge(this.config, config);
  }

  @Action
  a_toggleShowMenu(): void {
    this.m_setShowMenu(!this.showMenu);
    this.$root.$emit(eventNames.menu.toggle);
  }

  @Action
  a_setSaveBaseDir(dir: string): void {
    this.m_mergeConfig({ saveBaseDir: dir });
  }

  @Action
  a_setRecentSaveBaseDirs(dirs: string[]): void {
    this.m_mergeConfig({ recentSaveBaseDirs: dirs });
  }

  @Action
  a_loadConfig(): void {
    logger.debug(`Loading ${_configFilePath}.`);
    const config: IConfig = fs.existsSync(_configFilePath)
      ? JSON.parse(fs.readFileSync(_configFilePath).toString())
      : _configTemplate();
    this.m_setConfig(config);
  }

  @Action
  a_saveConfig(): void {
    const filePath: string = _configFilePath;
    logger.debug(`Saving ${filePath}.`);
    fs.writeFileSync(filePath, JSON.stringify(this.config, null, "  "));
  }

  @Action
  async a_initialize(): Promise<void> {
    _menu = electron.remote.Menu.buildFromTemplate([
      {
        label: "&File",
        submenu: [
          {
            label: "&New",
            accelerator: "Ctrl+N",
            click: () => this.a_new(),
          },
          {
            label: "&Open",
            accelerator: "Ctrl+O",
            click: () => this.a_open(),
          },
          {
            label: "Open &Recent",
            submenu: [],
          },
          {
            label: "&Save",
            accelerator: "Ctrl+S",
            click: () => this.a_save(false),
          },
          {
            label: "Save &As",
            accelerator: "Ctrl+Shift+S",
            click: () => this.a_save(true),
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
            click: () => this.$root.$emit(eventNames.data.insert),
          },
        ],
      },
      {
        label: "&Application",
        submenu: [
          {
            label: "Toggle Side &Menu",
            accelerator: "Ctrl+E",
            click: () => this.a_toggleShowMenu(),
          },
          {
            label: "&Generate",
            accelerator: "Ctrl+G",
            click: () => {
              this.$myService.generator.generate();
            },
          },
        ],
      },
      {
        label: "&Development",
        submenu: [
          {
            label: "&Reload",
            accelerator: "F5",
            click: () => electron.remote.getCurrentWindow().reload(),
          },
          {
            label: "Toggle &Full Screen",
            accelerator: "F11",
            click: () =>
              electron.remote
                .getCurrentWindow()
                .setFullScreen(
                  !electron.remote.getCurrentWindow().isFullScreen()
                ),
          },
          {
            label: "Toggle &Developer Tools",
            accelerator: "F12",
            click: () =>
              electron.remote.getCurrentWindow().webContents.toggleDevTools(),
          },
        ],
      },
    ]);
    electron.remote.getCurrentWindow().setMenu(_menu);
    this.a_loadConfig();
    await this.a_openRecent();
  }

  @Action
  a_new(): void {
    if (
      !window.confirm(
        `All editing data will be erased, Do you really want to new project?`
      )
    )
      return;
    this.a_setSaveBaseDir("");
    this.$myStore.sheet.a_newAll();
    this.a_saveDirInfo(false);
  }

  @Action
  async a_open(): Promise<void> {
    if (!this.a_openDir()) return;
    if (await this.$myStore.sheet.a_loadAll()) this.a_saveDirInfo();
  }

  @Action
  async a_openRecent(dir: string = ""): Promise<void> {
    if (dir) {
      this.a_setSaveBaseDir(dir);
    } else if (this.config.recentSaveBaseDirs.length > 0) {
      this.a_setSaveBaseDir(this.config.recentSaveBaseDirs[0]);
    } else {
      this.a_setSaveBaseDir(
        path.join(electron.remote.app.getAppPath(), "sample")
      );
    }
    if (await this.$myStore.sheet.a_loadAll()) this.a_saveDirInfo();
  }

  @Action
  async a_save(as: boolean = false): Promise<void> {
    if (as || !this.config.saveBaseDir) if (!this.a_openDir()) return;
    if (await this.$myStore.sheet.a_saveAll()) this.a_saveDirInfo();
  }

  @Action
  a_openDir(): boolean {
    const dirs: string[] | undefined =
      electron.remote.dialog.showOpenDialogSync({
        defaultPath:
          this.config.saveBaseDir || this.config.recentSaveBaseDirs[0],
        properties: ["openDirectory"],
      });
    if (!dirs || dirs.length === 0) return false;
    this.a_setSaveBaseDir(dirs[0]);
    return true;
  }

  @Action
  a_saveDirInfo(save: boolean = true): void {
    electron.remote
      .getCurrentWindow()
      .setTitle(`spreadsheet-code-generator [${this.config.saveBaseDir}]`);
    if (save) {
      let recentSaveBaseDirs: string[];
      recentSaveBaseDirs = this.config.recentSaveBaseDirs || [];
      recentSaveBaseDirs = _.filter(
        recentSaveBaseDirs,
        (dir: string): boolean =>
          _.toLower(dir) !== _.toLower(this.config.saveBaseDir)
      );
      recentSaveBaseDirs = _.concat(
        this.config.saveBaseDir,
        recentSaveBaseDirs
      );
      recentSaveBaseDirs = _.take(recentSaveBaseDirs, 5);
      this.a_setRecentSaveBaseDirs(recentSaveBaseDirs);
      this.a_saveConfig();
      const submenu = _menu.items?.[0]?.submenu?.items?.[2]?.submenu;
      if (submenu) {
        (<any>submenu).clear();
        submenu.items = [];
        for (const dir of recentSaveBaseDirs) {
          submenu.append(
            new electron.remote.MenuItem({
              label: dir,
              click: () => this.a_openRecent(dir),
            })
          );
        }
      }
    }
  }
}
