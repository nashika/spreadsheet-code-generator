import fs = require("fs");
import path = require("path");

import electron = require("electron");

import {BaseService} from "./base-service";
import {AppComponent, IConfig} from "../component/app-component";

export class ConfigService extends BaseService {

  constructor(app:AppComponent) {
    super(app);
    this.load();
  }

  protected get filePath():string {
    return path.join(electron.remote.app.getAppPath(), "./tmp/config.json");
  }

  public load():void {
    let filePath:string = this.filePath;
    log.debug(`Loadig ${filePath}.`);
    let result:IConfig;
    if (fs.existsSync(filePath)) {
      result = JSON.parse(fs.readFileSync(filePath).toString());
    } else {
      result = {};
    }
    if (!result.recentSaveBaseDirs) result.recentSaveBaseDirs = [];
    this.app.config = result;
  }

  public save():void {
    let filePath:string = this.filePath;
    log.debug(`Saving ${filePath}.`);
    fs.writeFileSync(filePath, JSON.stringify(this.app.config, null, "  "));
  }

}
