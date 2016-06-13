import _ = require("lodash");
import vue = require("vue");

import {IoService} from "./io-service";

export class CodeService extends IoService {

  protected static DIR_NAME:string = "code";

  protected load(sheetName:string):string {
    let data:string = super.load(sheetName, "js");
    return data ? data : "";
  }

  protected save(sheetName:string, data:string) {
    super.save(sheetName, data, "js");
  }

  public newAll():void {
    this.app.codes = {root: ""};
    this.app.currentCode = "";
  }

  public loadAll():boolean {
    if (!this.checkDir()) return false;
    let names:string[] = this.list();
    for (let name of names)
      vue.set(this.app.codes, name, this.load(name));
    return true;
  }

  public saveAll():boolean {
    if (!this.checkAndCreateDir()) return false;
    _.forIn(this.app.codes, (data, name) => {
      this.save(name, data);
    });
    _.forEach(_.difference(this.list(), _.keys(this.app.codes)), (name) => {
      this.unlink(name, "js");
    });
    return true;
  }

}
