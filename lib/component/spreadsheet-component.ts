import Component from "vue-class-component";

import {BaseComponent} from "./base-component";
import {IColumn, ISheet} from "./app-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("spreadsheet"),
  props: ["currentSheet"],
  events: {
    "before-change-sheet": "onBeforeChangeSheet",
  },
  watch: {
    "currentSheet": "watchCurrentSheet",
  }
})
export class SpreadsheetComponent extends BaseComponent {

  currentSheet:ISheet;

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
      for (let i = 0; i < this.currentSheet.columns.length; i++) {
        let column:IColumn = this.currentSheet.columns[i];
        let cellData:any = record[i];
        if (cellData !== null && cellData !== "") {
          result[column.data] = cellData;
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
        let beforeSheetName = this.currentSheet.name;
        this.$root.$data.services.dataIo.save(beforeSheetName, this.getJsonData());
      }
      this.hot.destroy();
      this.hot = null;
    }
    this.$root.$emit("change-sheet", sheetName);
  }

  watchCurrentSheet():void {
    let container:HTMLElement = $(this.$el).find("#spreadsheet").get(0);
    let sheetName:string = this.currentSheet && this.currentSheet.name;
    if (!sheetName) return;
    let data:any[] = this.$root.$data.services.dataIo.load(sheetName);
    let colHeaders:string[] = [];
    let columns:any[] = [];
    for (let c of this.currentSheet.columns) {
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
