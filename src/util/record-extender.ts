import _ from "lodash";

import { IColumn, ISheet } from "~/src/store/sheet";
import { logger } from "~/src/logger";

export class RecordExtender {
  lastPathField: string;

  readonly records: { [pathStr: string]: any };
  readonly pathStrMeta: {
    [pathStr: string]: { isTemplate?: boolean; isExtended?: boolean };
  };

  readonly pathFields: string[];

  constructor(private sheet: ISheet) {
    this.records = {};
    this.pathStrMeta = {};
    let flag = true;
    this.pathFields = _(this.sheet.columns)
      .filter((column: IColumn) =>
        column.data === "extends" ? (flag = false) : flag
      )
      .map((column) => column.data)
      .value();
    this.lastPathField = this.pathFields[this.pathFields.length - 1];
    if (
      this.sheet.name !== "root" &&
      !_.find(
        this.sheet.columns,
        (column: IColumn) => column.data === "extends"
      )
    )
      throw new Error(`${this.sheet.name} sheet has no "extends" column.`);
    for (const dataRecord of sheet.data) {
      const pathStr = this.makePathStr(dataRecord);
      if (!pathStr) continue;
      const result: any = {};
      for (const column of this.sheet.columns) {
        if (_.has(dataRecord, column.data)) {
          _.set(result, column.data, _.get(dataRecord, column.data));
        }
      }
      this.records[pathStr] = result;
    }
    for (const record of _.values(this.records)) {
      this.extendRecord(record);
    }
  }

  get(pathStr: string, fieldName: string): any {
    const record = this.getRecord(pathStr);
    if (record) {
      return _.get(record, fieldName);
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
      .map((record) => {
        const result: any = {};
        for (const column of this.sheet.columns) {
          if (!_.has(record, column.data)) continue;
          _.set(result, column.data, _.get(record, column.data));
        }
        delete result.extends;
        return result;
      })
      .value();
  }

  private makePathStr(record: any): string {
    if (_.find(this.pathFields, (path) => !record[path])) return "";
    const keys: string[] = _(this.pathFields)
      .map((path) => record[path])
      .value();
    const pathStr: string = _(keys)
      .filter((key) => key !== "*")
      .map((key) => key.replace(/^\*/, ""))
      .join(".");
    if (!this.pathStrMeta[pathStr]) this.pathStrMeta[pathStr] = {};
    if (pathStr !== keys.join(".")) {
      this.pathStrMeta[pathStr].isTemplate = true;
    }
    return pathStr;
  }

  extendRecord(record: any): void {
    const pathStr: string = this.makePathStr(record);
    if (!pathStr) return;
    if (this.pathStrMeta[pathStr].isExtended) return;
    const parentPathStr: string = record.extends;
    if (parentPathStr) {
      let parentRecord = this.getRecord(parentPathStr);
      if (!parentRecord)
        parentRecord = this.getRecord(
          parentPathStr + "." + record[this.lastPathField]
        );
      if (parentRecord) {
        this.extendRecord(parentRecord);
        for (const column of this.sheet.columns) {
          const key: string = column.data;
          if (
            (!_.has(record, key) || _.get(record, key) === "") &&
            _.has(parentRecord, key)
          ) {
            _.set(record, key, _.get(parentRecord, key));
          }
        }
      } else {
        logger.warn(
          `Parent record key="${parentPathStr}" not found. sheet="${
            this.sheet.name
          }", path="${this.makePathStr(record)}"`
        );
      }
    }
    this.pathStrMeta[pathStr].isExtended = true;
  }
}
