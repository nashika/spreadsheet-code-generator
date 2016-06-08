import Vue = vuejs.Vue;

import {BaseIoService} from "./base-io-service";

export class DataIoService extends BaseIoService {

  constructor(app:Vue) {
    super(app, "data");
  }

  public load(sheetName:string):any[] {
    let data:any[] = super.load(sheetName);
    return data ? data : [];
  }

  public save(sheetName:string, data:any[]) {
    super.save(sheetName, data);
  }

}
