import _ = require("lodash");
import * as log from "loglevel";

import {IColumn, ISheet} from "../service/hub.service";

export class RecordExtender {

  private records: {[pathStr: string]: any};
  private pathStrMeta: {[pathStr: string]: {isTemplate?: boolean}};
  private paths: string[];

  constructor(data: any[], private sheet: ISheet) {
    this.records = {};
    this.pathStrMeta = {};
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
      this.extendRecord(record);
    }
  }

  get(pathStr: string, fieldName: string): any {
    let record = this.getRecord(pathStr);
    if (record) {
      return record[fieldName];
    } else {
      return false;
    }
  }

  getRecord(pathStr: string): any {
    if (!pathStr) return undefined;
    if (this.records[pathStr]) {
      return this.records[pathStr];
    } else {
      return undefined;
    }
  }

  getRecords(): any[] {
    return _(this.records)
      .filter((_record, pathStr) => !this.pathStrMeta[pathStr].isTemplate)
      .map(record => {
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
    let keys: string[] = _(this.paths).map(path => record[path]).value();
    let pathStr: string = _(keys)
      .filter(key => key != "*")
      .map(key => key.replace(/^\*/, ""))
      .join(".");
    if (!this.pathStrMeta[pathStr]) this.pathStrMeta[pathStr] = {};
    if (pathStr != keys.join(".")) {
      this.pathStrMeta[pathStr].isTemplate = true;
    }
    return pathStr;
  }

  private extendRecord(record: any): any {
    let parentPathStr: string = record["extends"];
    if (!parentPathStr) return record;
    let parentRecord = this.getRecord(parentPathStr);
    if (parentRecord) {
      this.extendRecord(parentRecord);
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
