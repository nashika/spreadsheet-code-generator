import {IColumnDefinition} from "./app-component";
import {templateLoader} from "./template-loader";

export var SpreadsheetComponent = Vue.extend({
  template: templateLoader("spreadsheet"),
  props: ["currentSheetName", "currentSheetDefinition"],
  data: () => { return {
    hot: false,
  }},
  methods: {
    isLoaded: function ():boolean {
      return this.hot != null;
    },
    getJsonData: function():any[] {
      let records = this.hot.getData();
      let results:any[] = [];
      for (let record of records) {
        let result:any = {};
        for (let i = 0; i < this.currentSheetDefinition.columns.length; i++) {
          let currentColumn:IColumnDefinition = this.currentSheetDefinition.columns[i];
          let currentCellData:any = record[i];
          if (currentCellData !== null && currentCellData !== "") {
            result[currentColumn.data] = currentCellData;
          }
        }
        results.push(result);
      }
      return results;
    },
    onAfterSelection: function (r:number, c:number, r2:number, c2:number):void {
      if (r == 0 && r2 == this.hot.countRows() - 1) {
        this.$root.$broadcast("select-column-header", c);
      }
    },
  },
  events: {
    "change-sheet": function (sheetName:string):void {
      let container:HTMLElement = $(this.$el).find("#spreadsheet").get(0);
      let beforeSheetName = this.currentSheetName;
      if (this.hot) {
        this.$root.services.dataIo.save(beforeSheetName, this.getJsonData());
        this.hot.destroy();
        this.hot = null;
      }
      this.currentSheetName = sheetName;
      if (!sheetName) return;
      this.currentSheetDefinition = this.$root.services.sheetIo.load(sheetName);

      let data:any[] = this.$root.services.dataIo.load(sheetName);
      this.hot = new Handsontable(container, {
        data: data,
        columns: this.currentSheetDefinition.columns,
        rowHeaders: true,
        colHeaders: this.currentSheetDefinition.colHeaders,
        contextMenu: true,
        currentRowClassName: 'currentRow',
        currentColClassName: 'currentCol',
        afterSelection: this.onAfterSelection,
      });
    },
  }
});
