import {IColumnDefinition} from "./app-component";
import {templateLoader} from "./template-loader";

export var ColumnComponent = Vue.extend({
  template: templateLoader("column"),
  props: ["currentSheetDefinition"],
  data: ():any => { return {
  }},
  events: {
    "select-column-header": function (index:number):void {
      let columnDefinition:IColumnDefinition = this.currentSheetDefinition.columns[index];
      let colHeader:string = this.currentSheetDefinition.colHeaders[index];
      //$("#column-header").val(colHeader);
      //$("#column-data").val(columnDefinition.data);
      //$("#column-type").val(columnDefinition.type);
      //$("#column-width").val(columnDefinition.width);
    },
  },

});
