import _ = require("lodash");
import {injectable} from "inversify";
import {Vue} from "vue/types/vue";

import {BaseService} from "./base.service";
import {HubService, IColumn} from "./hub.service";

@injectable()
export class ColumnService extends BaseService {

  constructor(protected hubService: HubService) {
    super();
  }

  public add(index: number): void {
    let columns = this.hubService.$vm.currentSheet.columns;
    this.hubService.$vm.currentSheet.columns = _.concat(_.slice(columns, 0, index), [this.generateInitialEmptyColumn()], _.slice(columns, index));
    this.hubService.$vm.currentSheetMeta.modified = true;
  }

  public modify(index: number, column: IColumn): void {
    if (this.hubService.$vm.currentSheet.columns[index].data != column.data
      && _.find(this.hubService.$vm.currentSheet.columns, {"data": column.data})) {
      alert(`data="${column.data}" is already exists.`);
      return;
    }
    let oldColumn: IColumn = this.hubService.$vm.currentSheet.columns[index];
    if (column.data != oldColumn.data) {
      for (let record of this.hubService.$vm.currentData) {
        Vue.set(record, column.data, record[oldColumn.data]);
        Vue.delete(record, oldColumn.data);
      }
    }
    if (column.type != "select") Vue.delete(column, "options");
    if (!_.includes(["text", "select"], column.type)) Vue.delete(column, "json");
    Vue.set(this.hubService.$vm.currentSheet.columns, index, column);
    this.hubService.$vm.currentSheetMeta.modified = true;
  }

  public move(index: number, right: boolean): void {
    let columns: IColumn[] = this.hubService.$vm.currentSheet.columns;
    if (right) {
      this.hubService.$vm.currentSheet.columns = _.concat(
        _.take(columns, index), [columns[index + 1], columns[index]], _.takeRight(columns, columns.length - index - 2));
    } else {
      this.hubService.$vm.currentSheet.columns = _.concat(
        _.take(columns, index - 1), [columns[index], columns[index - 1]], _.takeRight(columns, columns.length - index - 1));
    }
    this.hubService.$vm.currentSheetMeta.modified = true;
  }

  public remove(index: number): void {
    Vue.delete(this.hubService.$vm.currentSheet.columns, index);
    this.hubService.$vm.sheetMetas[this.hubService.$vm.currentSheet.name].modified = true;
  }

  public freeze(index: number): void {
    this.hubService.$vm.currentSheet.freezeColumn = index;
    this.hubService.$vm.currentSheetMeta.modified = true;
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
    let parentSheet = this.hubService.$vm.sheets[parentSheetName];
    let sheetColumn: IColumn = {
      header: _.startCase(sheetName),
      data: _.camelCase(sheetName),
      type: "text",
      width: 120,
    };
    return _.concat(this.generateInitialTreeColumns(parentSheet.name, parentSheet.parent), [sheetColumn])
  }

  protected generateInitialEmptyColumn(no: number = undefined): IColumn {
    no = _.isUndefined(no) ? this.hubService.$vm.currentSheet.columns.length : no;
    return {
      header: `Col${no}`,
      data: `data${no}`,
      type: "text",
      width: 80,
    };
  }

}
