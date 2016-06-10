import * as fs from "fs";

import _ = require("lodash");
import Vue = vuejs.Vue;

import {ISheetDefinition, AppComponent, IColumnDefinition} from "../component/app-component";
import {BaseIoService} from "./base-io-service";

export class SheetIoService extends BaseIoService {

  constructor(app:AppComponent) {
    super(app, "sheet");
    this.reload();
  }

  public load(sheetName:string):ISheetDefinition {
    return super.load(sheetName);
  }

  public save(sheetName:string, data:ISheetDefinition) {
    super.save(sheetName, data);
  }

  public add(sheetName:string) {
    let parentSheetName:string = this.app.currentSheetDefinition && this.app.currentSheetDefinition.name;
    if (!parentSheetName) {
      alert(`Parent sheet not selected.`);
      return ;
    }
    if (!sheetName) {
      alert(`Sheet name is empty.`);
      return;
    }
    if (_.includes(this.app.sheetNames, sheetName)) {
      alert(`Sheet "${sheetName}" already exists.`);
      return;
    }
    let emptySheet:ISheetDefinition = {
      name: sheetName,
      columns: _.times(5, this.generateInitialColumn),
    };
    let emptyData:any[] = _.times(10, () => {return {}});
    this.save(sheetName, emptySheet);
    this.app.services.dataIo.save(sheetName, emptyData);
    this.reload();
  }

  public remove():void {
    let sheetName:string = this.app.currentSheetDefinition && this.app.currentSheetDefinition.name;
    if (!sheetName) {
      alert(`No selected sheet.`);
      return;
    }
    if (!confirm(`Are you sure to delete sheet:"${sheetName}"?`)) {
      return;
    }
    super.remove(sheetName);
    this.app.services.dataIo.remove(sheetName);
    this.app.currentSheetDefinition = null;
    this.reload(false);
  }

  public addColumn():void {
    this.app.currentSheetDefinition.columns.push(this.generateInitialColumn());
    this.save(this.app.currentSheetDefinition.name, this.app.currentSheetDefinition);
    this.reload();
  }

  public saveColumn(index:number, column:IColumnDefinition):void {
    if (this.app.currentSheetDefinition.columns[index].data != column.data
      && _.find(this.app.currentSheetDefinition.columns, {"data": column.data})) {
      alert(`data="${column.data}" is already exists.`);
      return;
    }
    this.app.currentSheetDefinition.columns[index] = column;
    this.save(this.app.currentSheetDefinition.name, this.app.currentSheetDefinition);
    this.reload();
  }

  public moveColumn(index:number, right:boolean):void {
    let columns:IColumnDefinition[] = this.app.currentSheetDefinition.columns;
    if (right) {
      this.app.currentSheetDefinition.columns = _.concat(
        _.take(columns, index), [columns[index + 1], columns[index]], _.takeRight(columns, columns.length - index - 2));
    } else {
      this.app.currentSheetDefinition.columns = _.concat(
        _.take(columns, index - 1), [columns[index], columns[index - 1]], _.takeRight(columns, columns.length - index - 1));
    }
    this.save(this.app.currentSheetDefinition.name, this.app.currentSheetDefinition);
    this.reload();
  }

  private reload(saveFlag:boolean = true):void {
    let sheetFiles:string[] = fs.readdirSync(this.saveDir);
    while (this.app.sheetNames.length > 0) this.app.sheetNames.pop();
    for (let sheetFile of sheetFiles) this.app.sheetNames.push(sheetFile.replace(/\.json$/, ""));
    this.$root.$broadcast("before-change-sheet", this.app.currentSheetDefinition && this.app.currentSheetDefinition.name, saveFlag);
  }

  private generateInitialColumn(no:number = null):IColumnDefinition {
    no = _.isUndefined(no) ? this.app.currentSheetDefinition.columns.length : no;
    return {
      header: `Col${no}`,
      data: `data${no}`,
      type: "text",
      width: 80,
    };
  }

}
