import Vue = vuejs.Vue;
import _ = require("lodash");

import {IoService} from "./io-service";
import {AppComponent} from "../component/app-component";

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
      return record;
    });
    super.save(sheetName, data);
  }

  public loadAll():void {
    this.app.datas = {};
    let names:string[] = this.list();
    for (let name of names)
      this.app.datas[name] = this.load(name);
  }

  public saveAll():void {
    _.forIn(this.app.datas, (data, name) => {
      this.save(name, data);
    });
    _.forEach(_.difference(this.list(), _.keys(this.app.datas)), (name) => {
      this.unlink(name);
    });
  }

}
