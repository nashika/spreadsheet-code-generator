import _ = require("lodash");
import {injectable} from "inversify";
import Vue from "vue";

import {HubService, IColumn} from "./hub.service";
import {BaseHubService} from "./base-hub.service";

@injectable()
export class ColumnService extends BaseHubService {

  constructor(protected hubService: HubService) {
    super(hubService);
  }

  public add(index: number): void {
    let columns = this.$hub.currentSheet.columns;
    this.$hub.currentSheet.columns = _.concat(_.slice(columns, 0, index), [this.generateInitialEmptyColumn()], _.slice(columns, index));
    this.$hub.currentSheetMeta.modified = true;
  }

  public modify(index: number, column: IColumn): void {
    if (this.$hub.currentSheet.columns[index].data != column.data
      && _.find(this.$hub.currentSheet.columns, {"data": column.data})) {
      alert(`data="${column.data}" is already exists.`);
      return;
    }
    let oldColumn: IColumn = this.$hub.currentSheet.columns[index];
    if (column.data != oldColumn.data) {
      for (let record of this.$hub.currentData) {
        Vue.set(record, column.data, record[oldColumn.data]);
        Vue.delete(record, oldColumn.data);
      }
    }
    if (column.type != "select") Vue.delete(column, "options");
    if (!_.includes(["text", "select"], column.type)) Vue.delete(column, "json");
    Vue.set(this.$hub.currentSheet.columns, index, column);
    this.$hub.currentSheetMeta.modified = true;
  }

  public move(index: number, right: boolean): void {
    let columns: IColumn[] = this.$hub.currentSheet.columns;
    if (right) {
      this.$hub.currentSheet.columns = _.concat(
        _.take(columns, index), [columns[index + 1], columns[index]], _.takeRight(columns, columns.length - index - 2));
    } else {
      this.$hub.currentSheet.columns = _.concat(
        _.take(columns, index - 1), [columns[index], columns[index - 1]], _.takeRight(columns, columns.length - index - 1));
    }
    this.$hub.currentSheetMeta.modified = true;
  }

  public remove(index: number): void {
    Vue.delete(this.$hub.currentSheet.columns, index);
    this.$hub.sheetMetas[this.$hub.currentSheet.name].modified = true;
  }

  public freeze(index: number): void {
    this.$hub.currentSheet.freezeColumn = index;
    this.$hub.currentSheetMeta.modified = true;
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
    let parentSheet = this.$hub.sheets[parentSheetName];
    let sheetColumn: IColumn = {
      header: _.startCase(sheetName),
      data: _.camelCase(sheetName),
      type: "text",
      width: 120,
    };
    return _.concat(this.generateInitialTreeColumns(parentSheet.name, parentSheet.parent), [sheetColumn])
  }

  protected generateInitialEmptyColumn(no: number = undefined): IColumn {
    no = _.isUndefined(no) ? this.$hub.currentSheet.columns.length : no;
    return {
      header: `Col${no}`,
      data: `data${no}`,
      type: "text",
      width: 80,
    };
  }

}