import Component from "vue-class-component";
import _ = require("lodash");

import {BaseComponent} from "./base-component";
import {IColumn, ISheet} from "./app-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("column"),
  props: ["currentSheet"],
  events: {
    "select-column-header": "onSelectColumnHeader",
  },
  watch: {
    "currentSheet": "watchCurrentSheet",
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
    this.$root.services.sheet.addColumn();
  }

  save():void {
    this.$root.services.sheet.saveColumn(this.columnIndex, this.column);
  }

  move(right:boolean):void {
    this.$root.services.sheet.moveColumn(this.columnIndex, right);
  }
  
  remove():void {
    this.$root.services.sheet.removeColumn(this.columnIndex);
  }

  onSelectColumnHeader(index:number):void {
    this.columnIndex = index;
    this.column = _.clone(this.currentSheet.columns[index]);
  }

  watchCurrentSheet():void {
    this.column = null;
  }

}
