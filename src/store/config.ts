import path from "path";
import fs from "fs";

import * as electron from "electron";
import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";

import { logger } from "~/src/logger";

export interface IConfig {
  saveBaseDir: string;
  recentSaveBaseDirs: string[];
}

const configFilePath = path.join(
  electron.remote.app.getAppPath(),
  "./tmp/config.json"
);

function configTemplate(): IConfig {
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
export default class ConfigStore extends VuexModule {
  config: IConfig = <any>{};

  @Mutation
  SET_CONFIG(config: IConfig): void {
    this.config = config;
  }

  @Action
  load(): void {
    logger.debug(`Loading ${configFilePath}.`);
    const config: IConfig = fs.existsSync(configFilePath)
      ? JSON.parse(fs.readFileSync(configFilePath).toString())
      : configTemplate();
    this.SET_CONFIG(config);
  }

  @Action
  save(): void {
    const filePath: string = configFilePath;
    logger.debug(`Saving ${filePath}.`);
    fs.writeFileSync(filePath, JSON.stringify(this.config, null, "  "));
  }
}
