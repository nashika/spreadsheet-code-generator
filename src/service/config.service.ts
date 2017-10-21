import fs = require("fs");
import path = require("path");

import electron = require("electron");
import * as log from "loglevel";
import {injectable} from "inversify";

import {HubService, IConfig} from "./hub.service";
import {BaseHubService} from "./base-hub.service";

@injectable()
export class ConfigService extends BaseHubService {

  constructor(protected hubService: HubService) {
    super(hubService);
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
    this.$hub.config = result;
  }

  public save(): void {
    let filePath: string = this.filePath;
    log.debug(`Saving ${filePath}.`);
    fs.writeFileSync(filePath, JSON.stringify(this.$hub.config, null, "  "));
  }

}
