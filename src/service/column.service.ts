export class ColumnService extends BaseHubService {
  add(index: number): void {
    let columns = this.$hub.currentSheet.columns;
    this.$hub.currentSheet.columns = _.concat(_.slice(columns, 0, index), [this.generateInitialEmptyColumn()], _.slice(columns, index));
    this.$hub.currentSheetMeta.modified = true;
  }

  modify(index: number, column: IColumn): void {
    if (this.$hub.currentSheet.columns[index].data != column.data
      && _.find(this.$hub.currentSheet.columns, {"data": column.data})) {
      alert(`data="${column.data}" is already exists.`);
      return;
    }
    let oldColumn: IColumn = this.$hub.currentSheet.columns[index];
    if (column.data != oldColumn.data) {
      for (let record of this.$hub.currentData) {
        let data = _.get(record, oldColumn.data);
        if (!_.isUndefined(data)) _.set(record, column.data, data);
        _.unset(record, oldColumn.data);
      }
    }
    if (column.type != "select") Vue.delete(column, "options");
    if (!_.includes(["text", "select"], column.type)) Vue.delete(column, "json");
    Vue.set(this.$hub.currentSheet.columns, index, column);
    this.$hub.currentSheetMeta.modified = true;
  }

  move(index: number, right: boolean): void {
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

  remove(index: number): void {
    Vue.delete(this.$hub.currentSheet.columns, index);
    this.$hub.sheetMetas[this.$hub.currentSheet.name].modified = true;
  }

  freeze(index: number): void {
    this.$hub.currentSheet.freezeColumn = index;
    this.$hub.currentSheetMeta.modified = true;
  }

}
