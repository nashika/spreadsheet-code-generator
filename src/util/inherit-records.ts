import _ = require("lodash");
import {IColumn} from "../component/app-component";

export class InheritRecords {

  paths: string[];
  records: {[key: string]: any};

  constructor(records: any[], columns: IColumn[]) {
    this.records = {};
    let flag = true;
    this.paths = _(columns)
      .filter((column: IColumn) => (column.data == "extends") ? flag = false : flag)
      .map(column => column.data)
      .value();
    if (!_.find(columns, (column: IColumn) => column.data == "extends")) return;
    _.each(records, record => {
      if (_.find(this.paths, path => !record[path])) return;
      let key: string = _(this.paths)
        .map(path => record[path])
        .join(".");
      this.records[key] = _.cloneDeep(record);
    });
    delete this.records[_(this.paths).map(p => "*").join(".")];
    _.each(this.records, record => this.applyInherit(record));
  }

  get(extendsStr: string, fieldName: string): any {
    if (!extendsStr) return undefined;
    let inheritKey: string = this.padInheritKey(extendsStr);
    let inheritRecord = this.records[inheritKey];
    if (inheritRecord) {
      return _.get(inheritRecord, fieldName);
    } else {
      return false;
    }
  }

  private padInheritKey(inheritKey: string): string {
    let wildcardCount: number = this.paths.length - _.split(inheritKey, ".").length;
    if (wildcardCount)
      inheritKey = _.times(wildcardCount, _.constant("*")).join(".") + "." + inheritKey;
    return inheritKey;
  }

  private applyInherit(record: any): any {
    let extendsStr: string = record["extends"];
    if (!extendsStr) return record;
    let parentInheritKey = this.padInheritKey(extendsStr);
    if (this.records[parentInheritKey]) {
      let parentRecord = this.applyInherit(this.records[parentInheritKey]);
      _.defaults(record, parentRecord);
      delete record["extends"];
      return record;
    } else {
      //throw new Error();
    }
  }

}
