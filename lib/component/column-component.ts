import Component from "vue-class-component";
import _ = require("lodash");

import {BaseComponent} from "./base-component";
import {IColumn, ISheet} from "./app-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("column"),
  props: ["currentSheet"],
  events: {
    "select-column": ColumnComponent.prototype.onSelectColumn,
  },
  watch: {
    "currentSheet": ColumnComponent.prototype.watchCurrentSheet,
  }
})
export class ColumnComponent extends BaseComponent {

  currentSheet:ISheet;

  columnIndex:number;
  column:IColumn;

  data():any {
    return {
      columnIndex: 0,
      column: null,
    }
  }

  add():void {
    this.$root.services.column.add(this.columnIndex);
  }

  modify():void {
    this.$root.services.column.modify(this.columnIndex, _.clone(this.column));
  }

  move(right:boolean):void {
    this.$root.services.column.move(this.columnIndex, right);
    this.columnIndex += right ? 1 : -1;
  }

  remove():void {
    this.$root.services.column.remove(this.columnIndex);
    this.columnIndex = 0;
    this.column = null;
  }

  freeze():void {
    if (this.columnIndex + 1 == this.currentSheet.freezeColumn)
      this.$root.services.column.freeze(0);
    else
      this.$root.services.column.freeze(this.columnIndex + 1);
  }

  onSelectColumn(index:number):void {
    this.columnIndex = index;
    this.column = _.clone(this.currentSheet.columns[index]);
  }

  watchCurrentSheet():void {
    this.column = null;
  }

}
