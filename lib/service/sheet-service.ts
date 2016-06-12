import path = require("path");

import _ = require("lodash");
import electron = require("electron");
import vue = require("vue");

import {ISheet} from "../component/app-component";
import {IoService} from "./io-service";

export class SheetService extends IoService {

  protected static DIR_NAME:string = "sheet";

  protected load(sheetName:string):ISheet {
    return super.load(sheetName);
  }

  protected save(sheetName:string, data:ISheet) {
    super.save(sheetName, data);
    vue.set(this.app.sheetMetas[sheetName], "modified", false);
  }

  public saveAll():boolean {
    if (!this.checkAndCreateDir()) return false;
    _.forIn(this.app.sheets, (sheet, name) => {
      this.save(name, sheet);
    });
    _.forEach(_.difference(this.list(), _.keys(this.app.sheets)), (name) => {
      this.unlink(name);
    });
    return this.app.services.data.saveAll();
  }

  public loadAll():boolean {
    if (!this.checkDir()) return false;
    this.app.sheets = {};
    this.app.sheetMetas = {};
    let names:string[] = this.list();
    for (let name of names) {
      vue.set(this.app.sheets, name, this.load(name));
      vue.set(this.app.sheetMetas, name, {modified: false});
    }
    this.app.currentSheet = null;
    this.app.currentSheetMeta = null;
    this.app.services.data.loadAll();
    return true;
  }

  public select(sheet:ISheet) {
    this.app.currentSheet = sheet;
    this.app.currentSheetMeta = this.app.sheetMetas[sheet.name];
    this.app.currentData = this.app.datas[sheet.name];
  }

  public add(sheetName:string):boolean {
    let parentSheetName:string = this.app.currentSheet && this.app.currentSheet.name;
    if (!parentSheetName) {
      alert(`Parent sheet not selected.`);
      return true;
    }
    if (!sheetName) {
      alert(`Sheet name is empty.`);
      return false;
    }
    if (_.has(this.app.sheets, sheetName)) {
      alert(`Sheet "${sheetName}" already exists.`);
      return false;
    }
    let emptySheet:ISheet = {
      name: sheetName,
      columns: _.times(5, this.app.services.column.generateInitialColumn),
      parent: parentSheetName,
      children: [],
    };
    vue.set(this.app.sheets, sheetName, emptySheet);
    vue.set(this.app.datas, sheetName, _.times(10, () => {return {}}));
    vue.set(this.app.sheetMetas, sheetName, {modified: true});
    this.app.sheets[parentSheetName].children.push(sheetName);
    this.app.sheetMetas[parentSheetName].modified = true;
    return true;
  }

  public remove():void {
    if (!this.app.currentSheet) {
      alert(`No selected sheet.`);
      return;
    }
    if (!confirm(`Are you sure to delete sheet:"${this.app.currentSheet.name}"?`)) {
      return;
    }
    let sheetName:string = this.app.currentSheet.name;
    let parentSheetName:string = this.app.currentSheet.parent;
    vue.delete(this.app.sheets, sheetName);
    vue.delete(this.app.sheetMetas, sheetName);
    vue.delete(this.app.datas, sheetName);
    this.app.currentSheet = null;
    this.app.currentData = null;
    this.app.sheets[parentSheetName].children.$remove(sheetName);
    this.app.sheetMetas[parentSheetName].modified = true;
  }

}
