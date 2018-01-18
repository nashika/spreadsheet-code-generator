import _ = require("lodash");
import * as log from "loglevel";

import {IColumn, ISheet} from "../service/hub.service";

export class InheritRecords {

  private records: {[key: string]: any};
  private paths: string[];

  constructor(data: any[], private sheet: ISheet) {
    this.records = {};
    let flag = true;
    this.paths = _(this.sheet.columns)
      .filter((column: IColumn) => (column.data == "extends") ? flag = false : flag)
      .map(column => column.data)
      .value();
    if (this.sheet.name != "root" && !_.find(this.sheet.columns, (column: IColumn) => column.data == "extends"))
      throw new Error(`${this.sheet.name} sheet has no "extends" column.`);
    for (let dataRecord of data) {
      let pathStr = this.makePathStr(dataRecord);
      if (!pathStr) continue;
      let result: any = {};
      for (let column of this.sheet.columns) {
        if (_.has(dataRecord, column.data)) {
          _.set(result, column.data, _.get(dataRecord, column.data));
        }
      }
      this.records[pathStr] = result;
    }
    for (let record of _.values(this.records)) {
      this.applyInherit(record);
    }
  }

  get(pathStr: string, fieldName: string): any {
    if (!pathStr) return undefined;
    pathStr = this.padPathStr(pathStr);
    let inheritRecord = this.records[pathStr];
    if (inheritRecord) {
      return _.get(inheritRecord, fieldName);
    } else {
      return false;
    }
  }

  getRecords(): any[] {
    return _(this.records).filter((_value, key) => !key.match(/\*/)).map(record => {
      let result: any = {};
      for (let column of this.sheet.columns) {
        if (!_.has(record, column.data)) continue;
        _.set(result, column.data, _.get(record, column.data));
      }
      return result;
    }).value();
  }

  private makePathStr(record: any): string {
    if (_.find(this.paths, path => !record[path])) return "";
    return _(this.paths).map(path => record[path]).join(".");
  }

  private padPathStr(pathStr: string): string {
    let wildcardCount: number = this.paths.length - _.split(pathStr, ".").length;
    if (wildcardCount)
      pathStr = _.times(wildcardCount, _.constant("*")).join(".") + "." + pathStr;
    return pathStr;
  }

  private applyInherit(record: any): any {
    let extendsStr: string = record["extends"];
    if (!extendsStr) return record;
    let parentPathStr = this.padPathStr(extendsStr);
    if (this.records[parentPathStr]) {
      let parentRecord = this.applyInherit(this.records[parentPathStr]);
      for (let column of this.sheet.columns) {
        let key: string = column.data;
        if (!_.has(record, key) && _.has(parentRecord, key)) {
          _.set(record, key, _.get(parentRecord, key));
        }
      }
      delete record["extends"];
      return record;
    } else {
      log.warn(`Parent record key="${parentPathStr}" not found. sheet="${this.sheet.name}", path="${this.makePathStr(record)}"`);
    }
  }

}
