import path from "path";

import _ from "lodash";
import electron from "electron";

import { BaseService } from "~/src/service/base.service";

export class MenuService extends BaseService {
  private menu!: electron.Menu;

  initialize(): void {
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
            click: () => this.$root.$emit("insert"),
          },
        ],
      },
      {
        label: "&View",
        submenu: [
          {
            label: "Toggle Side &Menu",
            accelerator: "Ctrl+E",
            click: () => this.$myStore.hub.a_toggleShowMenu(),
          },
        ],
      },
      {
        label: "&Application",
        submenu: [
          {
            label: "&Data Edit Mode",
            click: () => this.$root.$router.push("/data"),
          },
          {
            label: "&Code Edit Mode",
            click: () => this.$root.$router.push("/code"),
          },
          {
            label: "&Generate",
            accelerator: "Ctrl+G",
            click: () => {
              // this.generatorService.generate(); TODO: fix
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
    electron.remote.getCurrentWindow().setMenu(this.menu);
    this.openRecent();
  }

  protected new = (): void => {
    if (
      !window.confirm(
        `All editing data will be erased, Do you really want to new project?`
      )
    )
      return;
    this.$myStore.config.m_mergeConfig({ saveBaseDir: "" });
    this.$myStore.sheet.a_newAll();
    this.saveDirInfo(false);
  };

  protected open = (): void => {
    if (!this.openDir()) return;
    if (this.$myStore.sheet.a_loadAll()) this.saveDirInfo();
  };

  protected openRecent(dir: string = ""): void {
    if (dir) {
      this.$myStore.config.m_mergeConfig({ saveBaseDir: dir });
    } else if (this.$myStore.config.config.recentSaveBaseDirs.length > 0) {
      this.$myStore.config.m_mergeConfig({
        saveBaseDir: this.$myStore.config.config.recentSaveBaseDirs[0],
      });
    } else {
      this.$myStore.config.config.saveBaseDir = path.join(
        electron.remote.app.getAppPath(),
        "sample"
      );
    }
    if (this.$myStore.sheet.a_loadAll()) this.saveDirInfo();
  }

  protected saveTo = (): void => {
    this.save(false);
  };

  protected saveAs = (): void => {
    this.save(true);
  };

  protected save(as: boolean = false): void {
    if (as || !this.$myStore.config.config.saveBaseDir)
      if (!this.openDir()) return;
    if (this.$myStore.sheet.a_saveAll()) this.saveDirInfo();
  }

  protected openDir(): boolean {
    const dirs:
      | string[]
      | undefined = electron.remote.dialog.showOpenDialogSync({
      defaultPath:
        this.$myStore.config.config.saveBaseDir ||
        this.$myStore.config.config.recentSaveBaseDirs[0],
      properties: ["openDirectory"],
    });
    if (!dirs || dirs.length === 0) return false;
    this.$myStore.config.m_mergeConfig({ saveBaseDir: dirs[0] });
    return true;
  }

  protected saveDirInfo(save: boolean = true): void {
    electron.remote
      .getCurrentWindow()
      .setTitle(
        `spreadsheet-code-generator [${this.$myStore.config.config.saveBaseDir}]`
      );
    if (save) {
      let recentSaveBaseDirs: string[];
      recentSaveBaseDirs = this.$myStore.config.config.recentSaveBaseDirs || [];
      recentSaveBaseDirs = _.filter(
        recentSaveBaseDirs,
        (dir: string): boolean =>
          _.toLower(dir) !== _.toLower(this.$myStore.config.config.saveBaseDir)
      );
      recentSaveBaseDirs = _.concat(
        this.$myStore.config.config.saveBaseDir,
        recentSaveBaseDirs
      );
      recentSaveBaseDirs = _.take(recentSaveBaseDirs, 5);
      this.$myStore.config.m_mergeConfig({ recentSaveBaseDirs });
      this.$myStore.config.a_save();
      const submenu: electron.Menu | undefined = this.menu.items?.[0]?.submenu
        ?.items?.[2]?.submenu;
      if (submenu) {
        submenu.items = [];
        for (const dir of recentSaveBaseDirs) {
          submenu.append(
            new electron.remote.MenuItem({
              label: dir,
              click: () => this.openRecent(dir),
            })
          );
        }
      }
    }
  }
}
