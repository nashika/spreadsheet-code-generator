import * as fs from "fs";

import _ = require("lodash");
import Vue = vuejs.Vue;

import {ISheet, AppComponent, IColumn} from "../component/app-component";
import {BaseIoService} from "./base-io-service";

export class SheetIoService extends BaseIoService {

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
      columns: _.times(5, this.generateInitialColumn),
    };
    let emptyData:any[] = _.times(10, () => {return {}});
    this.save(sheetName, emptySheet);
    this.app.services.dataIo.save(sheetName, emptyData);
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
    this.app.services.dataIo.remove(sheetName);
    this.app.currentSheet = null;
    this.reload(false);
  }

  public addColumn():void {
    this.app.currentSheet.columns.push(this.generateInitialColumn());
    this.save(this.app.currentSheet.name, this.app.currentSheet);
    this.reload();
  }

  public saveColumn(index:number, column:IColumn):void {
    if (this.app.currentSheet.columns[index].data != column.data
      && _.find(this.app.currentSheet.columns, {"data": column.data})) {
      alert(`data="${column.data}" is already exists.`);
      return;
    }
    this.app.currentSheet.columns[index] = column;
    this.save(this.app.currentSheet.name, this.app.currentSheet);
    this.reload();
  }

  public moveColumn(index:number, right:boolean):void {
    let columns:IColumn[] = this.app.currentSheet.columns;
    if (right) {
      this.app.currentSheet.columns = _.concat(
        _.take(columns, index), [columns[index + 1], columns[index]], _.takeRight(columns, columns.length - index - 2));
    } else {
      this.app.currentSheet.columns = _.concat(
        _.take(columns, index - 1), [columns[index], columns[index - 1]], _.takeRight(columns, columns.length - index - 1));
    }
    this.save(this.app.currentSheet.name, this.app.currentSheet);
    this.reload();
  }

  private reload(saveFlag:boolean = true):void {
    let sheetFiles:string[] = fs.readdirSync(this.saveDir);
    while (this.app.sheets.length > 0) this.app.sheets.pop();
    for (let sheetFile of sheetFiles)
      this.app.sheets.push(this.load(sheetFile.replace(/\.json$/, "")));
    this.$root.$broadcast("before-change-sheet", this.app.currentSheet && this.app.currentSheet.name, saveFlag);
  }

  private generateInitialColumn(no:number = null):IColumn {
    no = _.isUndefined(no) ? this.app.currentSheet.columns.length : no;
    return {
      header: `Col${no}`,
      data: `data${no}`,
      type: "text",
      width: 80,
    };
  }

}
