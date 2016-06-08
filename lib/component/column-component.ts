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
})
export class ColumnComponent extends BaseComponent {

  currentSheetDefinition:ISheetDefinition;
  columnDefinition:IColumnDefinition;
  colHeader:string;

  data():any {
    return {
      columnDefinition: null,
      colHeader: null,
    }
  }

  onSelectColumnHeader(index:number):void {
    this.columnDefinition = this.currentSheetDefinition.columns[index];
    this.colHeader = this.currentSheetDefinition.colHeaders[index];
  }

}
