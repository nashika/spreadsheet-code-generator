import Component from "vue-class-component";

import {IColumnDefinition} from "./app-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("column"),
  props: {
    currentSheetDefinition: {
      required: true,
    },
  },
  events: {
    "select-column-header": "onSelectColumnHeader",
  },
})
export class ColumnComponent {
  columnDefinition:IColumnDefinition;
  colHeader:string;

  data():any {
    return {
      columnDefinition: null,
      colHeader: null,
    }
  }
  onSelectColumnHeader(index:number):void {
    this.columnDefinition = (<any>this).currentSheetDefinition.columns[index];
    this.colHeader = (<any>this).currentSheetDefinition.colHeaders[index];
  }

}
