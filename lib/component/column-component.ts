import {IColumnDefinition} from "../application";
import {templateLoader} from "./template-loader";

export var ColumnComponent = Vue.extend({
  template: templateLoader("column"),
  methods: {
    selectColumn: function (index:number):void {
      let columnDefinition:IColumnDefinition = this.$root.currentSheetDefinition.columns[index];
      let colHeader:string = this.$root.currentSheetDefinition.colHeaders[index];
      $("#column-header").val(colHeader);
      $("#column-data").val(columnDefinition.data);
      $("#column-type").val(columnDefinition.type);
      $("#column-width").val(columnDefinition.width);
    },
  },

});
