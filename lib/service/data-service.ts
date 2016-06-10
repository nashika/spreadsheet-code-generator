import Vue = vuejs.Vue;

import {IoService} from "./io-service";
import {AppComponent} from "../component/app-component";

export class DataService extends IoService {

  constructor(app:AppComponent) {
    super(app, "data");
  }

  protected load(sheetName:string):any[] {
    let data:any[] = super.load(sheetName);
    return data ? data : [];
  }

  protected save(sheetName:string, data:any[]) {
    super.save(sheetName, data);
  }

  public loadAll():void {
    this.app.datas = {};
    let names:string[] = this.list();
    for (let name of names)
      this.app.datas[name] = this.load(name);
  }

}
