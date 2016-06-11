import path = require("path");

import _ = require("lodash");
import electron = require("electron");

import {ISheet, AppComponent} from "../component/app-component";
import {IoService} from "./io-service";

export class SheetService extends IoService {

  protected static DIR_NAME:string = "sheet";

  protected load(sheetName:string):ISheet {
    return super.load(sheetName);
  }

  protected save(sheetName:string, data:ISheet) {
    super.save(sheetName, data);
  }

  public saveAll():void {
    if (!this.checkAndCreateDir()) return;
    _.forIn(this.app.sheets, (sheet, name) => {
      this.save(name, sheet);
    });
    _.forEach(_.difference(this.list(), _.keys(this.app.sheets)), (name) => {
      this.unlink(name);
    });
    this.app.services.data.saveAll();
  }

  public loadAll():void {
    if (!this.checkDir()) return;
    this.app.sheets = {};
    let names:string[] = this.list();
    for (let name of names)
      this.app.sheets[name] = this.load(name);
    this.app.currentSheet = null;
    this.app.services.data.loadAll();
  }

  public select(sheet:ISheet) {
    this.app.currentSheet = sheet;
    this.app.currentData = this.app.datas[sheet.name];
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
    if (_.has(this.app.sheets, sheetName)) {
      alert(`Sheet "${sheetName}" already exists.`);
      return;
    }
    let emptySheet:ISheet = {
      name: sheetName,
      columns: _.times(5, this.app.services.column.generateInitialColumn),
    };
    this.app.sheets = <any>_.assign({}, this.app.sheets, _.fromPairs([[sheetName, emptySheet]]));
    this.app.datas[sheetName] = (_.times(10, () => {return {}}));
  }

  public remove():void {
    if (!this.app.currentSheet) {
      alert(`No selected sheet.`);
      return;
    }
    if (!confirm(`Are you sure to delete sheet:"${this.app.currentSheet.name}"?`)) {
      return;
    }
    _.unset(this.app.sheets, this.app.currentSheet.name);
    _.unset(this.app.datas, this.app.currentSheet.name);
    this.app.sheets = <any>_.assign({}, this.app.sheets);
    this.app.datas = <any>_.assign({}, this.app.datas);
    this.app.currentSheet = null;
    this.app.currentData = null;
  }

}
