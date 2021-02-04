import path from "path";
import fs from "fs";

import electron from "electron";
import _ from "lodash";
import { Action, Module, Mutation } from "vuex-module-decorators";

import { logger } from "~/src/logger";
import { BaseStore } from "~/src/store/base";

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

@Module({
  name: "config",
  stateFactory: true,
  namespaced: true,
})
export default class ConfigStore extends BaseStore {
  config: IConfig = <any>{};

  @Mutation
  private m_setConfig(config: IConfig): void {
    this.config = config;
  }

  @Mutation
  private m_mergeConfig(config: MyDeepPartial<IConfig>): void {
    _.merge(this.config, config);
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
  a_load(): void {
    logger.debug(`Loading ${_configFilePath}.`);
    const config: IConfig = fs.existsSync(_configFilePath)
      ? JSON.parse(fs.readFileSync(_configFilePath).toString())
      : _configTemplate();
    this.m_setConfig(config);
  }

  @Action
  a_save(): void {
    const filePath: string = _configFilePath;
    logger.debug(`Saving ${filePath}.`);
    fs.writeFileSync(filePath, JSON.stringify(this.config, null, "  "));
  }
}
