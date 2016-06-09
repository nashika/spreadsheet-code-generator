import Component from "vue-class-component";

import {BaseComponent} from "./base-component";
import {IColumnDefinition, ISheetDefinition} from "./app-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("spreadsheet"),
  props: ["currentSheetDefinition"],
  events: {
    "before-change-sheet": "onBeforeChangeSheet",
  },
  watch: {
    "currentSheetDefinition": "watchCurrentSheetDefinition",
  }
})
export class SpreadsheetComponent extends BaseComponent {

  currentSheetDefinition:ISheetDefinition;

  hot:ht.Methods;

  data() {
    return {
      hot: false,
    }
  }

  getJsonData():any[] {
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
  }

  onAfterSelection(r:number, c:number, r2:number, c2:number):void {
    if (r == 0 && r2 == this.hot.countRows() - 1) {
      this.$root.$broadcast("select-column-header", c);
    }
  }

  onBeforeChangeSheet(sheetName:string, saveFlag:boolean = true):void {
    if (this.hot) {
      if (saveFlag) {
        let beforeSheetName = this.currentSheetDefinition.name;
        this.$root.$data.services.dataIo.save(beforeSheetName, this.getJsonData());
      }
      this.hot.destroy();
      this.hot = null;
    }
    this.$root.$emit("change-sheet", sheetName);
  }

  watchCurrentSheetDefinition():void {
    let container:HTMLElement = $(this.$el).find("#spreadsheet").get(0);
    let sheetName:string = this.currentSheetDefinition && this.currentSheetDefinition.name;
    if (!sheetName) return;
    let data:any[] = this.$root.$data.services.dataIo.load(sheetName);
    let colHeaders:string[] = [];
    let columns:any[] = [];
    for (let c of this.currentSheetDefinition.columns) {
      colHeaders.push(c.header);
      columns.push({
        data: c.data,
        type: c.type,
        width: c.width,
      });
    }
    this.hot = new Handsontable(container, {
      data: data,
      columns: columns,
      rowHeaders: true,
      colHeaders: colHeaders,
      contextMenu: true,
      currentRowClassName: 'currentRow',
      currentColClassName: 'currentCol',
      afterSelection: this.onAfterSelection,
    });
  }

}
