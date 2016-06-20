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
    if (sheetName != "root")
      super.save(sheetName, data);
    vue.set(this.app.sheetMetas[sheetName], "modified", false);
  }

  public newAll():void {
    this.app.sheets = {root: this.rootTemplate};
    this.app.sheetMetas = {
      root: {
        modified: false
      }
    };
    this.app.currentSheet = this.app.sheets["root"];
    this.app.currentSheetMeta = this.app.sheetMetas["root"];
    this.app.services.data.newAll();
    this.app.services.code.newAll();
  }

  protected get rootTemplate():ISheet {
    return {
      name: "root",
      columns: [],
      parent: "",
    };
  }

  public loadAll():boolean {
    if (!this.checkDir()) return false;
    this.newAll();
    let names:string[] = this.list();
    for (let name of names) {
      vue.set(this.app.sheets, name, this.load(name));
      vue.set(this.app.sheetMetas, name, {modified: false});
    }
    if (!this.app.services.data.loadAll()) return false;
    if (!this.app.services.code.loadAll()) return false;
    return true;
  }

  public saveAll():boolean {
    if (!this.checkAndCreateDir()) return false;
    _.forIn(this.app.sheets, (sheet, name) => {
      this.save(name, sheet);
    });
    _.forEach(_.difference(this.list(), _.keys(this.app.sheets)), (name) => {
      this.unlink(name);
    });
    if (!this.app.services.data.saveAll()) return false;
    if (!this.app.services.code.saveAll()) return false;
    return true;
  }

  public select(sheet:ISheet) {
    this.app.currentSheet = sheet;
    this.app.currentSheetMeta = this.app.sheetMetas[sheet.name];
    this.app.currentData = this.app.datas[sheet.name];
    this.app.currentCode = this.app.codes[sheet.name];
  }

  public add(sheetName:string, parentSheetName:string):boolean {
    if (_.has(this.app.sheets, sheetName)) {
      alert(`Sheet "${sheetName}" already exists.`);
      return false;
    }
    let emptySheet:ISheet = {
      name: sheetName,
      columns: this.app.services.column.generateInitialColumns(sheetName, parentSheetName),
      parent: parentSheetName,
    };
    vue.set(this.app.sheets, sheetName, emptySheet);
    vue.set(this.app.sheetMetas, sheetName, {modified: true});
    vue.set(this.app.datas, sheetName, _.times(10, () => {
      return {}
    }));
    vue.set(this.app.codes, sheetName, this.app.services.code.defaultCode);
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
    vue.set(this.app.sheetMetas, newSheetName, this.app.sheetMetas[oldSheetName]);
    vue.delete(this.app.sheetMetas, oldSheetName);
    vue.set(this.app.datas, newSheetName, this.app.datas[oldSheetName]);
    vue.delete(this.app.datas, oldSheetName);
    vue.set(this.app.codes, newSheetName, this.app.codes[oldSheetName]);
    vue.delete(this.app.codes, oldSheetName);
    return true;
  }

  public remove():void {
    if (!this.app.currentSheet) {
      alert(`No selected sheet.`);
      return;
    }
    if (_.some(this.app.sheets, (sheet:ISheet) => this.app.currentSheet.name == sheet.parent)) {
      alert(`Sheet "${this.app.currentSheet.name}" have child sheet, please move or delete it.`);
      return;
    }
    if (!confirm(`Are you sure to delete sheet:"${this.app.currentSheet.name}"?`)) {
      return;
    }
    let sheetName:string = this.app.currentSheet.name;
    vue.delete(this.app.sheets, sheetName);
    vue.delete(this.app.sheetMetas, sheetName);
    vue.delete(this.app.datas, sheetName);
    vue.delete(this.app.codes, sheetName);
    this.app.sheetMetas["root"].modified = true;
    this.app.currentSheet = this.app.sheets["root"];
    this.app.currentData = null;
    this.app.currentCode = this.app.codes["root"];
  }

  public isParentRecursive(target:ISheet, parent:ISheet):boolean {
    if (target.parent == parent.name) return true;
    if (!target.parent) return false;
    return this.isParentRecursive(this.app.sheets[target.parent], parent);
  }

  public loadAllForGenerate():{[sheetName:string]:ISheet} {
    let names:string[] = this.list();
    let result:{[sheetName:string]:ISheet} = {root: this.rootTemplate};
    for (let name of names) {
      result[_.camelCase(name)] = this.load(name);
    }
    return result;
  }

}
