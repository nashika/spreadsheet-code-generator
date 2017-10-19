import Component from "vue-class-component";
import _ = require("lodash");

import BaseComponent from "./base-component";
import {ColumnService} from "../service/column.service";
import {container} from "../inversify.config";
import {IColumn, ISheet} from "../service/hub.service";

@Component({
  props: {
    currentSheet: Object,
  },
  watch: {
    "currentSheet": ColumnComponent.prototype.watchCurrentSheet,
  }
})
export default class ColumnComponent extends BaseComponent {

  columnService: ColumnService = container.get(ColumnService);

  currentSheet: ISheet;

  columnIndex: number;
  column: IColumn;
  optionsText: string;

  created() {
    this.$on("select-column", this.onSelectColumn);
  }

  data(): any {
    return {
      columnIndex: 0,
      column: null,
      optionsText: "",
    }
  }

  add(): void {
    this.columnService.add(this.columnIndex);
  }

  modify(): void {
    let column = _.clone(this.column);
    column.options = _.split(this.optionsText, "\n");
    this.columnService.modify(this.columnIndex, column);
  }

  move(right: boolean): void {
    this.columnService.move(this.columnIndex, right);
    this.columnIndex += right ? 1 : -1;
  }

  remove(): void {
    this.columnService.remove(this.columnIndex);
    this.columnIndex = 0;
    this.column = null;
  }

  freeze(): void {
    if (this.columnIndex + 1 == this.currentSheet.freezeColumn)
      this.columnService.freeze(0);
    else
      this.columnService.freeze(this.columnIndex + 1);
  }

  onSelectColumn(index: number): void {
    this.columnIndex = index;
    this.column = _.clone(this.currentSheet.columns[index]);
    this.optionsText = _.join(this.column.options, "\n");
  }

  watchCurrentSheet(): void {
    this.column = null;
  }

}
