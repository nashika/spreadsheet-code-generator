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

  public newAll():void {
    this.app.sheets = {
      root: {
        name: "root",
        columns: [],
        parent: "",
      }
    };
    this.app.sheetMetas = {
      root: {
        modified: false
      }
    };
    this.app.currentSheet = this.app.sheets["root"];
    this.app.currentSheetMeta = this.app.sheetMetas["root"];
    this.app.services.data.newAll();
  }

  public loadAll():boolean {
    if (!this.checkDir()) return false;
    this.newAll();
    let names:string[] = this.list();
    for (let name of names) {
      vue.set(this.app.sheets, name, this.load(name));
      vue.set(this.app.sheetMetas, name, {modified: false});
    }
    this.app.services.data.loadAll();
    return true;
  }

  public saveAll():boolean {
    if (!this.checkAndCreateDir()) return false;
    _.forIn(this.app.sheets, (sheet, name) => {
      if (name == "root") return;
      this.save(name, sheet);
    });
    _.forEach(_.difference(this.list(), _.keys(this.app.sheets)), (name) => {
      this.unlink(name);
    });
    return this.app.services.data.saveAll();
  }

  public select(sheet:ISheet) {
    this.app.currentSheet = sheet;
    this.app.currentSheetMeta = this.app.sheetMetas[sheet.name];
    this.app.currentData = this.app.datas[sheet.name];
  }

  public add(sheetName:string, parentSheetName:string):boolean {
    if (_.has(this.app.sheets, sheetName)) {
      alert(`Sheet "${sheetName}" already exists.`);
      return false;
    }
    let emptySheet:ISheet = {
      name: sheetName,
      columns: _.times(5, this.app.services.column.generateInitialColumn),
      parent: parentSheetName,
    };
    vue.set(this.app.sheets, sheetName, emptySheet);
    vue.set(this.app.datas, sheetName, _.times(10, () => {return {}}));
    vue.set(this.app.sheetMetas, sheetName, {modified: true});
    return true;
  }

  public edit(oldSheetName:string, newSheetName:string, parentSheetName:string):boolean {
    if (oldSheetName != newSheetName && _.has(this.app.sheets, newSheetName)) {
      alert(`Sheet "${newSheetName}" already exists.`);
      return false;
    }
    this.app.sheets[oldSheetName].name = newSheetName;
    this.app.sheets[oldSheetName].parent = parentSheetName;
    this.app.sheetMetas[oldSheetName].modified = true;
    if (newSheetName == oldSheetName) return true;
    _.forIn(this.app.sheets, (sheet:ISheet) => {
      if (sheet.parent == oldSheetName)
        sheet.parent = newSheetName;
    });
    vue.set(this.app.sheets, newSheetName, this.app.sheets[oldSheetName]);
    vue.delete(this.app.sheets, oldSheetName);
    vue.set(this.app.datas, newSheetName, this.app.datas[oldSheetName]);
    vue.delete(this.app.datas, oldSheetName);
    vue.set(this.app.sheetMetas, newSheetName, this.app.sheetMetas[oldSheetName]);
    vue.delete(this.app.sheetMetas, oldSheetName);
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
    vue.delete(this.app.sheets, sheetName);
    vue.delete(this.app.sheetMetas, sheetName);
    vue.delete(this.app.datas, sheetName);
    this.app.currentSheet = this.app.sheets["root"];
    this.app.currentData = null;
  }

}
