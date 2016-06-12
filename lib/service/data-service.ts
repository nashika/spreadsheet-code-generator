import Vue = vuejs.Vue;
import _ = require("lodash");

import {IoService} from "./io-service";

export class DataService extends IoService {

  protected static DIR_NAME:string = "data";

  protected load(sheetName:string):any[] {
    let data:any[] = super.load(sheetName);
    return data ? data : [];
  }

  protected save(sheetName:string, data:any[]) {
    data = data.map((record) => {
      record = <any>_.omitBy(record, _.isNull);
      record = <any>_.omitBy(record, _.isUndefined);
      record = <any>_.omitBy(record, (value) => value === "");
      record = _.pick(record, _.map(this.app.sheets[sheetName].columns, "data"));
      return record;
    });
    super.save(sheetName, data);
  }

  public newAll():void {
    this.app.datas = {};
    this.app.currentData = null;
  }
  
  public loadAll():boolean {
    if (!this.checkDir()) return false;
    let names:string[] = this.list();
    for (let name of names)
      this.app.datas[name] = this.load(name);
    return true;
  }

  public saveAll():boolean {
    if (!this.checkAndCreateDir()) return false;
    _.forIn(this.app.datas, (data, name) => {
      this.save(name, data);
    });
    _.forEach(_.difference(this.list(), _.keys(this.app.datas)), (name) => {
      this.unlink(name);
    });
    return true;
  }

}
