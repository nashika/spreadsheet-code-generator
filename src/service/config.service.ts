import fs = require("fs");
import path = require("path");

import electron = require("electron");
import * as log from "loglevel";
import {injectable} from "inversify";

import {BaseService} from "./base.service";
import {HubService, IConfig} from "./hub.service";

@injectable()
export class ConfigService extends BaseService {

  constructor(protected hubService: HubService) {
    super();
    this.load();
  }

  protected get filePath(): string {
    return path.join(electron.remote.app.getAppPath(), "./tmp/config.json");
  }

  public load(): void {
    let filePath: string = this.filePath;
    log.debug(`Loadig ${filePath}.`);
    let result: IConfig;
    if (fs.existsSync(filePath)) {
      result = JSON.parse(fs.readFileSync(filePath).toString());
    } else {
      result = {};
    }
    if (!result.recentSaveBaseDirs) result.recentSaveBaseDirs = [];
    this.hubService.$vm.config = result;
  }

  public save(): void {
    let filePath: string = this.filePath;
    log.debug(`Saving ${filePath}.`);
    fs.writeFileSync(filePath, JSON.stringify(this.hubService.$vm.config, null, "  "));
  }

}
