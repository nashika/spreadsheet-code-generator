import Component from "vue-class-component";

import {BaseComponent} from "./base-component";
import {IColumnDefinition, ISheetDefinition} from "./app-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("column"),
  props: ["currentSheetDefinition"],
  events: {
    "select-column-header": "onSelectColumnHeader",
  },
  watch: {
    "currentSheetDefinition": "watchCurrentSheetDefinition",
  }
})
export class ColumnComponent extends BaseComponent {

  currentSheetDefinition:ISheetDefinition;

  columnIndex:number;
  columnDefinition:IColumnDefinition;

  data():any {
    return {
      columnDefinition: null,
    }
  }

  add():void {
    this.$root.services.sheetIo.addColumn();
  }

  save():void {
    this.$root.services.sheetIo.saveColumn(this.columnIndex, this.columnDefinition);
  }

  move(right:boolean):void {
    this.$root.services.sheetIo.moveColumn(this.columnIndex, right);
  }

  watchCurrentSheetDefinition():void {
    this.columnDefinition = null;
  }

  onSelectColumnHeader(index:number):void {
    this.columnIndex = index;
    this.columnDefinition = _.clone(this.currentSheetDefinition.columns[index]);
  }

}
