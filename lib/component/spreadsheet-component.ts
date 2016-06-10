import Component from "vue-class-component";
import _ = require("lodash");

import {BaseComponent} from "./base-component";
import {IColumn, ISheet} from "./app-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("spreadsheet"),
  props: ["currentSheet", "currentData"],
  watch: {
    "currentSheet": {
      handler: SpreadsheetComponent.prototype.watchCurrentSheet,
      deep: true,
    }
  },
})
export class SpreadsheetComponent extends BaseComponent {

  currentSheet:ISheet;
  currentData:any[];

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

  watchCurrentSheet(now:ISheet, prev:ISheet):void {
    if (this.hot) {
      //prev.data = this.getJsonData();
      this.hot.destroy();
      this.hot = null;
    }
    let container:HTMLElement = $(this.$el).find("#spreadsheet").get(0);
    let sheetName:string = now && now.name;
    if (!sheetName) return;
    let data:any[] = this.currentData;
    let colHeaders:string[] = [];
    let columns:any[] = [];
    for (let c of now.columns) {
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
