import path from "path";
import fs from "fs";

import * as electron from "electron";
import { Action, Module, Mutation } from "vuex-module-decorators";

import { BaseStore } from "~/src/store/base";
import { logger } from "~/src/logger";

export interface IConfig {
  saveBaseDir: string;
  recentSaveBaseDirs: string[];
}

const configFilePath = path.join(
  electron.remote.app.getAppPath(),
  "./tmp/config.json"
);

@Module({
  name: "config",
  stateFactory: true,
  namespaced: true,
})
export default class ConfigStore extends BaseStore {
  config!: IConfig;

  @Mutation
  SET_CONFIG(config: IConfig) {
    this.config = config;
  }

  @Action
  load(): void {
    logger.debug(`Loadig ${configFilePath}.`);
    const config: IConfig = fs.existsSync(configFilePath)
      ? JSON.parse(fs.readFileSync(configFilePath).toString())
      : this.configTemplate();
    this.SET_CONFIG(config);
  }

  @Action
  save(): void {
    const filePath: string = configFilePath;
    logger.debug(`Saving ${filePath}.`);
    fs.writeFileSync(filePath, JSON.stringify(this.config, null, "  "));
  }

  protected configTemplate(): IConfig {
    return {
      saveBaseDir: path.join(electron.remote.app.getAppPath(), "./sample/"),
      recentSaveBaseDirs: [],
    };
  }
}
