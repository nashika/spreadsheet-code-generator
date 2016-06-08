import * as fs from "fs";

import _ = require("lodash");

import {ISheetDefinition, app} from "../component/app-component";
import {BaseIoService} from "./base-io-service";

export class SheetIoService extends BaseIoService {

  constructor() {
    super("sheet");
    this.reload();
  }

  public load(sheetName:string):ISheetDefinition {
    return super.load(sheetName);
  }

  public save(sheetName:string, data:ISheetDefinition) {
    super.save(sheetName, data);
  }

  public add(sheetName:string, parentSheetName:string = null) {
    if (!sheetName) {
      alert(`Sheet name is empty.`);
      return;
    }
    if (_.includes(app.$data.sheetNames, sheetName)) {
      alert(`Sheet "${sheetName}" already exists.`);
      return;
    }
    let emptyData:ISheetDefinition = {
      columns: [],
      colHeaders: [],
    };
    this.save(sheetName, emptyData);
    this.reload();
  }

  public remove(sheetName:string):void {
    if (!sheetName) {
      alert(`No selected sheet.`);
      return;
    }
    if (!confirm(`Are you sure to delete sheet:"${sheetName}"?`)) {
      return;
    }
    super.remove(sheetName);
    app.$data.services.dataIo.remove(sheetName);
    this.reload();
  }

  private reload():void {
    let sheetFiles:string[] = fs.readdirSync(this.saveDir);
    while (app.$data.sheetNames.length > 0) app.$data.sheetNames.pop();
    for (let sheetFile of sheetFiles) app.$data.sheetNames.push(sheetFile.replace(/\.json$/, ""));
  }

}
