import path from "path";
import fs from "fs";

import * as electron from "electron";
import { Action, Module, Mutation } from "vuex-module-decorators";

import { BaseStore } from "~/src/store/base";
import { logger } from "~/src/logger";

export interface IConfig {
  recentSaveBaseDirs?: string[];
}

@Module({
  name: "config",
  stateFactory: true,
  namespaced: true,
})
export default class ConfigStore extends BaseStore {
  config?: IConfig;

  protected get filePath(): string {
    debugger;
    console.log(`a = ${electron.remote.app.getAppPath()}`);
    return path.join(electron.remote.app.getAppPath(), "./tmp/config.json");
  }

  @Mutation
  load(): void {
    const filePath: string = this.filePath;
    logger.debug(`Loadig ${filePath}.`);
    let result: IConfig;
    if (fs.existsSync(filePath)) {
      result = JSON.parse(fs.readFileSync(filePath).toString());
    } else {
      result = {};
    }
    if (!result.recentSaveBaseDirs) result.recentSaveBaseDirs = [];
    this.config = result;
  }

  @Action
  save(): void {
    const filePath: string = this.filePath;
    logger.debug(`Saving ${filePath}.`);
    fs.writeFileSync(filePath, JSON.stringify(this.config, null, "  "));
  }
}
