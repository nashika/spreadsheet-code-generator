import * as fs from "fs";

import _ = require("lodash");
import Vue = vuejs.Vue;

import {ISheet, AppComponent, IColumn} from "../component/app-component";
import {IoService} from "./io-service";

export class SheetService extends IoService {

  constructor(app:AppComponent) {
    super(app, "sheet");
    this.reload();
  }

  public load(sheetName:string):ISheet {
    return super.load(sheetName);
  }

  public save(sheetName:string, data:ISheet) {
    super.save(sheetName, data);
  }

  public add(sheetName:string) {
    let parentSheetName:string = this.app.currentSheet && this.app.currentSheet.name;
    if (!parentSheetName) {
      alert(`Parent sheet not selected.`);
      return ;
    }
    if (!sheetName) {
      alert(`Sheet name is empty.`);
      return;
    }
    if (_.find(this.app.sheets, {"name": sheetName})) {
      alert(`Sheet "${sheetName}" already exists.`);
      return;
    }
    let emptySheet:ISheet = {
      name: sheetName,
      columns: _.times(5, this.app.services.column.generateInitialColumn),
    };
    let emptyData:any[] = _.times(10, () => {return {}});
    this.save(sheetName, emptySheet);
    this.app.services.data.save(sheetName, emptyData);
    this.reload();
  }

  public remove():void {
    let sheetName:string = this.app.currentSheet && this.app.currentSheet.name;
    if (!sheetName) {
      alert(`No selected sheet.`);
      return;
    }
    if (!confirm(`Are you sure to delete sheet:"${sheetName}"?`)) {
      return;
    }
    super.remove(sheetName);
    this.app.services.data.remove(sheetName);
    this.app.currentSheet = null;
    this.reload(false);
  }

  public reload(saveFlag:boolean = true):void {
    let sheetFiles:string[] = fs.readdirSync(this.saveDir);
    while (this.app.sheets.length > 0) this.app.sheets.pop();
    for (let sheetFile of sheetFiles)
      this.app.sheets.push(this.load(sheetFile.replace(/\.json$/, "")));
    this.$root.$broadcast("before-change-sheet", this.app.currentSheet && this.app.currentSheet.name, saveFlag);
  }

}
