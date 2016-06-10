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

  protected load(sheetName:string):ISheet {
    return super.load(sheetName);
  }

  protected save(sheetName:string, data:ISheet) {
    super.save(sheetName, data);
  }

  public saveAll():void {
    //super.remove(sheetName);
  }

  public loadAll():void {
    this.app.sheets = {};
    let names:string[] = this.list();
    for (let name of names)
      this.app.sheets[name] = this.load(name);
    this.app.services.data.loadAll();
    this.reload();
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
    this.reload();
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
    this.app.sheets = <any>_.assign({}, this.app.sheets);
    this.app.currentSheet = null;
    this.reload();
  }

  public reload():void {
    this.$root.$broadcast("before-change-sheet", this.app.currentSheet && this.app.currentSheet.name);
  }

}
