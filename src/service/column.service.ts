import _ = require("lodash");
import vue = require("vue");

import {BaseService} from "./base.service";
import {IColumn} from "../component/app.component";

export class ColumnService extends BaseService {

  public add(index: number): void {
    let columns = this.app.currentSheet.columns;
    this.app.currentSheet.columns = _.concat(_.slice(columns, 0, index), [this.generateInitialEmptyColumn()], _.slice(columns, index));
    this.app.currentSheetMeta.modified = true;
  }

  public modify(index: number, column: IColumn): void {
    if (this.app.currentSheet.columns[index].data != column.data
      && _.find(this.app.currentSheet.columns, {"data": column.data})) {
      alert(`data="${column.data}" is already exists.`);
      return;
    }
    let oldColumn: IColumn = this.app.currentSheet.columns[index];
    if (column.data != oldColumn.data) {
      for (let record of this.app.currentData) {
        vue.set(record, column.data, record[oldColumn.data]);
        vue.delete(record, oldColumn.data);
      }
    }
    if (column.type != "select") vue.delete(column, "options");
    if (!_.includes(["text", "select"], column.type)) vue.delete(column, "json");
    this.app.currentSheet.columns.$set(index, column);
    this.app.currentSheetMeta.modified = true;
  }

  public move(index: number, right: boolean): void {
    let columns: IColumn[] = this.app.currentSheet.columns;
    if (right) {
      this.app.currentSheet.columns = _.concat(
        _.take(columns, index), [columns[index + 1], columns[index]], _.takeRight(columns, columns.length - index - 2));
    } else {
      this.app.currentSheet.columns = _.concat(
        _.take(columns, index - 1), [columns[index], columns[index - 1]], _.takeRight(columns, columns.length - index - 1));
    }
    this.app.currentSheetMeta.modified = true;
  }

  public remove(index: number): void {
    this.app.currentSheet.columns.$remove(this.app.currentSheet.columns[index]);
    this.app.sheetMetas[this.app.currentSheet.name].modified = true;
  }

  public freeze(index: number): void {
    this.app.currentSheet.freezeColumn = index;
    this.app.currentSheetMeta.modified = true;
  }

  public generateInitialColumns(sheetName: string, parentSheetName: string): IColumn[] {
    let treeColumns: IColumn[] = this.generateInitialTreeColumns(sheetName, parentSheetName);
    let extendsColumns: IColumn[] = [{
      header: "Extends",
      data: "extends",
      type: "text",
      width: 120,
    }];
    let emptyColumns: IColumn[] = _.times(5, this.generateInitialEmptyColumn);
    return _.concat(treeColumns, extendsColumns, emptyColumns);
  }

  protected generateInitialTreeColumns(sheetName: string, parentSheetName: string): IColumn[] {
    if (sheetName == "root") return [];
    let parentSheet = this.app.sheets[parentSheetName];
    let sheetColumn: IColumn = {
      header: _.startCase(sheetName),
      data: _.camelCase(sheetName),
      type: "text",
      width: 120,
    };
    return _.concat(this.generateInitialTreeColumns(parentSheet.name, parentSheet.parent), [sheetColumn])
  }

  protected generateInitialEmptyColumn(no: number = undefined): IColumn {
    no = _.isUndefined(no) ? this.app.currentSheet.columns.length : no;
    return {
      header: `Col${no}`,
      data: `data${no}`,
      type: "text",
      width: 80,
    };
  }

}
