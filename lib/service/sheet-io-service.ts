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
    let emptyData:ISheetDefinition = {
      name: sheetName,
      columns: [],
    };
    this.save(sheetName, emptyData);
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
    let no:number = this.app.currentSheetDefinition.columns.length;
    this.app.currentSheetDefinition.columns.push({
      header: `Col${no}`,
      data: `data${no}`,
      type: "text",
      width: 80,
    });
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
    //this.app.currentSheetDefinition.
  }

  private reload(saveFlag:boolean = true):void {
    let sheetFiles:string[] = fs.readdirSync(this.saveDir);
    while (this.app.sheetNames.length > 0) this.app.sheetNames.pop();
    for (let sheetFile of sheetFiles) this.app.sheetNames.push(sheetFile.replace(/\.json$/, ""));
    this.$root.$broadcast("before-change-sheet", this.app.currentSheetDefinition && this.app.currentSheetDefinition.name, saveFlag);
  }

}
